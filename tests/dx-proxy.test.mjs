import test from "node:test";
import assert from "node:assert/strict";
import { handleRequest, UPSTREAM_URL } from "../workers/dx-proxy/src/index.mjs";

const payload = {
  updated: "2026-08-13T06:06:08+00:00",
  bands: { "20m": { index: 51, rating: "Good" } },
  regions: { AS: { corridors: {} } }
};

async function withFetch(mock, callback) {
  const original = globalThis.fetch;
  globalThis.fetch = mock;
  try {
    await callback();
  } finally {
    globalThis.fetch = original;
  }
}

test("proxies valid propagation JSON with an exact CORS origin", async function () {
  await withFetch(async function (url) {
    assert.equal(url, UPSTREAM_URL);
    return Response.json(payload);
  }, async function () {
    const request = new Request("https://proxy.example/dx", {
      headers: { Origin: "https://rfcorner.in" }
    });
    const response = await handleRequest(request);

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://rfcorner.in");
    assert.equal(response.headers.get("Cache-Control"), "public, max-age=60, stale-while-revalidate=300");
    assert.deepEqual(await response.json(), payload);
  });
});
test("answers CORS preflight without contacting the source", async function () {
  await withFetch(function () {
    assert.fail("preflight must not contact the source");
  }, async function () {
    const request = new Request("https://proxy.example/dx", {
      method: "OPTIONS",
      headers: { Origin: "https://rfcorner.in" }
    });
    const response = await handleRequest(request);
    assert.equal(response.status, 204);
    assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://rfcorner.in");
  });
});

test("rejects unapproved browser origins", async function () {
  const request = new Request("https://proxy.example/dx", {
    headers: { Origin: "https://attacker.example" }
  });
  const response = await handleRequest(request);
  assert.equal(response.status, 403);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
});

test("rejects unknown paths and incomplete upstream data", async function () {
  const missing = await handleRequest(new Request("https://proxy.example/nope"));
  assert.equal(missing.status, 404);

  await withFetch(async function () {
    return Response.json({ bands: {} });
  }, async function () {
    const response = await handleRequest(new Request("https://proxy.example/dx"));
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { error: "Propagation source returned incomplete data" });
  });
});
