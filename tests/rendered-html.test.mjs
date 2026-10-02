import assert from "node:assert/strict";
import test from "node:test";

const plannerMetadata = [
  /<title>Sharon Meal Plan \| Four-week meal planner<\/title>/i,
  /<meta(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["']Sharon(?:&#x27;|')s four-week dinner plan, with complete recipes, portion guides and organised weekly shopping lists\.["'])[^>]*>/i,
];

test("renders Sharon Meal Plan metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = (await response.text()).replace(/<!--.*?-->/g, "");
  for (const pattern of plannerMetadata) assert.match(html, pattern);
  assert.doesNotMatch(html, /Dinner, decided/);
  assert.match(html, /<h1 class="brand">/);
  assert.match(html, /Sharon Meal Plan/);
  const cycleStart = Date.UTC(2026, 7, 31);
  const today = new Date();
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const weekIndex = Math.floor((Math.max(0, Math.floor((todayUTC - cycleStart) / 86_400_000)) % 28) / 7);
  const weekTitles = ["Family favourites", "Pasta and traybakes", "Roast and leftovers", "Cheesy bakes and pastry"];
  assert.match(html, new RegExp(`Week ${weekIndex + 1} (?:—|&mdash;) ${weekTitles[weekIndex]}`));
  assert.doesNotMatch(html, /<img[^>]+https?:\/\//i);
  assert.doesNotMatch(html, /<source[^>]+https?:\/\//i);
  assert.ok((html.match(/class="meal-card-title"/g) ?? []).length >= 6, "the week's dinners render on the server");
  assert.doesNotMatch(html, /Setting the table/);
});
