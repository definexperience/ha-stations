"""Runtime model of a single station.

A station is defined by one label. Every device that carries the label is a
member of the station, and so is every entity that carries the label directly
(handy for helpers, template sensors or a single entity of a device that
otherwise lives somewhere else).
"""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import CALLBACK_TYPE, Context, Event, HomeAssistant, callback, split_entity_id
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import (
    area_registry as ar,
    device_registry as dr,
    entity_registry as er,
    label_registry as lr,
)
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_state_change_event

from .const import CONF_LABEL_ID, DOMAIN, SIGNAL_STATIONS_CHANGED

# Entities that are "run" rather than switched: power on and power off both activate them.
ACTIVATE_SERVICES: dict[str, tuple[str, str]] = {
    "script": ("script", "turn_on"),
    "scene": ("scene", "turn_on"),
    "button": ("button", "press"),
    "input_button": ("input_button", "press"),
    "automation": ("automation", "trigger"),
}
# Domains switched when a whole *device* carries the power label.
TOGGLE_DOMAINS = {
    "switch", "light", "fan", "input_boolean", "media_player", "remote",
    "siren", "humidifier", "climate", "water_heater",
}
OFF_STATES = {"off", "standby", STATE_UNAVAILABLE, STATE_UNKNOWN}


def device_display_name(device: dr.DeviceEntry) -> str:
    """Return the name a user sees for a device."""
    return device.name_by_user or device.name or device.id


