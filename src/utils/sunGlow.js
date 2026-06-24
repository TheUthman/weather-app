export function getSunGlow(progress) {
  // peak glow at noon (0.5)
  const intensity = Math.sin(Math.PI * progress);

  return {
    boxShadow: `
      0 0 ${20 + intensity * 40}px rgba(255, 202, 40, 0.8),
      0 0 ${60 + intensity * 80}px rgba(255, 200, 0, 0.4)
    `,
    transform: `scale(${1 + intensity * 0.3})`,
  };
}