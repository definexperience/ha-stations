"""Websocket commands and HTTP views used by the Stations panel."""

from __future__ import annotations

from datetime import timedelta
from http import HTTPStatus
import secrets
from typing import TYPE_CHECKING, Any
from urllib.parse import quote, urlparse

from aiohttp import web
import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.components.http import HomeAssistantView
from homeassistant.components.http.auth import async_sign_path
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import (
    area_registry as ar,
    device_registry as dr,
    entity_registry as er,
    floor_registry as fr,
)
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)

from .const import (
    ALLOWED_CONTENT_TYPES,
    DOMAIN,
    MAX_UPLOAD_BYTES,
    SIGNAL_STATIONS_CHANGED,
)
from .station import device_display_name
from .store import RESIZABLE_TYPES

if TYPE_CHECKING:
    from . import StationsData
    from .station import Station

SIGNED_URL_LIFETIME = timedelta(hours=24)

ERR_NOT_FOUND = "not_found"
ERR_CONFLICT = "conflict"
ERR_INVALID = "invalid"


# --------------------------------------------------------------------- helpers
def _data(hass: HomeAssistant) -> StationsData:
    return hass.data[DOMAIN]


def _station(hass: HomeAssistant, entry_id: str) -> Station | None:
    return _data(hass).stations.get(entry_id)


def _user_name(hass_user: Any) -> str | None:
    return getattr(hass_user, "name", None)


def _file_url(entry_id: str, file_id: str) -> str:
    return f"/api/stations/{entry_id}/files/{file_id}"


def _signed(hass: HomeAssistant, connection: websocket_api.ActiveConnection, path: str) -> str:
    return async_sign_path(
        hass, path, SIGNED_URL_LIFETIME, refresh_token_id=connection.refresh_token_id
    )


def _public_file(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    entry_id: str,
    record: dict[str, Any],
) -> dict[str, Any]:
    return {
        "id": record["id"],
        "filename": record["filename"],
        "content_type": record["content_type"],
        "size": record["size"],
        "caption": record["caption"],
        "uploaded_at": record["uploaded_at"],
        "uploaded_by": record["uploaded_by"],
        "url": _signed(hass, connection, _file_url(entry_id, record["id"])),
        "small_url": _signed(
            hass, connection, f"{_file_url(entry_id, record['id'])}?size=small"
        )
        if record["content_type"] in RESIZABLE_TYPES
        else None,
    }


def _summary(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    station: Station,
) -> dict[str, Any]:
    doc = _data(hass).store.get(station.entry_id)
    label = station.label
    area = station.area
    floor = (
        fr.async_get(hass).async_get_floor(area.floor_id)
        if area and area.floor_id
        else None
    )
    cover = doc["cover"]
    return {
        "entry_id": station.entry_id,
        "name": station.name,
        "device_id": station.device_id,
        "area_id": area.id if area else None,
        "area_name": area.name if area else None,
        "floor_id": floor.floor_id if floor else None,
        "floor_name": floor.name if floor else None,
        "floor_level": floor.level if floor else None,
        "label_id": station.label_id,
        "label_name": label.name if label else None,
        "label_color": label.color if label else None,
        "label_icon": label.icon if label else None,
        "label_missing": label is None,
        "device_ids": station.device_ids,
        "device_entities": station.device_entities,
        "direct_entity_ids": station.direct_entity_ids,
        "has_docs": bool(doc["markdown"].strip()),
        "file_count": len(doc["files"]),
        "updated_at": doc["updated_at"],
        "cover_url": _signed(hass, connection, _file_url(station.entry_id, cover))
        if cover
        else None,
        "cover_small_url": _signed(
            hass, connection, f"{_file_url(station.entry_id, cover)}?size=small"
        )
        if cover
        else None,
    }


def _entity_info(
    ent_reg: er.EntityRegistry, entity_id: str, device_name: str | None
) -> dict[str, Any]:
    entry = ent_reg.async_get(entity_id)
    if entry is None:
        return {"entity_id": entity_id, "name": None, "category": None, "hidden": False}
    name = entry.name or entry.original_name
    if name is None and entry.has_entity_name:
        name = device_name
    return {
        "entity_id": entity_id,
        "name": name,
        "category": entry.entity_category.value if entry.entity_category else None,
        "hidden": entry.hidden_by is not None,
        "icon": entry.icon or entry.original_icon,
        "device_id": entry.device_id,
    }


