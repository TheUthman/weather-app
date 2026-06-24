export function getWeatherOverlay(condition, progress) {
  let darkness = 0;

  // rain darkens sky
  if (condition.includes("rain")) darkness += 0.25;

  // thunder darkens more
  if (condition.includes("thunder")) darkness += 0.4;

  // night naturally darker
  if (progress < 0.2) darkness += 0.3;

  return {
    backgroundColor: `rgba(0, 0, 0, ${darkness})`,
  };
}