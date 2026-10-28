"""Tests for the Stations integration."""

from __future__ import annotations

from http import HTTPStatus
import io

import aiohttp
import pytest

from homeassistant import config_entries
from homeassistant.const import STATE_UNAVAILABLE
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import (
    area_registry as ar,
    device_registry as dr,
    entity_registry as er,
    label_registry as lr,
)
from homeassistant.setup import async_setup_component

from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.stations.const import DOMAIN

PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06"
    b"\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\x0f\x00\x00\x01\x01"
    b"\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable custom integrations."""
    return


@pytest.fixture
async def setup_http(hass: HomeAssistant):
    """Set up the components the panel needs."""
    assert await async_setup_component(hass, "http", {})
    assert await async_setup_component(hass, "frontend", {})
    await hass.async_block_till_done()


def _make_device(hass, entry_id, name, label=None, entities=()):
    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)
    device = dev_reg.async_get_or_create(
        config_entry_id=entry_id,
        identifiers={("test", name)},
        name=name,
        manufacturer="Acme",
        model="X1",
    )
    if label:
        dev_reg.async_update_device(device.id, labels={label})
    ids = []
    for key in entities:
        ent = ent_reg.async_get_or_create(
            "sensor", "test", f"{name}_{key}", device_id=device.id, config_entry=None
        )
        ids.append(ent.entity_id)
    return device, ids


async def _create_station(hass, name="Desk A", **extra) -> config_entries.ConfigEntry:
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"name": name, **extra}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY, result
    await hass.async_block_till_done()
    return hass.config_entries.async_get_entry(result["result"].entry_id)


async def test_flow_creates_label_device_and_entities(hass: HomeAssistant, setup_http) -> None:
    """A new station creates its label, its own device and three entities."""
    area = ar.async_get(hass).async_create("Workshop")
    entry = await _create_station(hass, "Desk A", area_id=area.id)

    label = lr.async_get(hass).async_get_label(entry.data["label_id"])
    assert label is not None and label.name == "Desk A"
    assert entry.unique_id == label.label_id
    assert "area_id" not in entry.data  # applied once, then dropped

    device = dr.async_get(hass).async_get_device(identifiers={(DOMAIN, entry.entry_id)})
    assert device is not None
    assert device.area_id == area.id
    assert device.configuration_url == f"homeassistant://stations/{entry.entry_id}"

    assert hass.states.get("sensor.desk_a_devices").state == "0"
    assert hass.states.get("sensor.desk_a_unavailable_devices").state == "0"
    assert hass.states.get("binary_sensor.desk_a_status").state == "off"

    # Same label again is refused.
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"name": "Other", "label_id": label.label_id}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"


async def test_membership_follows_labels(hass: HomeAssistant, setup_http) -> None:
    """Adding and removing the label changes membership live."""
    entry = await _create_station(hass, "Desk A")
    label_id = entry.data["label_id"]
    other = MockConfigEntry(domain="test")
    other.add_to_hass(hass)

    dev1, ids1 = _make_device(hass, other.entry_id, "Pump", label_id, ("power", "temp"))
    dev2, ids2 = _make_device(hass, other.entry_id, "Router", None, ("rx",))
    hass.states.async_set(ids1[0], "12")
    hass.states.async_set(ids1[1], "21")
    hass.states.async_set(ids2[0], "5")
    await hass.async_block_till_done()

    state = hass.states.get("sensor.desk_a_devices")
    assert state.state == "1"
    assert state.attributes["devices"] == ["Pump"]
    assert sorted(state.attributes["entity_id"]) == sorted(ids1)

    # Label added to the router device from "outside" (e.g. the HA device page)
    dr.async_get(hass).async_update_device(dev2.id, labels={label_id})
    await hass.async_block_till_done()
    assert hass.states.get("sensor.desk_a_devices").state == "2"

    # A single entity with the label joins too
    loose = er.async_get(hass).async_get_or_create("switch", "test", "loose")
    er.async_get(hass).async_update_entity(loose.entity_id, labels={label_id})
    hass.states.async_set(loose.entity_id, "on")
    await hass.async_block_till_done()
    assert loose.entity_id in hass.states.get("sensor.desk_a_devices").attributes["entity_id"]

    # Unavailability
    hass.states.async_set(ids2[0], STATE_UNAVAILABLE)
    await hass.async_block_till_done()
    assert hass.states.get("binary_sensor.desk_a_status").state == "on"
    assert hass.states.get("sensor.desk_a_unavailable_devices").state == "1"
    assert hass.states.get("sensor.desk_a_unavailable_devices").attributes["devices"] == ["Router"]

    hass.states.async_set(ids1[0], STATE_UNAVAILABLE)  # pump only partly down
    await hass.async_block_till_done()
    assert hass.states.get("sensor.desk_a_unavailable_devices").state == "1"

    hass.states.async_set(ids2[0], "7")
    hass.states.async_set(ids1[0], "3")
    await hass.async_block_till_done()
    assert hass.states.get("binary_sensor.desk_a_status").state == "off"

    # Removing the label removes the device
    dr.async_get(hass).async_update_device(dev1.id, labels=set())
    await hass.async_block_till_done()
    assert hass.states.get("sensor.desk_a_devices").state == "1"


