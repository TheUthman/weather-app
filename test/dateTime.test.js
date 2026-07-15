import test from "node:test";
import assert from "node:assert/strict";
import { formatFreshnessLabel, formatZonedTime } from "../src/utils/dateTime.js";

test("time formatting tolerates corrupt timestamps and timezone names", () => {
  assert.equal(formatZonedTime("not-a-date", "Invalid/Timezone"), "—");
  assert.doesNotThrow(() => formatZonedTime("2026-07-15T12:00:00Z", "Invalid/Timezone"));
});

test("freshness labels fall back safely when cache metadata is invalid", () => {
  assert.equal(
    formatFreshnessLabel({ updatedAt: "broken", isStale: true }),
    "Cached forecast",
  );
  assert.equal(
    formatFreshnessLabel({ updatedAt: null, isStale: false }),
    "Latest forecast",
  );
});
