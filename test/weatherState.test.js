import test from "node:test";
import assert from "node:assert/strict";
import {
  buildHistoricalWindows,
  coordinateKey,
  coordsMatch,
  isFiniteMeasurement,
  shouldUseCachedForecast,
} from "../src/utils/weatherState.js";

test("measurement validation rejects absent values without rejecting zero", () => {
  assert.equal(isFiniteMeasurement(null), false);
  assert.equal(isFiniteMeasurement(undefined), false);
  assert.equal(isFiniteMeasurement(""), false);
  assert.equal(isFiniteMeasurement(0), true);
  assert.equal(isFiniteMeasurement("12.5"), true);
});

test("coordinate identity supports zero and distinguishes locations", () => {
  assert.equal(coordinateKey({ lat: 0, lng: 0 }), "0:0");
  assert.equal(coordsMatch({ lat: 1, lng: 2 }, { lat: 1, lng: 2 }), true);
  assert.equal(coordsMatch({ lat: 1, lng: 2 }, { lat: 1.01, lng: 2 }), false);
});

test("cached weather remains hidden until the live request fails", () => {
  const cached = { current: { temperature: 24 } };
  assert.equal(shouldUseCachedForecast(null, null, cached), false);
  assert.equal(shouldUseCachedForecast("Network error", null, cached), true);
  assert.equal(
    shouldUseCachedForecast("Network error", { temperature: 25 }, cached),
    false,
  );
});

test("historical windows stay bounded and cross year boundaries correctly", () => {
  assert.deepEqual(buildHistoricalWindows(2026, 0, 1), [
    { year: 2023, start: "2022-12-29", end: "2023-01-04" },
    { year: 2024, start: "2023-12-29", end: "2024-01-04" },
    { year: 2025, start: "2024-12-29", end: "2025-01-04" },
  ]);
});