async def test_websocket_api(hass: HomeAssistant, setup_http, hass_ws_client) -> None:
    """List, get, docs, members, subscribe."""
    entry = await _create_station(hass, "Desk A")
    label_id = entry.data["label_id"]
    other = MockConfigEntry(domain="test")
    other.add_to_hass(hass)
    dev, ids = _make_device(hass, other.entry_id, "Pump", None, ("power",))
    await hass.async_block_till_done()

    client = await hass_ws_client(hass)

    await client.send_json_auto_id({"type": "stations/subscribe"})
    sub = await client.receive_json()
    assert sub["success"]
    sub_id = sub["id"]

    await client.send_json_auto_id({"type": "stations/list"})
    msg = await client.receive_json()
    assert msg["success"]
    assert [s["name"] for s in msg["result"]["stations"]] == ["Desk A"]
    assert msg["result"]["is_admin"] is True

    # add member through the API -> label on the device
    await client.send_json_auto_id(
        {"type": "stations/add_member", "entry_id": entry.entry_id, "device_id": dev.id}
    )
    msg = await client.receive_json()
    while msg.get("type") == "event":
        msg = await client.receive_json()
    assert msg["success"], msg
    assert label_id in dr.async_get(hass).async_get(dev.id).labels
    await hass.async_block_till_done()

    await client.send_json_auto_id({"type": "stations/get", "entry_id": entry.entry_id})
    msg = await client.receive_json()
    while msg.get("type") == "event":
        assert msg["id"] == sub_id
        msg = await client.receive_json()
    result = msg["result"]
    assert [d["name"] for d in result["devices"]] == ["Pump"]
    assert result["devices"][0]["entities"][0]["entity_id"] == ids[0]
    assert result["docs"]["markdown"] == ""

    # save docs, then a stale save is a conflict
    await client.send_json_auto_id(
        {
            "type": "stations/save_docs",
            "entry_id": entry.entry_id,
            "markdown": "# Hello",
            "base_updated_at": None,
        }
    )
    msg = await client.receive_json()
    while msg.get("type") == "event":
        msg = await client.receive_json()
    assert msg["success"], msg
    first = msg["result"]["updated_at"]

    await client.send_json_auto_id(
        {
            "type": "stations/save_docs",
            "entry_id": entry.entry_id,
            "markdown": "# Stale",
            "base_updated_at": None,
        }
    )
    msg = await client.receive_json()
    while msg.get("type") == "event":
        msg = await client.receive_json()
    assert not msg["success"]
    assert msg["error"]["code"] == "conflict"

    await client.send_json_auto_id(
        {
            "type": "stations/save_docs",
            "entry_id": entry.entry_id,
            "markdown": "# Second",
            "base_updated_at": first,
        }
    )
    msg = await client.receive_json()
    while msg.get("type") == "event":
        msg = await client.receive_json()
    assert msg["success"], msg

    # remove member
    await client.send_json_auto_id(
        {"type": "stations/remove_member", "entry_id": entry.entry_id, "device_id": dev.id}
    )
    msg = await client.receive_json()
    while msg.get("type") == "event":
        msg = await client.receive_json()
    assert msg["success"]
    assert label_id not in dr.async_get(hass).async_get(dev.id).labels

    # rename
    await client.send_json_auto_id(
        {"type": "stations/rename", "entry_id": entry.entry_id, "name": "Desk B"}
    )
    msg = await client.receive_json()
    while msg.get("type") == "event":
        msg = await client.receive_json()
    assert msg["success"]
    await hass.async_block_till_done()
    assert hass.config_entries.async_get_entry(entry.entry_id).title == "Desk B"
    await client.send_json_auto_id({"type": "stations/list"})
    msg = await client.receive_json()
    while msg.get("type") == "event":
        msg = await client.receive_json()
    assert msg["result"]["stations"][0]["name"] == "Desk B"


