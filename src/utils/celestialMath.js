export function clamp(value) {
  return Math.min(1, Math.max(0, value));
}

export function getArcPosition(progress, radius) {
  const angle = -Math.PI + progress * Math.PI;

  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
}

export function getProgress(start, end, now) {
  return (now - start) / (end - start);
}