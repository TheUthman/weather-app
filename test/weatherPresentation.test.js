import test from "node:test";
import assert from "node:assert/strict";
import {
  isDaytimeAtLocation,
  weatherCodeToIcon,
} from "../src/services/weatherService.js";
import { classifyTouchGesture } from "../src/utils/dialInteraction.js";
import { applyDayNightIcon } from "../src/utils/weatherState.js";

test("clear and partly cloudy conditions use day and night icon variants", () => {
  assert.equal(weatherCodeToIcon(0, true), "sunny");
  assert.equal(weatherCodeToIcon(0, false), "night-clear");
  assert.equal(weatherCodeToIcon(2, true), "partly-cloudy");
  assert.equal(weatherCodeToIcon(2, false), "night-cloudy");
});

test("daylight detection uses local solar times without depending on 12-hour labels", () => {
  const daily = {
    time: ["2026-07-21"],
    sunrise: ["2026-07-21T06:18"],
    sunset: ["2026-07-21T18:52"],
  };

  assert.equal(isDaytimeAtLocation(undefined, "2026-07-21T14:00", daily), true);
  assert.equal(isDaytimeAtLocation(undefined, "2026-07-21T22:00", daily), false);
  assert.equal(isDaytimeAtLocation("0", "2026-07-21T14:00", daily), false);
});

test("UI icon variants are reconciled with the location day flag", () => {
  assert.equal(applyDayNightIcon("sunny", false), "night-clear");
  assert.equal(applyDayNightIcon("night-cloudy", true), "partly-cloudy");
  assert.equal(applyDayNightIcon("rain", false), "rain");
});

test("mobile dial waits for intent and leaves vertical gestures to page scrolling", () => {
  assert.equal(classifyTouchGesture(4, 3), "pending");
  assert.equal(classifyTouchGesture(2, 18), "scroll");
  assert.equal(classifyTouchGesture(18, 2), "dial");
  assert.equal(classifyTouchGesture(12, 12), "scroll");
});
