"""Create several stations at once (the setup wizard in the panel).

The wizard sends the whole plan in one `stations/create_batch` call. With
`dry_run` the plan is only checked: the answer says per station what would be
created or reused, and lists problems by row, so the review step can show them
before anything changes. Without `dry_run` the same checks run first and
nothing is created when there is a problem.

Stations are created through the config flow's import step, so each one is a
normal config entry, exactly like one made in the Add integration dialog.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.config_entries import SOURCE_IMPORT
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import (
    area_registry as ar,
    device_registry as dr,
    entity_registry as er,
    label_registry as lr,
)

from .config_flow import default_label_name
from .const import (
    CONF_AREA_ID,
    CONF_LABEL_ID,
    CONF_POWER_OFF_LABEL,
    CONF_POWER_ON_LABEL,
    DEFAULT_LABEL_COLOR,
    DEFAULT_LABEL_ICON,
    DEFAULT_POWER_OFF_LABEL,
    DEFAULT_POWER_ON_LABEL,
    DOMAIN,
    POWER_OFF_LABEL_COLOR,
    POWER_OFF_LABEL_ICON,
    POWER_ON_LABEL_COLOR,
    POWER_ON_LABEL_ICON,
)

MAX_BATCH = 100

STATION_SCHEMA = vol.Schema(
    {
        vol.Required("name"): vol.All(str, vol.Strip),
        # An existing label, or the name/icon/colour of a new one. Without
        # either, the label is "Station <name>".
        vol.Optional("label_id"): vol.Any(None, str),
        vol.Optional("label_name"): vol.Any(None, vol.All(str, vol.Strip)),
        vol.Optional("label_icon"): vol.Any(None, vol.All(str, vol.Strip)),
        vol.Optional("label_color"): vol.Any(None, vol.All(str, vol.Strip)),
        # An existing area, or the name of an area to create (or reuse).
        vol.Optional("area_id"): vol.Any(None, str),
        vol.Optional("area_name"): vol.Any(None, vol.All(str, vol.Strip)),
        # A device or entity may be given to several new stations. "move"
        # takes it out of the existing station(s) it is in now; otherwise it
        # stays there as well.
        vol.Optional("devices", default=list): [
            {
                vol.Required("device_id"): str,
                vol.Optional("move", default=False): bool,
            }
        ],
        vol.Optional("entities", default=list): [
            {
                vol.Required("entity_id"): str,
                vol.Optional("move", default=False): bool,
            }
        ],
    }
)

POWER_SCHEMA = vol.Any(
    {vol.Required("mode"): vol.In(["none", "default"])},
    {
        vol.Required("mode"): "labels",
        vol.Optional("on"): vol.Any(None, str),
        vol.Optional("off"): vol.Any(None, str),
    },
)

BATCH_SCHEMA = {
    vol.Required("type"): "stations/create_batch",
    vol.Required("stations"): vol.All([STATION_SCHEMA], vol.Length(min=1, max=MAX_BATCH)),
    vol.Optional("power", default={"mode": "none"}): POWER_SCHEMA,
    vol.Optional("dry_run", default=False): bool,
}


@dataclass
class _Row:
    """One station of the plan, after checking."""

    name: str
    label_id: str | None = None  # existing label
    label_name: str = ""  # new label (or reused by name)
    label_icon: str = DEFAULT_LABEL_ICON
    label_color: str | None = DEFAULT_LABEL_COLOR
    area_id: str | None = None
    area_name: str | None = None  # new area (when area_id is None)
    devices: list[dict[str, Any]] = field(default_factory=list)
    entities: list[dict[str, Any]] = field(default_factory=list)
    moves: dict[str, list[str]] = field(default_factory=dict)  # device/entity -> station names


def _station_labels(hass: HomeAssistant) -> dict[str, str]:
    """Label id -> name of the station that uses it."""
    return {
        entry.unique_id: entry.title
        for entry in hass.config_entries.async_entries(DOMAIN)
        if entry.unique_id
    }


def _check(
    hass: HomeAssistant, stations: list[dict[str, Any]], power: dict[str, Any]
) -> tuple[list[_Row], list[dict[str, Any]]]:
    """Resolve the plan against the registries and collect problems."""
    label_reg = lr.async_get(hass)
    area_reg = ar.async_get(hass)
    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)
    in_use = _station_labels(hass)
    station_devices = {
        device.id
        for entry in hass.config_entries.async_entries(DOMAIN)
        for device in dr.async_entries_for_config_entry(dev_reg, entry.entry_id)
    }
    errors: list[dict[str, Any]] = []
    rows: list[_Row] = []
    seen_names: dict[str, int] = {}
    seen_labels: dict[str, int] = {}
    existing_names = {
        entry.title.casefold() for entry in hass.config_entries.async_entries(DOMAIN)
    }

    def error(index: int | None, field_: str, code: str, **extra: Any) -> None:
        errors.append({"row": index, "field": field_, "code": code, **extra})

    for index, spec in enumerate(stations):
        row = _Row(name=spec["name"])
        rows.append(row)
        if not row.name:
            error(index, "name", "name_required")
            continue
        key = row.name.casefold()
        if key in seen_names:
            error(index, "name", "name_duplicate", other_row=seen_names[key])
        elif key in existing_names:
            error(index, "name", "name_exists")
        seen_names.setdefault(key, index)

        # Label
        if label_id := spec.get("label_id"):
            label = label_reg.async_get_label(label_id)
            if label is None:
                error(index, "label", "label_not_found")
            else:
                row.label_id = label_id
                row.label_name = label.name
        else:
            row.label_name = spec.get("label_name") or default_label_name(row.name)
            row.label_icon = spec.get("label_icon") or DEFAULT_LABEL_ICON
            row.label_color = spec.get("label_color") or DEFAULT_LABEL_COLOR
            # A label with this name already exists: use it, like the
            # config flow does.
            if existing := label_reg.async_get_label_by_name(row.label_name):
                row.label_id = existing.label_id
                row.label_name = existing.name
        label_key = row.label_id or f"name:{row.label_name.casefold()}"
        if row.label_id and row.label_id in in_use:
            error(index, "label", "label_in_use", station=in_use[row.label_id])
        elif label_key in seen_labels and not (
            # "Station <name>" twice: the duplicate name is already reported.
            key in seen_names and seen_names[key] != index and not spec.get("label_name")
        ):
            error(index, "label", "label_duplicate", other_row=seen_labels[label_key])
        seen_labels.setdefault(label_key, index)

        # Area
        if area_id := spec.get("area_id"):
            if area_reg.async_get_area(area_id) is None:
                error(index, "area", "area_not_found")
            else:
                row.area_id = area_id
        elif area_name := spec.get("area_name"):
            if existing_area := area_reg.async_get_area_by_name(area_name):
                row.area_id = existing_area.id
            else:
                row.area_name = area_name

        # Devices and separate entities
        seen: set[str] = set()
        for item in spec["devices"]:
            device_id = item["device_id"]
            device = dev_reg.async_get(device_id)
            if device is None or device_id in station_devices:
                error(index, "devices", "device_not_found", device_id=device_id)
                continue
            if device_id in seen:
                continue
            seen.add(device_id)
            row.devices.append(item)
            others = [in_use[label] for label in device.labels if label in in_use]
            if item["move"] and others:
                row.moves[device_id] = others
        for item in spec["entities"]:
            entity_id = item["entity_id"]
            entry = ent_reg.async_get(entity_id)
            if entry is None or entry.device_id in station_devices:
                error(index, "devices", "entity_not_found", entity_id=entity_id)
                continue
            if entity_id in seen:
                continue
            seen.add(entity_id)
            row.entities.append(item)
            others = [in_use[label] for label in entry.labels if label in in_use]
            if item["move"] and others:
                row.moves[entity_id] = others

    if power["mode"] == "labels":
        for which in ("on", "off"):
            if (label_id := power.get(which)) and label_reg.async_get_label(label_id) is None:
                error(None, f"power_{which}", "label_not_found")
        if not power.get("on") and not power.get("off"):
            error(None, "power", "power_label_required")
    return rows, errors


def _power_labels(
    hass: HomeAssistant, power: dict[str, Any], create: bool
) -> tuple[str | None, str | None, list[str]]:
    """Return the power on/off label ids and the names of labels to create."""
    if power["mode"] == "labels":
        return power.get("on"), power.get("off"), []
    if power["mode"] != "default":
        return None, None, []
    label_reg = lr.async_get(hass)
    ids: list[str | None] = []
    created: list[str] = []
    for name, icon, color in (
        (DEFAULT_POWER_ON_LABEL, POWER_ON_LABEL_ICON, POWER_ON_LABEL_COLOR),
        (DEFAULT_POWER_OFF_LABEL, POWER_OFF_LABEL_ICON, POWER_OFF_LABEL_COLOR),
    ):
        if existing := label_reg.async_get_label_by_name(name):
            ids.append(existing.label_id)
            continue
        created.append(name)
        ids.append(label_reg.async_create(name, icon=icon, color=color).label_id if create else None)
    return ids[0], ids[1], created


def _plan(row: _Row) -> dict[str, Any]:
    return {
        "name": row.name,
        "label_id": row.label_id,
        "label_name": row.label_name,
        "label_icon": row.label_icon,
        "label_color": row.label_color,
        "label_created": row.label_id is None,
        "area_id": row.area_id,
        "area_name": row.area_name,
        "area_created": row.area_name is not None,
        "devices": [item["device_id"] for item in row.devices],
        "entities": [item["entity_id"] for item in row.entities],
        "moves": row.moves,
    }


async def async_create_batch(
    hass: HomeAssistant, msg: dict[str, Any]
) -> dict[str, Any]:
    """Check, and unless it's a dry run, create the stations."""
    power = msg["power"]
    rows, errors = _check(hass, msg["stations"], power)
    dry_run = msg["dry_run"] or bool(errors)
    power_on, power_off, power_created = _power_labels(hass, power, create=not dry_run)
    result: dict[str, Any] = {
        "created": False,
        "errors": errors,
        "power_labels_created": power_created,
        "stations": [_plan(row) for row in rows],
    }
    if dry_run:
        return result

    label_reg = lr.async_get(hass)
    area_reg = ar.async_get(hass)
    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)
    # Only labels of stations that existed before: "move" never takes a
    # device out of another station made in this same batch.
    existing = set(_station_labels(hass))
    for row, plan in zip(rows, result["stations"], strict=True):
        if row.label_id is None:
            row.label_id = label_reg.async_create(
                row.label_name, icon=row.label_icon, color=row.label_color
            ).label_id
            plan["label_id"] = row.label_id
        if row.area_id is None and row.area_name:
            row.area_id = area_reg.async_create(row.area_name).id
            plan["area_id"] = row.area_id
        data: dict[str, Any] = {"name": row.name, CONF_LABEL_ID: row.label_id}
        if row.area_id:
            data[CONF_AREA_ID] = row.area_id
        if power_on or power_off:
            data[CONF_POWER_ON_LABEL] = power_on
            data[CONF_POWER_OFF_LABEL] = power_off
        flow = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": SOURCE_IMPORT}, data=data
        )
        if flow["type"] is not FlowResultType.CREATE_ENTRY:
            plan["error"] = flow.get("reason", "not_created")
            continue
        plan["entry_id"] = flow["result"].entry_id

        def _labels(current: set[str], move: bool, label_id: str = row.label_id) -> set[str]:
            labels = {lb for lb in current if lb not in existing} if move else set(current)
            return labels | {label_id}

        for item in row.devices:
            if (device := dev_reg.async_get(item["device_id"])) is not None:
                dev_reg.async_update_device(
                    device.id, labels=_labels(device.labels, item["move"])
                )
        for item in row.entities:
            if (entry := ent_reg.async_get(item["entity_id"])) is not None:
                ent_reg.async_update_entity(
                    entry.entity_id, labels=_labels(entry.labels, item["move"])
                )
    result["created"] = True
    return result


@websocket_api.websocket_command(BATCH_SCHEMA)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_create_batch(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Check or create several stations, with their labels, areas and devices."""
    connection.send_result(msg["id"], await async_create_batch(hass, msg))
