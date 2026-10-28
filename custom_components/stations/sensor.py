"""Sensors of a station."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import StationConfigEntry
from .entity import StationEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: StationConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add the sensors."""
    station = entry.runtime_data
    async_add_entities(
        [
            StationDevicesSensor(station, "devices"),
            StationUnavailableDevicesSensor(station, "unavailable_devices"),
        ]
    )


class StationDevicesSensor(StationEntity, SensorEntity):
    """Number of member devices.

    The `entity_id` attribute lists every member entity, so templates can use
    `expand('sensor.<station>_devices')` like they would with a group.
    """

    _attr_icon = "stations:logo"
    _attr_native_unit_of_measurement = "devices"
    _unrecorded_attributes = frozenset({"entity_id", "devices"})

    @property
    def native_value(self) -> int:
        """Return the number of member devices."""
        return len(self._station.device_ids)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return member names and entity ids."""
        station = self._station
        return {
            "label_id": station.label_id,
            "devices": station.device_names(station.device_ids),
            "entity_id": station.entity_ids,
        }


class StationUnavailableDevicesSensor(StationEntity, SensorEntity):
    """Number of member devices that are completely unavailable."""

    _attr_icon = "mdi:lan-disconnect"
    _attr_native_unit_of_measurement = "devices"
    _unrecorded_attributes = frozenset({"devices"})

    @property
    def native_value(self) -> int:
        """Return the number of unavailable devices."""
        return len(self._station.unavailable_device_ids())

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the names of the unavailable devices."""
        station = self._station
        return {"devices": station.device_names(station.unavailable_device_ids())}
