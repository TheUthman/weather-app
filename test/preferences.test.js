import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PREFERENCES,
  normalizePreferences,
} from "../src/utils/preferences.js";

test("preferences reject corrupt and obsolete enum values", () => {
  assert.deepEqual(
    normalizePreferences({
      units: "kelvin",
      theme: "neon",
      visualStyle: "cinema",
      location: "automatic",
    }),
    DEFAULT_PREFERENCES,
  );
});

test("preferences preserve supported values and clamp transparency", () => {
  assert.deepEqual(
    normalizePreferences({
      units: "metric",
      theme: "dark",
      visualStyle: "minimal",
      componentTransparency: 140,
      location: "auto",
      defaultCity: "  Lagos  ",
    }),
    {
      units: "metric",
      theme: "dark",
      visualStyle: "minimal",
      componentTransparency: 100,
      location: "auto",
      defaultCity: "Lagos",
    },
  );
});
