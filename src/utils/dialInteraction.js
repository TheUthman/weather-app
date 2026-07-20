const TOUCH_DRAG_THRESHOLD = 12;
const HORIZONTAL_INTENT_RATIO = 1.25;

export const classifyTouchGesture = (deltaX, deltaY) => {
  const horizontalDistance = Math.abs(deltaX);
  const verticalDistance = Math.abs(deltaY);

  if (Math.hypot(horizontalDistance, verticalDistance) < TOUCH_DRAG_THRESHOLD) {
    return "pending";
  }

  return horizontalDistance > verticalDistance * HORIZONTAL_INTENT_RATIO
    ? "dial"
    : "scroll";
};
