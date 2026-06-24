export function getCloudColor(type, progress) {
  if (type === "moon") {
    // Night: subtle cool blue-gray like moonlit clouds
    return "rgba(180, 200, 230, 0.15)";
  }

  // Early Sunrise (0 → 0.15): warm golden-orange like morning clouds
  if (progress < 0.15) {
    const opacity = 0.25 + progress * 0.15;
    return `rgba(255, 180, 120, ${opacity})`;
  }

  // Morning to midday (0.15 → 0.5): bright white and light cyan
  if (progress < 0.5) {
    const localProgress = (progress - 0.15) / 0.35;
    const r = Math.round(255 * (1 - localProgress * 0.2) + 200 * localProgress * 0.2);
    const g = Math.round(220 * (1 - localProgress * 0.1) + 240 * localProgress * 0.1);
    const b = Math.round(150 * (1 - localProgress) + 255 * localProgress);
    return `rgba(${r}, ${g}, ${b}, 0.32)`;
  }

  // Midday (0.5 → 0.65): pristine bright white with slight blue tint
  if (progress < 0.65) {
    return "rgba(240, 250, 255, 0.28)";
  }

  // Late afternoon (0.65 → 0.85): transitioning to warm amber-orange
  if (progress < 0.85) {
    const localProgress = (progress - 0.65) / 0.2;
    const r = Math.round(240 * (1 - localProgress) + 255 * localProgress);
    const g = Math.round(200 * (1 - localProgress) + 170 * localProgress);
    const b = Math.round(150 * (1 - localProgress) + 80 * localProgress);
    return `rgba(${r}, ${g}, ${b}, ${0.32 + localProgress * 0.08})`;
  }

  // Sunset (0.85 → 0.95): deep purple-pink
  if (progress < 0.95) {
    return "rgba(200, 140, 200, 0.35)";
  }

  // Dusk to night transition: deep indigo
  return "rgba(120, 140, 180, 0.2)";
}