async def test_non_admin_cannot_change_members(
    hass: HomeAssistant, setup_http, hass_ws_client, hass_admin_user
) -> None:
    """Membership changes are admin only, docs are not."""
    entry = await _create_station(hass, "Desk A")
    hass_admin_user.groups = []
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": "stations/add_member", "entry_id": entry.entry_id, "device_id": "x"}
    )
    msg = await client.receive_json()
    assert not msg["success"]
    assert msg["error"]["code"] == "unauthorized"

    await client.send_json_auto_id(
        {"type": "stations/save_docs", "entry_id": entry.entry_id, "markdown": "ok"}
    )
    msg = await client.receive_json()
    assert msg["success"]


async def test_upload_serve_delete(
    hass: HomeAssistant, setup_http, hass_client, hass_ws_client, hass_client_no_auth
) -> None:
    """Upload a photo, get it via a signed URL, delete it; reject other types."""
    entry = await _create_station(hass, "Desk A")
    client = await hass_client()

    form = aiohttp.FormData()
    form.add_field("file", io.BytesIO(PNG), filename="front.png", content_type="image/png")
    resp = await client.post(f"/api/stations/{entry.entry_id}/files", data=form)
    assert resp.status == HTTPStatus.CREATED, await resp.text()
    file_id = (await resp.json())["id"]

    form = aiohttp.FormData()
    form.add_field("file", io.BytesIO(b"\x00\x01\x02binary"), filename="evil.exe")
    resp = await client.post(f"/api/stations/{entry.entry_id}/files", data=form)
    assert resp.status == HTTPStatus.UNSUPPORTED_MEDIA_TYPE

    form = aiohttp.FormData()
    form.add_field("file", io.BytesIO(PNG), filename="x.png")
    resp = await client.post("/api/stations/nope/files", data=form)
    assert resp.status == HTTPStatus.NOT_FOUND

    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": "stations/get", "entry_id": entry.entry_id})
    msg = await ws.receive_json()
    result = msg["result"]
    assert result["cover"] == file_id  # first image becomes the cover
    url = result["files"][0]["url"]
    assert "authSig=" in url
    assert result["cover_url"]

    anon = await hass_client_no_auth()
    resp = await anon.get(url)
    assert resp.status == HTTPStatus.OK
    assert resp.headers["Content-Type"] == "image/png"
    assert await resp.read() == PNG
    resp = await anon.get(f"/api/stations/{entry.entry_id}/files/{file_id}")
    assert resp.status == HTTPStatus.UNAUTHORIZED

    path = hass.data[DOMAIN].store.file_path(entry.entry_id, hass.data[DOMAIN].store.get_file(entry.entry_id, file_id))
    assert path.is_file()

    await ws.send_json_auto_id(
        {"type": "stations/update_file", "entry_id": entry.entry_id, "file_id": file_id, "caption": "Front"}
    )
    assert (await ws.receive_json())["success"]
    assert hass.data[DOMAIN].store.get_file(entry.entry_id, file_id)["caption"] == "Front"

    await ws.send_json_auto_id(
        {"type": "stations/delete_file", "entry_id": entry.entry_id, "file_id": file_id}
    )
    assert (await ws.receive_json())["success"]
    assert not path.exists()
    assert hass.data[DOMAIN].store.get(entry.entry_id)["cover"] is None


