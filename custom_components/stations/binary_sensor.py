"""Problem sensor of a station."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import StationConfigEntry
from .entity import StationEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: StationConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add the problem sensor."""
    async_add_entities([StationProblemSensor(entry.runtime_data, "problem")])


class StationProblemSensor(StationEntity, BinarySensorEntity):
    """On when any member entity is unavailable."""

    _attr_device_class = BinarySensorDeviceClass.PROBLEM
    _unrecorded_attributes = frozenset({"unavailable_entities"})

    @property
    def is_on(self) -> bool:
        """Return True when something in the station is unavailable."""
        return bool(self._station.unavailable_entity_ids())

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return which entities are unavailable."""
        return {"unavailable_entities": self._station.unavailable_entity_ids()}
