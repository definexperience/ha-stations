"""Stations: group devices into physical stations and document them.

Every station is a config entry with its own label. Devices and entities that
carry the label belong to the station. The integration adds a device per
station, a few status entities, and a "Stations" sidebar panel that shows the
member devices together with documentation text, photos and files.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv, device_registry as dr
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.typing import ConfigType

from .api import async_register_api
from .const import (
    CONF_AREA_ID,
    CONF_POWER_OFF_LABEL,
    CONF_POWER_ON_LABEL,
    DOMAIN,
    PANEL_URL_PATH,
    SIGNAL_STATIONS_CHANGED,
)
from .panel import async_register_panel
from .station import Station
from .store import DocsStore

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)
PLATFORMS = [Platform.SENSOR, Platform.BINARY_SENSOR, Platform.SWITCH]

type StationConfigEntry = ConfigEntry[Station]


@dataclass
class StationsData:
    """Shared state of the integration."""

    store: DocsStore
    stations: dict[str, Station] = field(default_factory=dict)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up storage, the websocket/HTTP API and the sidebar panel."""
    store = DocsStore(hass)
    await store.async_load()
    hass.data[DOMAIN] = StationsData(store=store)
    async_register_api(hass)
    await async_register_panel(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: StationConfigEntry) -> bool:
    """Set up one station."""
    dev_reg = dr.async_get(hass)
    device = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(DOMAIN, entry.entry_id)},
        name=entry.title,
        manufacturer="Stations",
        model="Station",
        configuration_url=f"homeassistant://{PANEL_URL_PATH}/{entry.entry_id}",
    )

    # The area chosen in the config flow is applied once; after that the area
    # is managed on the device like any other device.
    if area_id := entry.data.get(CONF_AREA_ID):
        device = dev_reg.async_update_device(device.id, area_id=area_id) or device
        hass.config_entries.async_update_entry(
            entry, data={k: v for k, v in entry.data.items() if k != CONF_AREA_ID}
        )

    # Likewise the power labels chosen in the config flow become the
    # station's power settings once, unless power was already set up.
    power_keys = (CONF_POWER_ON_LABEL, CONF_POWER_OFF_LABEL)
    if any(key in entry.data for key in power_keys):
        store = hass.data[DOMAIN].store
        if not store.get(entry.entry_id).get("power"):

            def _action(label_id: str | None) -> dict[str, Any]:
                return {"mode": "label", "label_id": label_id} if label_id else {"mode": None}

            await store.async_set_power(
                entry.entry_id,
                {
                    "on": _action(entry.data.get(CONF_POWER_ON_LABEL)),
                    "off": _action(entry.data.get(CONF_POWER_OFF_LABEL)),
                },
            )
        hass.config_entries.async_update_entry(
            entry, data={k: v for k, v in entry.data.items() if k not in power_keys}
        )

    station = Station(hass, entry, device.id)
    station.async_start()
    entry.runtime_data = station
    hass.data[DOMAIN].stations[entry.entry_id] = station
    entry.async_on_unload(station.async_stop)
    entry.async_on_unload(entry.add_update_listener(_async_reload))

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    async_dispatcher_send(hass, SIGNAL_STATIONS_CHANGED, entry.entry_id)
    return True


async def _async_reload(hass: HomeAssistant, entry: StationConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: StationConfigEntry) -> bool:
    """Unload a station."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        hass.data[DOMAIN].stations.pop(entry.entry_id, None)
        async_dispatcher_send(hass, SIGNAL_STATIONS_CHANGED, entry.entry_id)
    return unloaded


async def async_remove_entry(hass: HomeAssistant, entry: StationConfigEntry) -> None:
    """Delete the documentation and files of a removed station.

    The label itself is left alone: it belongs to the user and may be in use
    elsewhere (automations, dashboards).
    """
    if (data := hass.data.get(DOMAIN)) is not None:
        await data.store.async_remove_station(entry.entry_id)
