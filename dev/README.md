# Development setup

Everything needed to test Stations against a real Home Assistant, as used during development.

## 1. Unit tests

```bash
python3 -m venv .venv
.venv/bin/pip install pytest-homeassistant-custom-component
.venv/bin/python -m pytest          # run from the repository root
```

## 2. A real Home Assistant with fake devices

`haconf/` is a Home Assistant config folder with a `fakedev` integration that creates 8 fake devices
(Shelly, Aqara, UniFi switch, UPS, …), some with IP/MAC addresses and some unavailable.

```bash
# from the repository root
ln -s ../../../custom_components/stations dev/haconf/custom_components/stations
.venv/bin/pip install homeassistant home-assistant-frontend   # frontend version must match HA's frontend manifest
.venv/bin/hass -c dev/haconf --skip-pip
```

When the frontend stays on "Loading data", a built-in integration is missing a Python package.
Check `dev/haconf/home-assistant.log` for `No module named ...` and pip-install it
(during development: hassil, home-assistant-intents, PyMetno, radios, mutagen, gTTS, PyTurboJPEG, ha-ffmpeg and a few more).

## 3. Seed test data

```bash
.venv/bin/pip install pillow aiohttp
.venv/bin/python dev/scripts/seed.py dev/tokens.json
```

Creates user `demo` / `test1234`, three areas, three stations (Pump station A, Network cabinet, Workbench 1),
assigns devices, writes documentation, uploads photos and a PDF, and creates `power on` / `power off` labels.
`dev/tokens.json` holds the login token for the other scripts (do not commit it).

## 4. Websocket calls and screenshots

```bash
.venv/bin/python dev/scripts/ws.py dev/tokens.json '{"type":"stations/list"}'

npm i playwright && npx playwright install chromium
TOK=dev/tokens.json node dev/scripts/shot.js out.png /stations 1280 800 light
TOK=dev/tokens.json node dev/scripts/shot.js out.png /stations/<entry_id> 1280 900 dark "click=button[data-action=edit]"
```

`shot.js` arguments: output file, path, width, height, light/dark, and optional actions separated by `;`
(`click=<selector>`, `type=<text>`, `wait=<ms>`, `eval=<js>`).