def _device_addresses(device: dr.DeviceEntry) -> dict[str, Any]:
    """Return the network addresses Home Assistant knows for a device."""
    web_url = host = None
    url = device.configuration_url
    if url:
        parsed = urlparse(url)
        if parsed.scheme in ("http", "https") and parsed.hostname:
            web_url = url
            host = parsed.hostname
    connections = {kind: value for kind, value in device.connections}
    # Same link as the "Visit" button on the Home Assistant device page:
    # a web address, or a page inside Home Assistant (homeassistant://...).
    visit_url = None
    if url and urlparse(url).scheme in ("http", "https", "homeassistant"):
        visit_url = url
    return {
        "visit_url": visit_url,
        "web_url": web_url,
        "host": host,
        "mac": connections.get(dr.CONNECTION_NETWORK_MAC),
        "ieee": connections.get(dr.CONNECTION_ZIGBEE),
    }


# ---------------------------------------------------------------- registration
@callback
def async_register_api(hass: HomeAssistant) -> None:
    """Register websocket commands and HTTP views."""
    for command in (
        ws_list,
        ws_get,
        ws_subscribe,
        ws_save_docs,
        ws_update_file,
        ws_move_file,
        ws_delete_file,
        ws_set_cover,
        ws_add_member,
        ws_remove_member,
        ws_rename,
        ws_set_device_display,
        ws_set_power,
        ws_power,
    ):
        websocket_api.async_register_command(hass, command)
    hass.http.register_view(StationsFilesView())
    hass.http.register_view(StationsFileView())


