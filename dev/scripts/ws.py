import asyncio, json, sys, aiohttp
async def main():
    tok = json.load(open(sys.argv[1]))
    async with aiohttp.ClientSession() as s:
        r = await s.post("http://127.0.0.1:8123/auth/token", data={"grant_type":"refresh_token","refresh_token":tok["refresh_token"],"client_id":"http://127.0.0.1:8123/"})
        new = await r.json(); tok.update(new); json.dump(tok, open(sys.argv[1], "w"))
        ws = await s.ws_connect("http://127.0.0.1:8123/api/websocket")
        await ws.receive_json(); await ws.send_json({"type":"auth","access_token":tok["access_token"]}); await ws.receive_json()
        for i, cmd in enumerate(sys.argv[2:], 1):
            msg = json.loads(cmd); msg["id"] = i
            await ws.send_json(msg)
            while True:
                m = await ws.receive_json()
                if m.get("id") == i and m["type"] == "result": print(json.dumps(m)[:400]); break
asyncio.run(main())
