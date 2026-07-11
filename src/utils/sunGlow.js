export function getSunGlow(progress) {
  const intensity = Math.sin(Math.PI * progress);

  return {
    boxShadow: `
      0 0 ${26 + intensity * 36}px rgba(255, 230, 150, 0.85),
      0 0 ${72 + intensity * 96}px rgba(255, 196, 92, 0.38),
      0 0 ${120 + intensity * 120}px rgba(255, 182, 72, 0.16)
    `,
    "--celestial-scale": 1 + intensity * 0.16,
  };
}
