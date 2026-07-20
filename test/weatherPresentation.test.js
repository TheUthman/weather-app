import test from "node:test";
import assert from "node:assert/strict";
import { weatherCodeToIcon } from "../src/services/weatherService.js";
import { classifyTouchGesture } from "../src/utils/dialInteraction.js";

test("clear and partly cloudy conditions use day and night icon variants", () => {
  assert.equal(weatherCodeToIcon(0, true), "sunny");
  assert.equal(weatherCodeToIcon(0, false), "night-clear");
  assert.equal(weatherCodeToIcon(2, true), "partly-cloudy");
  assert.equal(weatherCodeToIcon(2, false), "night-cloudy");
});

test("mobile dial waits for intent and leaves vertical gestures to page scrolling", () => {
  assert.equal(classifyTouchGesture(4, 3), "pending");
  assert.equal(classifyTouchGesture(2, 18), "scroll");
  assert.equal(classifyTouchGesture(18, 2), "dial");
  assert.equal(classifyTouchGesture(12, 12), "scroll");
});
