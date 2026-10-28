const { chromium } = require(process.env.PW ? process.env.PW + "/node_modules/playwright" : "playwright");
const fs = require("fs");
(async () => {
  const [, , out, path, w, h, scheme, actions] = process.argv;
  const tok = JSON.parse(fs.readFileSync(process.env.TOK));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, colorScheme: scheme || "light", deviceScaleFactor: 1 });
  await ctx.addInitScript((t) => {
    localStorage.setItem("hassTokens", JSON.stringify({ ...t, hassUrl: "http://127.0.0.1:8123", clientId: "http://127.0.0.1:8123/", expires: Date.now() + 1800000 }));
  }, tok);
  await ctx.addInitScript(() => window.addEventListener("unhandledrejection", (e) => console.error("UNHANDLED " + JSON.stringify(e.reason) + " " + (e.reason && e.reason.stack))));
  const page = await ctx.newPage();
  const logs = [];
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(m.type() + ": " + m.text()); });
  page.on("pageerror", (e) => logs.push("pageerror: " + (e.message || JSON.stringify(e)) + " " + (e.stack||"")));
  await page.goto("http://127.0.0.1:8123" + path);
  await page.waitForTimeout(+(process.env.WAIT||4000));
  if (actions) {
    for (const a of actions.split(";")) {
      const i = a.indexOf("="); const kind = a.slice(0, i), arg = a.slice(i + 1);
      if (kind === "click") await page.locator(arg).first().click();
      if (kind === "type") await page.keyboard.type(arg);
      if (kind === "wait") await page.waitForTimeout(+arg);
      if (kind === "eval") await page.evaluate(arg);
    }
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: out, fullPage: false });
  console.log(logs.filter(l => !/manifest|favicon|service worker|Lit is in dev/i.test(l)).join("\n"));
  await browser.close();
})();