class Station:
    """A group of devices and entities that share one label."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, device_id: str) -> None:
        """Initialise the station."""
        self.hass = hass
        self.entry = entry
        self.device_id = device_id  # the station's own (virtual) device

        self.device_ids: list[str] = []
        self.device_entities: dict[str, list[str]] = {}
        self.direct_entity_ids: list[str] = []

        self._listeners: list[CALLBACK_TYPE] = []
        self._unsubs: list[CALLBACK_TYPE] = []
        self._unsub_states: CALLBACK_TYPE | None = None
        self._snapshot: Any = None
        self._power_ids: set[str] = set()

    # ------------------------------------------------------------------ props
    @property
    def entry_id(self) -> str:
        """Return the config entry id, which is also the station id."""
        return self.entry.entry_id

    @property
    def label_id(self) -> str:
        """Return the label that defines membership."""
        return self.entry.data[CONF_LABEL_ID]

    @property
    def label(self) -> lr.LabelEntry | None:
        """Return the label entry, or None if it was deleted."""
        return lr.async_get(self.hass).async_get_label(self.label_id)

    @property
    def device(self) -> dr.DeviceEntry | None:
        """Return the station's own device."""
        return dr.async_get(self.hass).async_get(self.device_id)

    @property
    def name(self) -> str:
        """Return the station name (follows renames of the station device)."""
        if device := self.device:
            return device.name_by_user or device.name or self.entry.title
        return self.entry.title

    @property
    def area(self) -> ar.AreaEntry | None:
        """Return the area of the station device."""
        if (device := self.device) and device.area_id:
            return ar.async_get(self.hass).async_get_area(device.area_id)
        return None

    @property
    def entity_ids(self) -> list[str]:
        """Return every member entity id (from member devices and direct)."""
        ids: list[str] = []
        for device_id in self.device_ids:
            ids.extend(self.device_entities.get(device_id, []))
        ids.extend(self.direct_entity_ids)
        return ids

    # -------------------------------------------------------------- lifecycle
    @callback
    def async_start(self) -> None:
        """Compute membership and start listening for changes."""
        bus = self.hass.bus
        self._unsubs = [
            bus.async_listen(dr.EVENT_DEVICE_REGISTRY_UPDATED, self._registry_changed),
            bus.async_listen(er.EVENT_ENTITY_REGISTRY_UPDATED, self._registry_changed),
            bus.async_listen(lr.EVENT_LABEL_REGISTRY_UPDATED, self._registry_changed),
            bus.async_listen(ar.EVENT_AREA_REGISTRY_UPDATED, self._registry_changed),
        ]
        self.async_refresh()

    @callback
    def async_stop(self) -> None:
        """Stop listening."""
        for unsub in self._unsubs:
            unsub()
        self._unsubs = []
        if self._unsub_states:
            self._unsub_states()
            self._unsub_states = None

    @callback
    def add_listener(self, listener: CALLBACK_TYPE) -> Callable[[], None]:
        """Register a callback that runs when membership or member states change."""
        self._listeners.append(listener)

        @callback
        def remove() -> None:
            if listener in self._listeners:
                self._listeners.remove(listener)

        return remove

    # -------------------------------------------------------------- internals
    @callback
    def _registry_changed(self, _event: Event) -> None:
        self.async_refresh()

    @callback
    def async_refresh(self, force: bool = False) -> None:
        """Recompute membership; notify everyone if anything changed."""
        dev_reg = dr.async_get(self.hass)
        ent_reg = er.async_get(self.hass)
        label_id = self.label_id

        devices = [
            device
            for device in dr.async_entries_for_label(dev_reg, label_id)
            if device.id != self.device_id
        ]
        devices.sort(key=lambda d: device_display_name(d).casefold())
        device_ids = [d.id for d in devices]
        device_id_set = set(device_ids)

        device_entities = {
            device.id: sorted(
                entry.entity_id
                for entry in er.async_entries_for_device(ent_reg, device.id)
                if not entry.disabled
            )
            for device in devices
        }
        direct = sorted(
            entry.entity_id
            for entry in er.async_entries_for_label(ent_reg, label_id)
            if not entry.disabled
            and entry.device_id not in device_id_set
            and entry.device_id != self.device_id
        )

        label = self.label
        own = self.device
        snapshot = (
            self.name,
            own.area_id if own else None,
            label.name if label else None,
            label.color if label else None,
            tuple((d.id, device_display_name(d), d.area_id) for d in devices),
            tuple((k, tuple(v)) for k, v in device_entities.items()),
            tuple(direct),
        )
        self.device_ids = device_ids
        self.device_entities = device_entities
        self.direct_entity_ids = direct
        # Power targets depend on labels of members, which the snapshot above
        # does not see; include them so a new "power on" label is picked up.
        power_ids = set(self.power_targets("on")) | set(self.power_targets("off"))
        snapshot = (*snapshot, tuple(sorted(power_ids)))
        if snapshot == self._snapshot and not force:
            return
        first_run = self._snapshot is None
        self._snapshot = snapshot
        self._power_ids = power_ids

        if self._unsub_states:
            self._unsub_states()
            self._unsub_states = None
        if tracked := sorted(set(self.entity_ids) | self._power_ids):
            self._unsub_states = async_track_state_change_event(
                self.hass, tracked, self._member_state_changed
            )

        self._notify()
        if not first_run:
            async_dispatcher_send(self.hass, SIGNAL_STATIONS_CHANGED, self.entry_id)

    @callback
    def _member_state_changed(self, event: Event) -> None:
        old = event.data.get("old_state")
        new = event.data.get("new_state")
        was = old is not None and old.state == STATE_UNAVAILABLE
        now = new is None or new.state == STATE_UNAVAILABLE
        if was != now or event.data["entity_id"] in self._power_ids:
            self._notify()

    @callback
    def _notify(self) -> None:
        for listener in list(self._listeners):
            listener()

    # ----------------------------------------------------------------- status
    def _is_unavailable(self, entity_id: str) -> bool:
        state = self.hass.states.get(entity_id)
        return state is None or state.state == STATE_UNAVAILABLE

    def unavailable_entity_ids(self) -> list[str]:
        """Return member entities that are currently unavailable."""
        return [eid for eid in self.entity_ids if self._is_unavailable(eid)]

    def unavailable_device_ids(self) -> list[str]:
        """Return member devices whose entities are all unavailable."""
        return [
            device_id
            for device_id in self.device_ids
            if (ids := self.device_entities.get(device_id))
            and all(self._is_unavailable(eid) for eid in ids)
        ]

    def device_names(self, device_ids: list[str]) -> list[str]:
        """Translate device ids to display names."""
        dev_reg = dr.async_get(self.hass)
        return [
            device_display_name(device)
            for device_id in device_ids
            if (device := dev_reg.async_get(device_id))
        ]

    # ------------------------------------------------------------------ power
    def power_config(self) -> dict[str, Any]:
        """Return the power settings: {"on": {...}, "off": {...}}."""
        store = self.hass.data[DOMAIN].store
        return store.get(self.entry_id).get("power") or {}

    def _configured_targets(self, which: str) -> list[str]:
        cfg = self.power_config().get(which) or {}
        mode = cfg.get("mode")
        if mode == "entities":
            return [eid for eid in cfg.get("entities") or [] if eid]
        if mode != "label" or not (power_label := cfg.get("label_id")):
            return []
        ent_reg = er.async_get(self.hass)
        dev_reg = dr.async_get(self.hass)
        targets: list[str] = []
        for entity_id in self.entity_ids:
            if (entry := ent_reg.async_get(entity_id)) is None:
                continue
            if power_label in entry.labels:
                targets.append(entity_id)
                continue
            device = dev_reg.async_get(entry.device_id) if entry.device_id else None
            if (
                device is not None
                and power_label in device.labels
                and entry.entity_category is None
                and split_entity_id(entity_id)[0] in TOGGLE_DOMAINS
            ):
                targets.append(entity_id)
        return targets

    def power_targets(self, which: str) -> list[str]:
        """Entities acted on for "on" or "off".

        When nothing is configured for "off", power off switches off the
        switchable targets of "on".
        """
        targets = self._configured_targets(which)
        if which == "off" and not targets and not (self.power_config().get("off") or {}).get("mode"):
            targets = [
                eid
                for eid in self._configured_targets("on")
                if split_entity_id(eid)[0] not in ACTIVATE_SERVICES
            ]
        return targets

    @property
    def power_configured(self) -> bool:
        """Return True when power on does something."""
        return bool(self.power_targets("on"))

    def power_is_on(self) -> bool | None:
        """On when any switchable power-on target is on; None if none can tell."""
        stateful = [
            eid
            for eid in self.power_targets("on")
            if split_entity_id(eid)[0] not in ACTIVATE_SERVICES
        ]
        if not stateful:
            return None
        return any(
            (state := self.hass.states.get(eid)) is not None and state.state not in OFF_STATES
            for eid in stateful
        )

    async def async_power(self, turn_on: bool, context: Context | None = None) -> None:
        """Switch the station on or off."""
        targets = self.power_targets("on" if turn_on else "off")
        if not targets:
            raise HomeAssistantError(
                f"No power {'on' if turn_on else 'off'} action is set up for {self.name}"
            )
        activate: dict[tuple[str, str], list[str]] = {}
        switch: list[str] = []
        for entity_id in targets:
            domain = split_entity_id(entity_id)[0]
            if domain in ACTIVATE_SERVICES:
                activate.setdefault(ACTIVATE_SERVICES[domain], []).append(entity_id)
            else:
                switch.append(entity_id)
        if switch:
            await self.hass.services.async_call(
                "homeassistant",
                "turn_on" if turn_on else "turn_off",
                {"entity_id": switch},
                blocking=True,
                context=context,
            )
        for (domain, service), entity_ids in activate.items():
            await self.hass.services.async_call(
                domain, service, {"entity_id": entity_ids}, blocking=True, context=context
            )
