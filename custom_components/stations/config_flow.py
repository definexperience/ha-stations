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
    CONF_POWER_OFF_LABEL,
    CONF_POWER_ON_LABEL,
    CONF_USE_DEFAULT_POWER_LABELS,
    CONF_USE_POWER_LABELS,
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


def _label_for_name(
    hass: HomeAssistant,
    name: str,
    icon: str = DEFAULT_LABEL_ICON,
    color: str | None = DEFAULT_LABEL_COLOR,
) -> str:
    """Return the id of a label with this name, creating it when needed."""
    registry = lr.async_get(hass)
    if existing := registry.async_get_label_by_name(name):
        return existing.label_id
    return registry.async_create(name, icon=icon, color=color).label_id


def _station_using_label(
    hass: HomeAssistant, label_id: str, except_entry_id: str | None = None
) -> ConfigEntry | None:
    """Return the station that is defined by this label, if any."""
    return next(
        (
            entry
            for entry in hass.config_entries.async_entries(DOMAIN)
            if entry.unique_id == label_id and entry.entry_id != except_entry_id
        ),
        None,
    )


def _existing_label_id(hass: HomeAssistant, name: str) -> str | None:
    """Return the id of a label with this name, without creating it."""
    label = lr.async_get(hass).async_get_label_by_name(name)
    return label.label_id if label else None


class StationsConfigFlow(ConfigFlow, domain=DOMAIN):
    """Create a station."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Return the options flow."""
        return StationsOptionsFlow()

    def __init__(self) -> None:
        """Start with nothing chosen."""
        self._name = ""
        self._label_id: str | None = None
        self._area_id: str | None = None

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Ask for name, label, area and whether to use power labels."""
        errors: dict[str, str] = {}
        placeholders: dict[str, str] = {"station": ""}
        if user_input is not None:
            name = user_input[CONF_NAME].strip()
            label_id = user_input.get(CONF_LABEL_ID)
            if not name:
                errors[CONF_NAME] = "name_required"
            elif label_id and (other := _station_using_label(self.hass, label_id)):
                # Keep the form open and say who has the label, rather than
                # aborting the whole flow.
                errors[CONF_LABEL_ID] = "label_in_use"
                placeholders["station"] = other.title
            elif not label_id and (
                (existing := _existing_label_id(self.hass, name))
                and (other := _station_using_label(self.hass, existing))
            ):
                errors[CONF_NAME] = "name_label_in_use"
                placeholders["station"] = other.title
            else:
                # Nothing is created until the last step, so cancelling half
                # way leaves no labels behind.
                self._name = name
                self._label_id = label_id
                self._area_id = user_input.get(CONF_AREA_ID)
                if user_input.get(CONF_USE_POWER_LABELS, True):
                    return await self.async_step_power_labels()
                return await self._async_finish(None, None)

        schema = vol.Schema(
            {
                vol.Required(CONF_NAME): selector.TextSelector(),
                vol.Optional(CONF_LABEL_ID): selector.LabelSelector(),
                vol.Optional(CONF_AREA_ID): selector.AreaSelector(),
                vol.Optional(CONF_USE_POWER_LABELS, default=True): selector.BooleanSelector(),
            }
        )
        return self.async_show_form(
            step_id="user",
            data_schema=self.add_suggested_values_to_schema(schema, user_input or {}),
            errors=errors,
            description_placeholders=placeholders,
        )

    async def async_step_power_labels(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Use the default "Power on" / "Power off" labels, or pick others."""
        if user_input is not None:
            if user_input.get(CONF_USE_DEFAULT_POWER_LABELS, True):
                return await self._async_finish(
                    self._default_label(
                        DEFAULT_POWER_ON_LABEL, POWER_ON_LABEL_ICON, POWER_ON_LABEL_COLOR
                    ),
                    self._default_label(
                        DEFAULT_POWER_OFF_LABEL, POWER_OFF_LABEL_ICON, POWER_OFF_LABEL_COLOR
                    ),
                )
            return await self.async_step_choose_power_labels()
        return self.async_show_form(
            step_id="power_labels",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_USE_DEFAULT_POWER_LABELS, default=True
                    ): selector.BooleanSelector(),
                }
            ),
            description_placeholders={"station": self._name},
        )

    async def async_step_choose_power_labels(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Pick your own power labels."""
        errors: dict[str, str] = {}
        if user_input is not None:
            on = user_input.get(CONF_POWER_ON_LABEL)
            off = user_input.get(CONF_POWER_OFF_LABEL)
            if not on and not off:
                errors["base"] = "power_label_required"
            else:
                return await self._async_finish(on, off)
        # Left empty on purpose: Home Assistant's label picker shows a
        # pre-filled label as "Unknown item".
        schema = vol.Schema(
            {
                vol.Optional(CONF_POWER_ON_LABEL): selector.LabelSelector(),
                vol.Optional(CONF_POWER_OFF_LABEL): selector.LabelSelector(),
            }
        )
        return self.async_show_form(
            step_id="choose_power_labels",
            data_schema=self.add_suggested_values_to_schema(schema, user_input or {}),
            errors=errors,
            description_placeholders={"station": self._name},
        )

    def _default_label(self, name: str, icon: str, color: str) -> str:
        return _label_for_name(self.hass, name, icon, color)

    async def _async_finish(
        self, power_on_label: str | None, power_off_label: str | None
    ) -> ConfigFlowResult:
        """Create the station label if needed, then the station."""
        label_id = self._label_id or _label_for_name(self.hass, self._name)
        await self.async_set_unique_id(label_id)
        self._abort_if_unique_id_configured()
        data: dict[str, Any] = {CONF_LABEL_ID: label_id}
        if self._area_id:
            data[CONF_AREA_ID] = self._area_id
        if power_on_label or power_off_label:
            data[CONF_POWER_ON_LABEL] = power_on_label
            data[CONF_POWER_OFF_LABEL] = power_off_label
        return self.async_create_entry(title=self._name, data=data)


class StationsOptionsFlow(OptionsFlow):
    """Change which label defines the station."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Pick another label."""
        errors: dict[str, str] = {}
        placeholders: dict[str, str] = {"station": ""}
        entry = self.config_entry
        if user_input is not None:
            label_id = user_input[CONF_LABEL_ID]
            if other := _station_using_label(self.hass, label_id, entry.entry_id):
                errors[CONF_LABEL_ID] = "label_in_use"
                placeholders["station"] = other.title
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
                schema, user_input or {CONF_LABEL_ID: entry.data.get(CONF_LABEL_ID)}
            ),
            errors=errors,
            description_placeholders=placeholders,
        )