async def test_remove_entry_cleans_up(hass: HomeAssistant, setup_http, hass_client) -> None:
    """Removing a station deletes its docs and files, but keeps the label."""
    entry = await _create_station(hass, "Desk A")
    client = await hass_client()
    form = aiohttp.FormData()
    form.add_field("file", io.BytesIO(PNG), filename="front.png")
    resp = await client.post(f"/api/stations/{entry.entry_id}/files", data=form)
    assert resp.status == HTTPStatus.CREATED
    store = hass.data[DOMAIN].store
    folder = store.station_dir(entry.entry_id)
    assert folder.is_dir()

    await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()
    assert not folder.exists()
    assert store.get(entry.entry_id)["files"] == []
    assert lr.async_get(hass).async_get_label(entry.data["label_id"]) is not None


async def test_options_flow_changes_label(hass: HomeAssistant, setup_http) -> None:
    """The label can be swapped; a label of another station is refused."""
    a = await _create_station(hass, "Desk A")
    b = await _create_station(hass, "Desk B")
    new_label = lr.async_get(hass).async_create("Desk A v2")

    result = await hass.config_entries.options.async_init(a.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"label_id": b.data["label_id"]}
    )
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"label_id": "label_in_use"}

    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"label_id": new_label.label_id}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    entry = hass.config_entries.async_get_entry(a.entry_id)
    assert entry.data["label_id"] == new_label.label_id
    assert entry.unique_id == new_label.label_id
    assert entry.state is config_entries.ConfigEntryState.LOADED


async def test_panel_registered(hass: HomeAssistant, setup_http, hass_client) -> None:
    """The sidebar panel and its script are served."""
    await _create_station(hass, "Desk A")
    panels = hass.data["frontend_panels"]
    assert "stations" in panels
    client = await hass_client()
    resp = await client.get("/stations_static/stations-panel.js")
    assert resp.status == HTTPStatus.OK
    assert "customElements.define" in await resp.text()


async def test_device_display_settings(hass: HomeAssistant, setup_http, hass_ws_client) -> None:
    """Per-device display settings are stored, returned and can be reset."""
    entry = await _create_station(hass, "Desk A")
    other = MockConfigEntry(domain="test")
    other.add_to_hass(hass)
    dev, ids = _make_device(hass, other.entry_id, "Pump", entry.data["label_id"], ("power", "rssi"))
    dr.async_get(hass).async_update_device(
        dev.id,
        configuration_url="http://10.0.20.31/",
        merge_connections={(dr.CONNECTION_NETWORK_MAC, "aa:bb:cc:dd:ee:ff")},
    )
    await hass.async_block_till_done()
    ws = await hass_ws_client(hass)

    async def get():
        await ws.send_json_auto_id({"type": "stations/get", "entry_id": entry.entry_id})
        return (await ws.receive_json())["result"]["devices"][0]

    device = await get()
    assert device["host"] == "10.0.20.31"
    assert device["web_url"] == "http://10.0.20.31/"
    assert device["visit_url"] == "http://10.0.20.31/"
    assert device["mac"] == "aa:bb:cc:dd:ee:ff"
    assert device["display"] is None

    await ws.send_json_auto_id(
        {
            "type": "stations/set_device_display",
            "entry_id": entry.entry_id,
            "device_id": dev.id,
            "entities": [ids[1]],
            "fields": ["address", "address"],
            "note": "  port 3  ",
        }
    )
    assert (await ws.receive_json())["success"]
    device = await get()
    assert device["display"] == {"entities": [ids[1]], "fields": ["address"], "note": "port 3"}

    await ws.send_json_auto_id(
        {
            "type": "stations/set_device_display",
            "entry_id": entry.entry_id,
            "device_id": dev.id,
            "fields": ["bogus"],
        }
    )
    assert not (await ws.receive_json())["success"]

    await ws.send_json_auto_id(
        {
            "type": "stations/set_device_display",
            "entry_id": entry.entry_id,
            "device_id": dev.id,
            "reset": True,
        }
    )
    assert (await ws.receive_json())["success"]
    assert (await get())["display"] is None


