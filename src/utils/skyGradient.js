export function getSkyGradient(type, progress) {
  // progress: 0 → 1 (sun position in sky)

  if (type === "moon") {
    return {
      background: "linear-gradient(to bottom, #020617, #0b1020)",
    };
  }

  // 🌞 SUN MODE

  // Sunrise (0 → 0.2)
  if (progress < 0.2) {
    return {
      background:
        "linear-gradient(to bottom, #ff7e5f, #feb47b)",
    };
  }

  // Morning / Noon (0.2 → 0.6)
  if (progress < 0.6) {
    return {
      background:
        "linear-gradient(to bottom, #4facfe, #00f2fe)",
    };
  }

  // Sunset (0.6 → 0.9)
  if (progress < 0.9) {
    return {
      background:
        "linear-gradient(to bottom, #7f00ff, #e100ff)",
    };
  }

  // Night transition fallback
  return {
    background:
      "linear-gradient(to bottom, #0f172a, #020617)",
  };
}