# ------------------------------------------------------------------ websocket
@websocket_api.websocket_command({vol.Required("type"): "stations/list"})
@callback
def ws_list(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """List all stations."""
    stations = sorted(
        _data(hass).stations.values(), key=lambda s: s.name.casefold()
    )
    connection.send_result(
        msg["id"],
        {
            "stations": [_summary(hass, connection, s) for s in stations],
            "is_admin": connection.user.is_admin,
        },
    )


@websocket_api.websocket_command(
    {vol.Required("type"): "stations/get", vol.Required("entry_id"): str}
)
@callback
def ws_get(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return everything about one station."""
    if (station := _station(hass, msg["entry_id"])) is None:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "Station not found")
        return

    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)
    area_reg = ar.async_get(hass)

    display = _data(hass).store.get(station.entry_id).get("device_display", {})
    devices = []
    for device_id in station.device_ids:
        if (device := dev_reg.async_get(device_id)) is None:
            continue
        name = device_display_name(device)
        area = area_reg.async_get_area(device.area_id) if device.area_id else None
        devices.append(
            {
                "id": device.id,
                "name": name,
                "manufacturer": device.manufacturer,
                "model": device.model,
                "model_id": device.model_id,
                "serial_number": device.serial_number,
                "sw_version": device.sw_version,
                "hw_version": device.hw_version,
                "area_name": area.name if area else None,
                **_device_addresses(device),
                "display": display.get(device.id),
                "entities": [
                    _entity_info(ent_reg, eid, name)
                    for eid in station.device_entities.get(device_id, [])
                ],
            }
        )

    direct = []
    for entity_id in station.direct_entity_ids:
        entry = ent_reg.async_get(entity_id)
        device = dev_reg.async_get(entry.device_id) if entry and entry.device_id else None
        info = _entity_info(ent_reg, entity_id, device_display_name(device) if device else None)
        info["device_name"] = device_display_name(device) if device else None
        direct.append(info)

    doc = _data(hass).store.get(station.entry_id)
    connection.send_result(
        msg["id"],
        {
            **_summary(hass, connection, station),
            "devices": devices,
            "direct_entities": direct,
            "docs": {
                "markdown": doc["markdown"],
                "updated_at": doc["updated_at"],
                "updated_by": doc["updated_by"],
            },
            "cover": doc["cover"],
            "files": [
                _public_file(hass, connection, station.entry_id, f) for f in doc["files"]
            ],
            "power": _power_info(station),
            "is_admin": connection.user.is_admin,
        },
    )


def _power_info(station: Station) -> dict[str, Any]:
    config = station.power_config()
    return {
        "on": config.get("on") or {"mode": None},
        "off": config.get("off") or {"mode": None},
        "targets_on": station.power_targets("on"),
        "targets_off": station.power_targets("off"),
        "configured": station.power_configured,
    }


@websocket_api.websocket_command({vol.Required("type"): "stations/subscribe"})
@callback
def ws_subscribe(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Push a message whenever a station changes."""

    @callback
    def changed(entry_id: str) -> None:
        connection.send_message(
            websocket_api.event_message(msg["id"], {"entry_id": entry_id})
        )

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(
        hass, SIGNAL_STATIONS_CHANGED, changed
    )
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "stations/save_docs",
        vol.Required("entry_id"): str,
        vol.Required("markdown"): str,
        # updated_at the editor started from; used to detect concurrent edits
        vol.Optional("base_updated_at"): vol.Any(str, None),
        vol.Optional("force", default=False): bool,
    }
)
@websocket_api.async_response
async def ws_save_docs(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Save the documentation text."""
    entry_id = msg["entry_id"]
    if _station(hass, entry_id) is None:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "Station not found")
        return
    store = _data(hass).store
    current = store.get(entry_id)
    if (
        not msg["force"]
        and "base_updated_at" in msg
        and msg["base_updated_at"] != current["updated_at"]
    ):
        connection.send_error(
            msg["id"],
            ERR_CONFLICT,
            f"Changed by {current['updated_by'] or 'someone else'} while you were editing",
        )
        return
    doc = await store.async_set_markdown(
        entry_id, msg["markdown"], _user_name(connection.user)
    )
    async_dispatcher_send(hass, SIGNAL_STATIONS_CHANGED, entry_id)
    connection.send_result(
        msg["id"], {"updated_at": doc["updated_at"], "updated_by": doc["updated_by"]}
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "stations/update_file",
        vol.Required("entry_id"): str,
        vol.Required("file_id"): str,
        vol.Required("caption"): str,
    }
)
@websocket_api.async_response
async def ws_update_file(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Change a file caption."""
    record = await _data(hass).store.async_update_file(
        msg["entry_id"], msg["file_id"], msg["caption"].strip()
    )
    if record is None:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "File not found")
        return
    async_dispatcher_send(hass, SIGNAL_STATIONS_CHANGED, msg["entry_id"])
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "stations/move_file",
        vol.Required("entry_id"): str,
        vol.Required("file_id"): str,
        vol.Required("index"): vol.All(int, vol.Range(min=0)),
    }
)
@websocket_api.async_response
async def ws_move_file(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Reorder the gallery."""
    if not await _data(hass).store.async_move_file(
        msg["entry_id"], msg["file_id"], msg["index"]
    ):
        connection.send_error(msg["id"], ERR_NOT_FOUND, "File not found")
        return
    async_dispatcher_send(hass, SIGNAL_STATIONS_CHANGED, msg["entry_id"])
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "stations/delete_file",
        vol.Required("entry_id"): str,
        vol.Required("file_id"): str,
    }
)
@websocket_api.async_response
async def ws_delete_file(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Delete a file."""
    if not await _data(hass).store.async_delete_file(msg["entry_id"], msg["file_id"]):
        connection.send_error(msg["id"], ERR_NOT_FOUND, "File not found")
        return
    async_dispatcher_send(hass, SIGNAL_STATIONS_CHANGED, msg["entry_id"])
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "stations/set_cover",
        vol.Required("entry_id"): str,
        vol.Required("file_id"): vol.Any(str, None),
    }
)
@websocket_api.async_response
async def ws_set_cover(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Choose the cover photo."""
    if not await _data(hass).store.async_set_cover(msg["entry_id"], msg["file_id"]):
        connection.send_error(msg["id"], ERR_INVALID, "Not an image of this station")
        return
    async_dispatcher_send(hass, SIGNAL_STATIONS_CHANGED, msg["entry_id"])
    connection.send_result(msg["id"])


MEMBER_SCHEMA = {
    vol.Required("entry_id"): str,
    vol.Exclusive("device_id", "member"): str,
    vol.Exclusive("entity_id", "member"): str,
}


def _change_label(
    hass: HomeAssistant, station: Station, msg: dict[str, Any], add: bool
) -> bool:
    """Add or remove the station label on a device or entity."""
    label_id = station.label_id
    if device_id := msg.get("device_id"):
        dev_reg = dr.async_get(hass)
        if (device := dev_reg.async_get(device_id)) is None or device_id == station.device_id:
            return False
        labels = set(device.labels)
        labels = labels | {label_id} if add else labels - {label_id}
        dev_reg.async_update_device(device_id, labels=labels)
        return True
    if entity_id := msg.get("entity_id"):
        ent_reg = er.async_get(hass)
        if (entry := ent_reg.async_get(entity_id)) is None:
            return False
        labels = set(entry.labels)
        labels = labels | {label_id} if add else labels - {label_id}
        ent_reg.async_update_entity(entity_id, labels=labels)
        return True
    return False


@websocket_api.websocket_command({vol.Required("type"): "stations/add_member", **MEMBER_SCHEMA})
@websocket_api.require_admin
@callback
def ws_add_member(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Put a device or entity in a station by giving it the station label."""
    if (station := _station(hass, msg["entry_id"])) is None or station.label is None:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "Station or its label not found")
        return
    if not _change_label(hass, station, msg, add=True):
        connection.send_error(msg["id"], ERR_NOT_FOUND, "Device or entity not found")
        return
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {vol.Required("type"): "stations/remove_member", **MEMBER_SCHEMA}
)
@websocket_api.require_admin
@callback
def ws_remove_member(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Take a device or entity out of a station by removing the station label."""
    if (station := _station(hass, msg["entry_id"])) is None:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "Station not found")
        return
    if not _change_label(hass, station, msg, add=False):
        connection.send_error(msg["id"], ERR_NOT_FOUND, "Device or entity not found")
        return
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "stations/rename",
        vol.Required("entry_id"): str,
        vol.Required("name"): vol.All(str, vol.Strip, vol.Length(min=1)),
    }
)
@websocket_api.require_admin
@callback
def ws_rename(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Rename a station (its device and its config entry)."""
    if (station := _station(hass, msg["entry_id"])) is None:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "Station not found")
        return
    name = msg["name"]
    # Changing the title triggers no reload: the update listener only fires on
    # data/options changes, and the device rename is picked up live.
    hass.config_entries.async_update_entry(station.entry, title=name)
    dr.async_get(hass).async_update_device(station.device_id, name_by_user=name)
    connection.send_result(msg["id"])


