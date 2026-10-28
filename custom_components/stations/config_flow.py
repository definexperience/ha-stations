"""Config flow: one config entry per station."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.const import CONF_NAME
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import label_registry as lr, selector

from .const import (
    CONF_AREA_ID,
    CONF_LABEL_ID,
    DEFAULT_LABEL_COLOR,
    DEFAULT_LABEL_ICON,
    DOMAIN,
)


def _label_for_name(hass: HomeAssistant, name: str) -> str:
    """Return the id of a label with this name, creating it when needed."""
    registry = lr.async_get(hass)
    if existing := registry.async_get_label_by_name(name):
        return existing.label_id
    return registry.async_create(
        name, icon=DEFAULT_LABEL_ICON, color=DEFAULT_LABEL_COLOR
    ).label_id


class StationsConfigFlow(ConfigFlow, domain=DOMAIN):
    """Create a station."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Return the options flow."""
        return StationsOptionsFlow()

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Ask for name, label and area."""
        errors: dict[str, str] = {}
        if user_input is not None:
            name = user_input[CONF_NAME].strip()
            if not name:
                errors[CONF_NAME] = "name_required"
            else:
                label_id = user_input.get(CONF_LABEL_ID) or _label_for_name(
                    self.hass, name
                )
                await self.async_set_unique_id(label_id)
                self._abort_if_unique_id_configured()
                data = {CONF_LABEL_ID: label_id}
                if area_id := user_input.get(CONF_AREA_ID):
                    data[CONF_AREA_ID] = area_id
                return self.async_create_entry(title=name, data=data)

        schema = vol.Schema(
            {
                vol.Required(CONF_NAME): selector.TextSelector(),
                vol.Optional(CONF_LABEL_ID): selector.LabelSelector(),
                vol.Optional(CONF_AREA_ID): selector.AreaSelector(),
            }
        )
        return self.async_show_form(
            step_id="user",
            data_schema=self.add_suggested_values_to_schema(schema, user_input or {}),
            errors=errors,
        )


class StationsOptionsFlow(OptionsFlow):
    """Change which label defines the station."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Pick another label."""
        errors: dict[str, str] = {}
        entry = self.config_entry
        if user_input is not None:
            label_id = user_input[CONF_LABEL_ID]
            taken = any(
                other.unique_id == label_id and other.entry_id != entry.entry_id
                for other in self.hass.config_entries.async_entries(DOMAIN)
            )
            if taken:
                errors[CONF_LABEL_ID] = "label_in_use"
            else:
                self.hass.config_entries.async_update_entry(
                    entry,
                    unique_id=label_id,
                    data={**entry.data, CONF_LABEL_ID: label_id},
                )
                return self.async_create_entry(data={})

        schema = vol.Schema({vol.Required(CONF_LABEL_ID): selector.LabelSelector()})
        return self.async_show_form(
            step_id="init",
            data_schema=self.add_suggested_values_to_schema(
                schema, {CONF_LABEL_ID: entry.data.get(CONF_LABEL_ID)}
            ),
            errors=errors,
        )
