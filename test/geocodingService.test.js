import test from "node:test";
import assert from "node:assert/strict";
import {
  fetchGeocodingData,
  fetchGeocodingSuggestions,
} from "../src/services/geocodingService.js";

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("forward geocoding accepts coordinates on the equator and prime meridian", async () => {
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      results: [{ latitude: 0, longitude: 0 }],
    }),
  });

  assert.deepEqual(await fetchGeocodingData("Null Island"), { lat: 0, lng: 0 });
});

test("geocoding surfaces HTTP failures before parsing a response", async () => {
  globalThis.fetch = async () => ({ ok: false, status: 503 });

  await assert.rejects(
    fetchGeocodingSuggestions("Lagos"),
    /status 503/,
  );
});
