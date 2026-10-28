"""Power switch of a station."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.const import STATE_ON
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from . import StationConfigEntry
from .entity import StationEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: StationConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add the power switch."""
    async_add_entities([StationPowerSwitch(entry.runtime_data, "power")])


class StationPowerSwitch(StationEntity, SwitchEntity, RestoreEntity):
    """Runs the station's power on / power off actions.

    The state follows the switchable power-on targets. When power on only
    runs scripts or scenes, the switch remembers the last command instead.
    """

    _attr_icon = "mdi:power"
    _assumed = False

    async def async_added_to_hass(self) -> None:
        """Restore the remembered state."""
        await super().async_added_to_hass()
        if (last := await self.async_get_last_state()) is not None:
            self._assumed = last.state == STATE_ON

    @property
    def available(self) -> bool:
        """Only available once power on has been set up."""
        return self._station.power_configured

    @property
    def assumed_state(self) -> bool:
        """True when the state cannot be read from the targets."""
        return self._station.power_is_on() is None

    @property
    def is_on(self) -> bool:
        """Return the power state."""
        state = self._station.power_is_on()
        return self._assumed if state is None else state

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Show what the switch acts on."""
        return {
            "power_on_targets": self._station.power_targets("on"),
            "power_off_targets": self._station.power_targets("off"),
        }

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Run power on."""
        await self._station.async_power(True, self._context)
        self._assumed = True
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Run power off."""
        await self._station.async_power(False, self._context)
        self._assumed = False
        self.async_write_ha_state()
