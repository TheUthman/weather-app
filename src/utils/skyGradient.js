export function getSkyGradient(type, progress) {
  // progress: 0 → 1 (sun position in sky)

  if (type === "moon") {
    return {
      background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 40%, #16213e 100%)",
    };
  }

  // 🌞 SUN MODE

  // Early Sunrise (0 → 0.08) - Deep orange to golden
  if (progress < 0.08) {
    return {
      background:
        "linear-gradient(180deg, #ff4e26 0%, #ff9e5f 30%, #ffb347 70%, #fff8dc 100%)",
    };
  }

  // Sunrise peak (0.08 → 0.15) - Golden to light orange
  if (progress < 0.15) {
    return {
      background:
        "linear-gradient(180deg, #ff8c42 0%, #ffaa5f 25%, #ffd580 60%, #fffacd 100%)",
    };
  }

  // Morning (0.15 → 0.35) - Transitioning to blue
  if (progress < 0.35) {
    const localProgress = (progress - 0.15) / 0.2;
    const orangeInfluence = 1 - localProgress;
    const r = Math.round(255 * orangeInfluence + 74 * (1 - orangeInfluence));
    const g = Math.round(180 * orangeInfluence + 200 * (1 - orangeInfluence));
    const b = Math.round(100 * orangeInfluence + 255 * (1 - orangeInfluence));
    
    return {
      background: `linear-gradient(180deg, rgb(${r}, ${g}, ${b}) 0%, #87ceeb 50%, #b0e0e6 100%)`,
    };
  }

  // Midday (0.35 → 0.65) - Bright blue sky
  if (progress < 0.65) {
    return {
      background:
        "linear-gradient(180deg, #1e90ff 0%, #4da6ff 40%, #87ceeb 70%, #b0e0e6 100%)",
    };
  }

  // Late afternoon to sunset (0.65 → 0.8)
  if (progress < 0.8) {
    const localProgress = (progress - 0.65) / 0.15;
    const blueInfluence = 1 - localProgress;
    const r = Math.round(74 * blueInfluence + 255 * (1 - blueInfluence));
    const g = Math.round(166 * blueInfluence + 165 * (1 - blueInfluence));
    const b = Math.round(255 * blueInfluence + 100 * (1 - blueInfluence));
    
    return {
      background: `linear-gradient(180deg, rgb(${r}, ${g}, ${b}) 0%, #ff9a56 30%, #ff6b9d 70%, #c44569 100%)`,
    };
  }

  // Sunset peak (0.8 → 0.9) - Deep orange and purple
  if (progress < 0.9) {
    return {
      background:
        "linear-gradient(180deg, #ff6b5b 0%, #ff8866 20%, #c44569 50%, #5a189a 100%)",
    };
  }

  // Dusk transition (0.9 → 1.0)
  if (progress < 0.98) {
    return {
      background:
        "linear-gradient(180deg, #5a189a 0%, #3c096c 50%, #1a0933 100%)",
    };
  }

  // Night transition fallback
  return {
    background:
      "linear-gradient(135deg, #0a0e27 0%, #16213e 100%)",
  };
}
