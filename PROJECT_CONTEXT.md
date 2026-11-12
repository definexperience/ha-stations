# Stations: project context

Hand-over document for continuing development of the **Stations** custom integration for Home Assistant.
It records what exists, why it was built this way, and what the user asked for. Current version: **1.4.0**.

## 1. The goal

The user (Dutch, works with Home Assistant installations at customer locations, mostly technical users) wants Home Assistant to be the **single point of reference** for "stations": pieces of furniture (cabinets, desks, workbenches) that contain several devices. Per station they want:

- one place that lists all devices in the station, with live status;
- documentation: text and photos (also PDFs such as datasheets);
- power the whole station on / off;
- 2–30 stations per installation.

## 2. Key decisions (agreed with the user)

| Topic | Decision |
|---|---|
| Membership | **Labels.** Each station is linked to one Home Assistant label. Every device with that label is a member; an entity with the label (without its device) is a member too. The "Add" button in the panel only adds/removes the label, so membership is always visible and editable from Home Assistant itself. |
| One station = | One config entry (`stations` domain). Its label id is the config entry's `unique_id`. A label can belong to only one station. |
| Station device | Each station gets its own device (manufacturer "Stations", model "Station"), `configuration_url = homeassistant://stations/<entry_id>`, so the device page has a "Visit" link to the station page. |
| Area | Optional in the config flow; applied once to the station device, then managed on the device as normal. |
| Removing a station | Deletes its docs and files; **keeps the label** (may be used elsewhere). |
| Permissions | All users: view, edit docs, upload/caption/reorder/delete files, choose what to show per device, power on/off. Admin only: add/remove members, rename, power settings, create/remove stations. |
| Availability | Purely from Home Assistant entity state `unavailable`. Device = unavailable if all entities unavailable, partly if some, available if none. Disabled entities are ignored. Stations never polls devices. (User has MQTT devices; explained that MQTT availability topics/payloads or `expire_after` must be configured for this to work.) |
| Default device view | **No entities shown by default** (user request). A device row shows name, manufacturer · model, status and a "Visit" link; all entities collapsed under "n more". |
| Per-device display | "Choose what to show" (sliders button): tick device info fields (IP/web address, MAC, Zigbee address, serial, firmware, hardware), tick entities and set their order, add a one-line note. Stored per station per device, shared by all users. "Back to default" removes it. |
| Visit link | Each device row shows a "Visit" link when the device has a `configuration_url` (http/https opens in new tab; `homeassistant://…` navigates inside HA). Icon-only on phones. |
| Power | Per station, separately for on and off: "not used" / "everything in this station with label X" / "these entities and scripts". Off can also be "switch off what Power on switched on". Scripts, scenes, buttons, input_buttons, automations are *run*; everything else gets `homeassistant.turn_on/turn_off`. Label mode only affects members of that station, so one pair of labels (`power on`, `power off` — the user's existing convention) works for every station. A label on a device selects its switch-like entities (switch, light, fan, input_boolean, media_player, remote, siren, humidifier, climate, water_heater) that have no entity category. Ordered sequences → put them in a script. Panel buttons ask for confirmation. |
| Setup wizard (1.4.0b1, b2) | "+ Station" in the panel opens a 4-step wizard at `/stations/new` (stations table → power labels → devices → review). Paste rows from a spreadsheet (name, area, label). New labels default to "Station <name>", icon `stations:logo`, colour indigo; all changeable per row, or pick an existing label. Missing areas are created. Devices step (1.4.0b3): station tiles on top, select one, then click devices / separate entities (expand a device for single entities). Order: free, in an existing station, assigned in the wizard. A device may go to several stations (warning ⚠). For something already in an existing station the wizard asks keep or move. No "suggest by area" (user dropped it). Back/Next sit between the tiles and the list (1.4.0b4), and at the bottom. Backend: `stations/create_batch` (admin, `dry_run` for the review step) in `batch.py`; creates entries through the config flow's `import` step. The classic Add integration dialog stays; since 1.4.0b2 it also names new labels "Station <name>". |
| Look & feel | Uses Home Assistant theme CSS variables everywhere (primary colour, card background, text, dividers, success/error/warning, fonts, radius), so it follows the user's theme and dark mode. Exceptions: photo viewer is always dark; label chips use the label's colour. |
| Layout | Desktop: left column Documentation then Photos & files (stacked, no gap — user complained about a gap), right column Devices (sticky, scrolls inside the card when long). Mobile (<1000px): Devices first, then docs, then files. |
| Language | Panel follows the user's HA language: Dutch (`nl*`) or English. Config flow/entity names translated in `translations/en.json` and `nl.json`. |
| Logo | User supplied a logo (blue screen above a black table outline). Redrawn as vector: `docs/logo.svg`, `docs/logo-dark.svg`. Brand images in `custom_components/stations/brand/` (icon.png 256, icon@2x.png 512, dark variants) — shown by HA ≥ 2026.3 on integrations/devices pages. Monochrome version registered as custom icon `stations:logo` (sidebar icon, station counter, sensor icon, default icon for new station labels) via `frontend/stations-icons.js`, loaded on every page with `frontend.add_extra_js_url`. |

## 3. Architecture

```
custom_components/stations/
  __init__.py        async_setup: DocsStore, websocket API, panel. async_setup_entry: station device, Station object, platforms.
  station.py         Station: computes members from the label (device + entity registry), listens to registry
                     events and member state changes, availability helpers, power targets + async_power().
  store.py           DocsStore: .storage/stations.docs (markdown, updated_at/by, cover, files[], device_display{}, power{}).
                     Files on disk in <config>/stations/<entry_id>/<file_id><ext>.
  api.py             Websocket commands (below) + HTTP views: POST /api/stations/<entry_id>/files (multipart upload,
                     type sniffed from content, max 15 MB, jpeg/png/gif/webp/pdf/txt) and
                     GET /api/stations/<entry_id>/files/<file_id> (auth or signed URL, 24 h).
  batch.py           stations/create_batch: check (dry_run) or create several stations, labels, areas and members at once.
  config_flow.py     Import step (used by the wizard). User step: name, optional label (else creates one with the station's name), optional area.
                     Options flow: change the label.
  sensor.py          sensor.<station>_devices (attr entity_id = all member entities → works with expand()),
                     sensor.<station>_unavailable_devices.
  binary_sensor.py   binary_sensor.<station>_status (problem; attr unavailable_entities).
  switch.py          switch.<station>_power (runs power on/off; state = any switchable power-on target on;
                     assumed state + restore when only scripts are configured; unavailable until power is set up).
  entity.py          Base entity on the station device.
  panel.py           Static path /stations_static, extra JS (icons), sidebar panel "Stations" (require_admin False).
  frontend/stations-panel.js   The whole panel: plain web component, no build step, no dependencies.
  frontend/stations-icons.js   Registers window.customIcons.stations (stations:logo).
  brand/             Brand images.
  translations/      en, nl.
```

### Websocket commands

| Command | Who | Purpose |
|---|---|---|
| `stations/list` | all | Summary of all stations (+ `is_admin`). |
| `stations/get` | all | Full station: devices (with addresses, `visit_url`, `display`, entities), direct entities, docs, files (signed URLs), cover, power info. |
| `stations/subscribe` | all | Event on any change (entry_id). |
| `stations/save_docs` | all | Markdown; `base_updated_at` for conflict detection (error `conflict`), `force` to overwrite. |
| `stations/update_file`, `move_file`, `delete_file`, `set_cover` | all | Gallery management. |
| `stations/set_device_display` | all | `entities` (list or null), `fields`, `note`, or `reset`. |
| `stations/power` | all | `on: true/false`. |
| `stations/add_member`, `remove_member` | admin | Adds/removes the station label on a device or entity. |
| `stations/rename` | admin | Renames config entry + station device. |
| `stations/set_power` | admin | `on`/`off`: `{mode: null}` / `{mode:"label", label_id}` / `{mode:"entities", entities:[…]}`. |

### Panel (stations-panel.js)

- Routes: `/stations` (card grid, search by station/area/label/device name, problem counter) and `/stations/<entry_id>` (detail).
- Documentation editor: Markdown with Write/Preview, template button, "Insert photo or file…" (`![caption](file:<id>)`, resolved to signed URLs), Ctrl/⌘+S, unsaved-changes guard, concurrent-edit conflict banner. Rendered with HA's `<ha-markdown>` when available, built-in safe renderer as fallback.
- Photos & files: drag-and-drop, client-side downscale to 2560 px, lightbox with caption edit, cover, reorder, delete, download.
- Devices card: status dots updated live from `hass.states` without re-rendering; member picker (devices/entities tabs, shows "in <other station>"); per-device display editor; Visit link.
- Power bar: state chip, Power on/off buttons, power settings editor with live preview of targets.

## 3b. Repository and releases (1.2.3)

- Hosted at `github.com/definexperience/ha-stations`; `manifest.json` documentation/issue_tracker point there, codeowner `@definexperience`.
- `hacs.json` in the root; installed via HACS as a custom repository (type Integration).
- `.github/workflows/validate.yml`: hassfest, HACS action (brands check ignored, the logo ships in the `brand` folder) and pytest on every push.
- Public repository, **MIT licence** (copyright deFine; user chose it to give back to the community). Because it is public, keep customer names, tunnel domains, real people and internal addresses out of the repo: the dev seed uses user `Demo User` / `demo` and a made-up installer, and screenshots are taken with that demo data.
- GitHub topics (needed for the HACS check): `home-assistant`, `hacs`, `hacs-integration`.
- `.github/workflows/release.yml`: pushing tag `vX.Y.Z` (must equal the manifest version) publishes a GitHub release, which HACS offers as an update.

## 4. Testing

- `tests/test_stations.py`: 11 tests with `pytest-homeassistant-custom-component` (config flow, label membership, websocket API, permissions, uploads/signed URLs, cleanup, options flow, panel registration, device display, power in label and entity mode). All pass on HA 2026.2.3.
- `dev/`: real Home Assistant config with fake devices, seed script, websocket and screenshot scripts (see `dev/README.md`). Every UI change was checked with screenshots in light, dark and phone width.

## 5. Open items and ideas

1. **Remote links integration (separate project, being built by the user in another chat).** Locations are reached via a tunnel `https://<name>.<tunnel-domain>`. Device links like `http://<local-ip>:<port>/admin/autologin/<token>` must become `https://<name>.<tunnel-domain>/admin/autologin/<token>` when HA is opened through the tunnel; only links whose path starts with `/admin/autologin/` go through the tunnel; local IP ranges vary. That integration exposes `window.remoteLinks` with `isRemote()`, `rewrite(url)`, `isLocalOnly(url)` and shows a "local only" tooltip on hover. **To do in Stations once it exists:** use `window.remoteLinks` (if present) for the Visit link and the IP/web address link: rewrite tunnel-capable links, and show unreachable ones as "local only". Must keep working without Remote links installed.
2. Offered, not requested yet: Stations-specific theme variables; a default "what to show" per device model; showing the IP for every device by default; an option to determine availability from a separate status/connectivity entity (for MQTT devices that report status as an entity).
3. Small known cosmetic issue: on phone width the power bar's settings button wraps to its own line.
4. Remote links tunnel domain and local IP ranges are kept out of this public file on purpose; ask the user when implementing item 1.

## 6. Working agreements with the user

- Communicate in English (user writes English; UI must also be Dutch).
- User likes to see screenshots of UI changes.
- Bump `manifest.json` version on every delivered change and deliver a full zip of the repository.
- When the user asks "just a question", explain without implementing.