DISPLAY_FIELDS = ("address", "mac", "ieee", "serial", "firmware", "hardware")


@websocket_api.websocket_command(
    {
        vol.Required("type"): "stations/set_device_display",
        vol.Required("entry_id"): str,
        vol.Required("device_id"): str,
        # None = default (primary entities); a list = exactly these, in this order
        vol.Optional("entities"): vol.Any(None, [str]),
        vol.Optional("fields", default=[]): [vol.In(DISPLAY_FIELDS)],
        vol.Optional("note", default=""): vol.All(str, vol.Strip, vol.Length(max=500)),
        # True removes the custom settings and goes back to the default view
        vol.Optional("reset", default=False): bool,
    }
)
@websocket_api.async_response
async def ws_set_device_display(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Choose what the station page shows for one device."""
    entry_id = msg["entry_id"]
    if _station(hass, entry_id) is None:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "Station not found")
        return
    settings = None
    if not msg["reset"]:
        settings = {
            "entities": msg.get("entities"),
            "fields": list(dict.fromkeys(msg["fields"])),
            "note": msg["note"],
        }
    await _data(hass).store.async_set_device_display(entry_id, msg["device_id"], settings)
    async_dispatcher_send(hass, SIGNAL_STATIONS_CHANGED, entry_id)
    connection.send_result(msg["id"])


POWER_ACTION_SCHEMA = vol.Any(
    {vol.Required("mode"): None},
    {vol.Required("mode"): "label", vol.Required("label_id"): str},
    {vol.Required("mode"): "entities", vol.Required("entities"): [str]},
)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "stations/set_power",
        vol.Required("entry_id"): str,
        vol.Required("on"): POWER_ACTION_SCHEMA,
        vol.Required("off"): POWER_ACTION_SCHEMA,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_set_power(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Choose what power on and power off do."""
    if (station := _station(hass, msg["entry_id"])) is None:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "Station not found")
        return
    await _data(hass).store.async_set_power(
        station.entry_id, {"on": msg["on"], "off": msg["off"]}
    )
    station.async_refresh(force=True)
    async_dispatcher_send(hass, SIGNAL_STATIONS_CHANGED, station.entry_id)
    connection.send_result(msg["id"], _power_info(station))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "stations/power",
        vol.Required("entry_id"): str,
        vol.Required("on"): bool,
    }
)
@websocket_api.async_response
async def ws_power(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Switch a station on or off."""
    if (station := _station(hass, msg["entry_id"])) is None:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "Station not found")
        return
    try:
        await station.async_power(msg["on"], connection.context(msg))
    except HomeAssistantError as err:
        connection.send_error(msg["id"], ERR_INVALID, str(err))
        return
    connection.send_result(msg["id"])


# ----------------------------------------------------------------------- HTTP
def _sniff(data: bytes) -> str | None:
    """Detect the real type of an upload from its first bytes."""
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return "image/gif"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    if data.startswith(b"%PDF-"):
        return "application/pdf"
    head = data[:4096]
    try:
        text = head.decode("utf-8")
    except UnicodeDecodeError:
        # A multi-byte character may be cut off at the 4 kB boundary.
        try:
            text = head[:-3].decode("utf-8")
        except UnicodeDecodeError:
            return None
    if any(ord(c) < 32 and c not in "\t\n\r\f" for c in text):
        return None
    return "text/plain"


class StationsFilesView(HomeAssistantView):
    """Upload a photo or document to a station."""

    url = "/api/stations/{entry_id}/files"
    name = "api:stations:files"

    async def post(self, request: web.Request, entry_id: str) -> web.Response:
        """Handle a multipart upload with a `file` field and optional `caption`."""
        hass: HomeAssistant = request.app["hass"]
        if _station(hass, entry_id) is None:
            return self.json_message("Station not found", HTTPStatus.NOT_FOUND)

        reader = await request.multipart()
        filename: str | None = None
        caption = ""
        data = bytearray()
        while (part := await reader.next()) is not None:
            if part.name == "caption":
                caption = (await part.text()).strip()[:500]
            elif part.name == "file":
                filename = (part.filename or "file").replace("/", "_").replace("\\", "_")
                while chunk := await part.read_chunk(256 * 1024):
                    data.extend(chunk)
                    if len(data) > MAX_UPLOAD_BYTES:
                        return self.json_message(
                            f"File is larger than {MAX_UPLOAD_BYTES // (1024 * 1024)} MB",
                            HTTPStatus.REQUEST_ENTITY_TOO_LARGE,
                        )
        if filename is None or not data:
            return self.json_message("No file received", HTTPStatus.BAD_REQUEST)

        content_type = _sniff(bytes(data[:4096]))
        if content_type not in ALLOWED_CONTENT_TYPES:
            return self.json_message(
                "Only photos (JPEG, PNG, GIF, WebP), PDF and plain text files are allowed",
                HTTPStatus.UNSUPPORTED_MEDIA_TYPE,
            )

        record = await _data(hass).store.async_add_file(
            entry_id,
            secrets.token_hex(8),
            filename=filename[:200],
            content_type=content_type,
            ext=ALLOWED_CONTENT_TYPES[content_type],
            size=len(data),
            caption=caption,
            user=_user_name(request.get("hass_user")),
            data=bytes(data),
        )
        async_dispatcher_send(hass, SIGNAL_STATIONS_CHANGED, entry_id)
        return self.json({"id": record["id"]}, HTTPStatus.CREATED)


class StationsFileView(HomeAssistantView):
    """Serve a stored file (authenticated, or via a signed URL)."""

    url = "/api/stations/{entry_id}/files/{file_id}"
    name = "api:stations:file"

    async def get(
        self, request: web.Request, entry_id: str, file_id: str
    ) -> web.StreamResponse:
        """Return the file."""
        hass: HomeAssistant = request.app["hass"]
        store = _data(hass).store
        if (record := store.get_file(entry_id, file_id)) is None:
            return self.json_message("File not found", HTTPStatus.NOT_FOUND)
        path = store.file_path(entry_id, record)
        if not await hass.async_add_executor_job(path.is_file):
            return self.json_message("File missing on disk", HTTPStatus.NOT_FOUND)
        if request.query.get("size") == "small" and (
            small := await store.async_small_image(entry_id, record)
        ):
            return web.FileResponse(
                small,
                headers={
                    "Content-Type": "image/jpeg",
                    "X-Content-Type-Options": "nosniff",
                    "Cache-Control": "private, max-age=86400",
                },
            )
        headers = {
            "Content-Type": record["content_type"],
            "Content-Disposition": f"inline; filename*=UTF-8''{quote(record['filename'])}",
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "private, max-age=86400",
        }
        if record["content_type"] == "text/plain":
            headers["Content-Type"] = "text/plain; charset=utf-8"
            headers["Content-Security-Policy"] = "default-src 'none'; sandbox"
        return web.FileResponse(path, headers=headers)
