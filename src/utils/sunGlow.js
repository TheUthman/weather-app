export function getSunGlow(progress) {
  // peak glow at noon (0.5)
  const intensity = Math.sin(Math.PI * progress);

  // Color changes based on time of day
  let primaryColor, secondaryColor;

  if (progress < 0.2) {
    // Sunrise: deep orange to golden
    const localProgress = progress / 0.2;
    const r = Math.round(255 * (1 - localProgress) + 255 * localProgress);
    const g = Math.round(78 * (1 - localProgress) + 200 * localProgress);
    const b = Math.round(0 * (1 - localProgress) + 40 * localProgress);
    primaryColor = `rgba(${r}, ${g}, ${b}, ${0.8 * intensity + 0.2})`;
    secondaryColor = `rgba(${r}, ${g}, ${b}, ${0.3 * intensity + 0.1})`;
  } else if (progress < 0.6) {
    // Daytime: bright yellow
    primaryColor = `rgba(255, 220, 50, ${0.9 * intensity + 0.1})`;
    secondaryColor = `rgba(255, 200, 0, ${0.4 * intensity + 0.1})`;
  } else if (progress < 0.9) {
    // Sunset: orange to red
    const localProgress = (progress - 0.6) / 0.3;
    const r = Math.round(255);
    const g = Math.round(200 * (1 - localProgress) + 100 * localProgress);
    const b = Math.round(0 * (1 - localProgress) + 50 * localProgress);
    primaryColor = `rgba(${r}, ${g}, ${b}, ${0.8 * intensity + 0.2})`;
    secondaryColor = `rgba(${r}, ${g}, ${b}, ${0.3 * intensity + 0.1})`;
  } else {
    // Twilight: dim golden
    primaryColor = `rgba(200, 150, 50, ${0.5 * intensity + 0.1})`;
    secondaryColor = `rgba(150, 100, 30, ${0.2 * intensity + 0.05})`;
  }

  return {
    boxShadow: `
      0 0 ${20 + intensity * 50}px ${primaryColor},
      0 0 ${60 + intensity * 100}px ${secondaryColor}
    `,
    transform: `scale(${1 + intensity * 0.4})`,
  };
}
