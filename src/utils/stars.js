export function getStarOpacity(type, progress) {
  if (type === "sun") return 0;

  // moon mode: fade in gradually after sunset
  return Math.min(1, Math.max(0, progress));
}