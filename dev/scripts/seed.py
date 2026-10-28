"""Fill a fresh test Home Assistant with stations, devices, docs and photos.

Usage: python seed.py tokens.json   (Home Assistant must be running and not yet onboarded)
"""
import asyncio, json, io, sys
import aiohttp
from PIL import Image, ImageDraw
B = "http://127.0.0.1:8123"
CID = B + "/"

def photo(w, h, base, label):
    im = Image.new("RGB", (w, h), base)
    d = ImageDraw.Draw(im)
    for i in range(0, h, 6):
        shade = tuple(max(0, min(255, c - i // 12)) for c in base)
        d.line([(0, i), (w, i)], fill=shade, width=6)
    d.rectangle([w*0.15, h*0.12, w*0.85, h*0.9], outline=(40,40,40), width=8, fill=(205,200,190))
    for r in range(4):
        y = h*0.2 + r*h*0.17
        d.rectangle([w*0.2, y, w*0.8, y+h*0.12], fill=(70,75,85))
        for k in range(6):
            x = w*0.24 + k*w*0.09
            d.ellipse([x, y+h*0.04, x+w*0.03, y+h*0.07], fill=(80,220,120) if (k+r)%3 else (240,180,40))
    d.text((w*0.05, h*0.92), label, fill=(255,255,255))
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=85); return buf.getvalue()

async def main():
    async with aiohttp.ClientSession() as s:
        r = await s.post(B+"/api/onboarding/users", json={"client_id":CID,"name":"Demo User","username":"demo","password":"test1234","language":"en"})
        code = (await r.json())["auth_code"]
        r = await s.post(B+"/auth/token", data={"grant_type":"authorization_code","code":code,"client_id":CID})
        tok = await r.json()
        json.dump(tok, open(sys.argv[1], "w"))
        H = {"Authorization": "Bearer " + tok["access_token"]}
        for step, body in (("core_config", {}), ("analytics", {}), ("integration", {"client_id":CID,"redirect_uri":CID+"?auth_callback=1"})):
            await s.post(f"{B}/api/onboarding/{step}", json=body, headers=H)
        ws = await s.ws_connect(B+"/api/websocket")
        await ws.receive_json(); await ws.send_json({"type":"auth","access_token":tok["access_token"]}); await ws.receive_json()
        n = [0]
        async def call(**msg):
            n[0] += 1; msg["id"] = n[0]; await ws.send_json(msg)
            while True:
                m = await ws.receive_json()
                if m.get("id") == n[0] and m["type"] == "result":
                    if not m["success"]: print("ERR", msg, m)
                    return m.get("result")
        areas = {}
        for a in ("Workshop", "Server room", "Basement"):
            areas[a] = (await call(type="config/area_registry/create", name=a))["area_id"]
        async def station(name, area):
            r = await s.post(B+"/api/config/config_entries/flow", json={"handler":"stations"}, headers=H)
            fid = (await r.json())["flow_id"]
            r = await s.post(f"{B}/api/config/config_entries/flow/{fid}", json={"name":name, "area_id":areas[area]}, headers=H)
            return (await r.json())["result"]["entry_id"]
        a = await station("Pump station A", "Basement")
        b = await station("Network cabinet", "Server room")
        c = await station("Workbench 1", "Workshop")
        await asyncio.sleep(1)
        devs = {d["name"]: d["id"] for d in await call(type="config/device_registry/list")}
        labels = {l["name"]: l["label_id"] for l in await call(type="config/label_registry/list")}
        def assign(dev, st):
            return call(type="config/device_registry/update", device_id=devs[dev], labels=[labels[st]])
        for d in ("Pump controller", "Flow sensor", "Cabinet climate", "Door contact"): await assign(d, "Pump station A")
        for d in ("Network switch", "UPS"): await assign(d, "Network cabinet")
        for d in ("Label printer", "Shelly Plug S"): await assign(d, "Workbench 1")
        md = """## Purpose
Feeds the cooling loop of the CNC machines. Pump runs on the Shelly relay; the flow sensor stops the loop when flow drops below **8 L/min**.

## Location
Basement, north wall, behind the blue door. Key is in the key box at reception (hook 14).

## Power
| Circuit | Breaker | Notes |
|---|---|---|
| Pump | B16 group 7 | Shelly Pro 4PM channel 1 |
| Controls | B10 group 8 | 24 V DC supply in top shelf |

## Network
| Device | IP address | Notes |
|---|---|---|
| Pump controller | `10.0.20.31` | VLAN 20 (IoT) |
| Flow sensor | via Modbus gateway | address 3 |

## Maintenance
- [x] Replace inlet filter (every 6 months), last done 2026-09-02
- [ ] Check seal of pump housing
- Never switch off the relay while the CNC spindle is cooling down.

![Wiring of the controller](file:WIRING)

## Contacts
- Installer: Example Installations, 012 345 6789
"""
        hc = (await s.post(B+"/api/stations/x/files", headers=H)).status
        ids = []
        for i, (w, hgt, col, lab) in enumerate(((1600, 1200, (90,110,140), "front"), (1200, 1600, (120,90,80), "inside"), (1600, 1000, (70,120,90), "wiring"))):
            form = aiohttp.FormData(); form.add_field("file", photo(w, hgt, col, lab), filename=f"{lab}.jpg", content_type="image/jpeg")
            form.add_field("caption", {"front":"Front of the cabinet","inside":"Inside, top shelf with controller","wiring":"Wiring of the controller"}[lab])
            r = await s.post(f"{B}/api/stations/{a}/files", data=form, headers=H); ids.append((await r.json())["id"])
        pdf = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 300 200]/Parent 2 0 R>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF"
        form = aiohttp.FormData(); form.add_field("file", pdf, filename="VVX20 datasheet.pdf", content_type="application/pdf")
        await s.post(f"{B}/api/stations/{a}/files", data=form, headers=H)
        await call(type="stations/save_docs", entry_id=a, markdown=md.replace("WIRING", ids[2]))
        form = aiohttp.FormData(); form.add_field("file", photo(1600, 1000, (60,60,90), "rack"), filename="rack.jpg", content_type="image/jpeg")
        await s.post(f"{B}/api/stations/{b}/files", data=form, headers=H)
        await call(type="stations/save_docs", entry_id=b, markdown="## Rack layout\n1. Patch panel\n2. Switch\n3. UPS\n")
        # Labels as used at the customer for power on / power off
        on = await call(type="config/label_registry/create", name="power on", icon="mdi:power", color="green")
        off = await call(type="config/label_registry/create", name="power off", icon="mdi:power-off", color="red")
        await call(type="config/entity_registry/update", entity_id="switch.pump_controller_relay", labels=[on["label_id"], off["label_id"]])
        print(json.dumps({"a": a, "b": b, "c": c}))
asyncio.run(main())
