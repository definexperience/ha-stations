"""Base entity for station entities."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import Entity

from .const import DOMAIN
from .station import Station


class StationEntity(Entity):
    """An entity that belongs to the station device."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, station: Station, key: str) -> None:
        """Initialise the entity."""
        self._station = station
        self._attr_translation_key = key
        self._attr_unique_id = f"{station.entry_id}_{key}"
        self._attr_device_info = DeviceInfo(identifiers={(DOMAIN, station.entry_id)})

    async def async_added_to_hass(self) -> None:
        """Update whenever the station changes."""
        self.async_on_remove(self._station.add_listener(self.async_write_ha_state))