async def test_power_label_mode(hass: HomeAssistant, setup_http, hass_ws_client) -> None:
    """Power on/off act on station members that carry the power labels."""
    assert await async_setup_component(hass, "homeassistant", {})
    assert await async_setup_component(
        hass, "input_boolean", {"input_boolean": {"pump": {}, "lamp": {}, "other": {}}}
    )
    entry = await _create_station(hass, "Desk A")
    label_id = entry.data["label_id"]
    lab_reg = lr.async_get(hass)
    power_on = lab_reg.async_create("power on")
    power_off = lab_reg.async_create("power off")
    ent_reg = er.async_get(hass)
    ent_reg.async_update_entity("input_boolean.pump", labels={label_id, power_on.label_id, power_off.label_id})
    ent_reg.async_update_entity("input_boolean.lamp", labels={label_id, power_on.label_id})
    # Has the power label but is not in the station: must be left alone.
    ent_reg.async_update_entity("input_boolean.other", labels={power_on.label_id})
    await hass.async_block_till_done()

    assert hass.states.get("switch.desk_a_power").state == "unavailable"

    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id(
        {
            "type": "stations/set_power",
            "entry_id": entry.entry_id,
            "on": {"mode": "label", "label_id": power_on.label_id},
            "off": {"mode": "label", "label_id": power_off.label_id},
        }
    )
    msg = await ws.receive_json()
    assert msg["success"], msg
    assert sorted(msg["result"]["targets_on"]) == ["input_boolean.lamp", "input_boolean.pump"]
    assert msg["result"]["targets_off"] == ["input_boolean.pump"]
    await hass.async_block_till_done()

    assert hass.states.get("switch.desk_a_power").state == "off"
    await hass.services.async_call(
        "switch", "turn_on", {"entity_id": "switch.desk_a_power"}, blocking=True
    )
    await hass.async_block_till_done()
    assert hass.states.get("input_boolean.pump").state == "on"
    assert hass.states.get("input_boolean.lamp").state == "on"
    assert hass.states.get("input_boolean.other").state == "off"
    assert hass.states.get("switch.desk_a_power").state == "on"

    await ws.send_json_auto_id({"type": "stations/power", "entry_id": entry.entry_id, "on": False})
    assert (await ws.receive_json())["success"]
    await hass.async_block_till_done()
    assert hass.states.get("input_boolean.pump").state == "off"
    assert hass.states.get("input_boolean.lamp").state == "on"  # not labelled "power off"

    # A new member with the label is picked up without reconfiguring.
    hass.states.async_set("sensor.ignored", "1")
    ent_reg.async_update_entity("input_boolean.other", labels={label_id, power_on.label_id})
    await hass.async_block_till_done()
    await hass.services.async_call(
        "switch", "turn_on", {"entity_id": "switch.desk_a_power"}, blocking=True
    )
    await hass.async_block_till_done()
    assert hass.states.get("input_boolean.other").state == "on"


async def test_power_entities_mode_and_fallback(hass: HomeAssistant, setup_http, hass_ws_client) -> None:
    """Explicit entities; with nothing set for off, off reverses the switchable on targets."""
    assert await async_setup_component(hass, "homeassistant", {})
    assert await async_setup_component(hass, "input_boolean", {"input_boolean": {"psu": {}}})
    assert await async_setup_component(
        hass,
        "script",
        {"script": {"boot": {"sequence": [{"action": "input_boolean.turn_on", "target": {"entity_id": "input_boolean.psu"}}]}}},
    )
    entry = await _create_station(hass, "Desk A")
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id(
        {
            "type": "stations/set_power",
            "entry_id": entry.entry_id,
            "on": {"mode": "entities", "entities": ["script.boot", "input_boolean.psu"]},
            "off": {"mode": None},
        }
    )
    msg = await ws.receive_json()
    assert msg["success"], msg
    assert msg["result"]["targets_off"] == ["input_boolean.psu"]

    await ws.send_json_auto_id({"type": "stations/power", "entry_id": entry.entry_id, "on": True})
    assert (await ws.receive_json())["success"]
    await hass.async_block_till_done()
    assert hass.states.get("input_boolean.psu").state == "on"
    assert hass.states.get("switch.desk_a_power").state == "on"

    await ws.send_json_auto_id({"type": "stations/power", "entry_id": entry.entry_id, "on": False})
    assert (await ws.receive_json())["success"]
    await hass.async_block_till_done()
    assert hass.states.get("input_boolean.psu").state == "off"
    assert hass.states.get("switch.desk_a_power").state == "off"

    # Unknown modes are rejected.
    await ws.send_json_auto_id(
        {"type": "stations/set_power", "entry_id": entry.entry_id, "on": {"mode": "bogus"}, "off": {"mode": None}}
    )
    assert not (await ws.receive_json())["success"]
