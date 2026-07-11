const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (start, end, amount) => start + (end - start) * amount;
const toRgba = (rgb, alpha) =>
  `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
const mixRgb = (start, end, amount) =>
  start.map((channel, index) => Math.round(lerp(channel, end[index], amount)));
const noise = (seed) => {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const cloudProfiles = {
  clear: {
    minCoverage: 0.06,
    defaultCoverage: 0.12,
    minLayers: 2,
    hazeTop: 0.015,
    hazeBottom: 0.055,
    dayColor: [255, 255, 255],
    nightColor: [214, 223, 238],
    shadowColor: [71, 115, 158],
    layers: [
      {
        top: [10, 16],
        height: [10, 12],
        threshold: 0,
        count: [2, 4],
        width: [18, 28],
        depth: 0.12,
        opacity: [0.08, 0.15],
        blur: [12, 18],
        duration: 130,
        windInfluence: 22,
        direction: "reverse",
      },
      {
        top: [32, 40],
        height: [12, 15],
        threshold: 0.05,
        count: [1, 3],
        width: [14, 22],
        depth: 0.24,
        opacity: [0.1, 0.18],
        blur: [4, 8],
        duration: 105,
        windInfluence: 20,
        direction: "normal",
      },
    ],
  },
  partlyCloudy: {
    minCoverage: 0.24,
    defaultCoverage: 0.42,
    minLayers: 3,
    hazeTop: 0.03,
    hazeBottom: 0.08,
    dayColor: [252, 255, 255],
    nightColor: [219, 227, 240],
    shadowColor: [72, 104, 141],
    layers: [
      {
        top: [10, 16],
        height: [10, 12],
        threshold: 0,
        count: [3, 5],
        width: [18, 28],
        depth: 0.14,
        opacity: [0.1, 0.18],
        blur: [10, 16],
        duration: 118,
        windInfluence: 24,
        direction: "reverse",
      },
      {
        top: [24, 33],
        height: [13, 16],
        threshold: 0.18,
        count: [3, 5],
        width: [16, 24],
        depth: 0.26,
        opacity: [0.14, 0.24],
        blur: [5, 9],
        duration: 92,
        windInfluence: 24,
        direction: "normal",
      },
      {
        top: [44, 56],
        height: [14, 18],
        threshold: 0.32,
        count: [2, 4],
        width: [18, 26],
        depth: 0.34,
        opacity: [0.12, 0.22],
        blur: [4, 8],
        duration: 82,
        windInfluence: 18,
        direction: "reverse",
      },
    ],
  },
  cloudy: {
    minCoverage: 0.56,
    defaultCoverage: 0.68,
    minLayers: 3,
    hazeTop: 0.06,
    hazeBottom: 0.14,
    dayColor: [241, 245, 251],
    nightColor: [199, 209, 224],
    shadowColor: [57, 79, 108],
    layers: [
      {
        top: [10, 15],
        height: [13, 16],
        threshold: 0,
        count: [4, 6],
        width: [20, 30],
        depth: 0.2,
        opacity: [0.2, 0.32],
        blur: [8, 14],
        duration: 102,
        windInfluence: 24,
        direction: "normal",
      },
      {
        top: [24, 35],
        height: [15, 19],
        threshold: 0.38,
        count: [4, 6],
        width: [22, 32],
        depth: 0.32,
        opacity: [0.24, 0.38],
        blur: [5, 10],
        duration: 80,
        windInfluence: 26,
        direction: "reverse",
      },
      {
        top: [42, 58],
        height: [16, 20],
        threshold: 0.48,
        count: [3, 5],
        width: [24, 34],
        depth: 0.42,
        opacity: [0.2, 0.34],
        blur: [4, 8],
        duration: 70,
        windInfluence: 22,
        direction: "normal",
      },
    ],
  },
  overcast: {
    minCoverage: 0.76,
    defaultCoverage: 0.88,
    minLayers: 4,
    hazeTop: 0.1,
    hazeBottom: 0.22,
    dayColor: [232, 237, 245],
    nightColor: [186, 196, 212],
    shadowColor: [46, 63, 85],
    layers: [
      {
        top: [8, 13],
        height: [14, 17],
        threshold: 0,
        count: [4, 6],
        width: [24, 34],
        depth: 0.22,
        opacity: [0.26, 0.4],
        blur: [10, 16],
        duration: 96,
        windInfluence: 26,
        direction: "normal",
      },
      {
        top: [21, 30],
        height: [16, 20],
        threshold: 0.44,
        count: [5, 7],
        width: [24, 36],
        depth: 0.34,
        opacity: [0.3, 0.46],
        blur: [6, 10],
        duration: 76,
        windInfluence: 26,
        direction: "reverse",
      },
      {
        top: [38, 52],
        height: [17, 21],
        threshold: 0.58,
        count: [4, 6],
        width: [26, 38],
        depth: 0.44,
        opacity: [0.3, 0.48],
        blur: [4, 8],
        duration: 62,
        windInfluence: 20,
        direction: "normal",
      },
      {
        top: [58, 72],
        height: [14, 18],
        threshold: 0.72,
        count: [3, 5],
        width: [28, 40],
        depth: 0.5,
        opacity: [0.24, 0.4],
        blur: [8, 14],
        duration: 68,
        windInfluence: 16,
        direction: "reverse",
      },
    ],
  },
  rain: {
    minCoverage: 0.8,
    defaultCoverage: 0.9,
    minLayers: 4,
    hazeTop: 0.14,
    hazeBottom: 0.3,
    dayColor: [214, 223, 234],
    nightColor: [176, 188, 205],
    shadowColor: [29, 43, 63],
    layers: [
      {
        top: [11, 15],
        height: [15, 18],
        threshold: 0,
        count: [4, 6],
        width: [24, 34],
        depth: 0.28,
        opacity: [0.34, 0.5],
        blur: [10, 15],
        duration: 86,
        windInfluence: 28,
        direction: "normal",
      },
      {
        top: [24, 34],
        height: [17, 20],
        threshold: 0.5,
        count: [5, 7],
        width: [28, 38],
        depth: 0.42,
        opacity: [0.38, 0.56],
        blur: [6, 10],
        duration: 64,
        windInfluence: 30,
        direction: "reverse",
      },
      {
        top: [42, 54],
        height: [18, 21],
        threshold: 0.65,
        count: [4, 6],
        width: [28, 42],
        depth: 0.52,
        opacity: [0.4, 0.58],
        blur: [4, 8],
        duration: 52,
        windInfluence: 24,
        direction: "normal",
      },
      {
        top: [62, 74],
        height: [15, 18],
        threshold: 0.76,
        count: [3, 5],
        width: [30, 44],
        depth: 0.56,
        opacity: [0.22, 0.36],
        blur: [10, 18],
        duration: 46,
        windInfluence: 20,
        direction: "reverse",
      },
    ],
  },
  snow: {
    minCoverage: 0.72,
    defaultCoverage: 0.82,
    minLayers: 4,
    hazeTop: 0.12,
    hazeBottom: 0.22,
    dayColor: [240, 245, 252],
    nightColor: [215, 224, 239],
    shadowColor: [74, 92, 119],
    layers: [
      {
        top: [12, 16],
        height: [14, 17],
        threshold: 0,
        count: [4, 6],
        width: [22, 32],
        depth: 0.22,
        opacity: [0.24, 0.36],
        blur: [10, 16],
        duration: 94,
        windInfluence: 18,
        direction: "normal",
      },
      {
        top: [26, 36],
        height: [16, 19],
        threshold: 0.46,
        count: [4, 6],
        width: [24, 34],
        depth: 0.34,
        opacity: [0.28, 0.42],
        blur: [7, 11],
        duration: 74,
        windInfluence: 18,
        direction: "reverse",
      },
      {
        top: [46, 58],
        height: [16, 20],
        threshold: 0.58,
        count: [3, 5],
        width: [26, 36],
        depth: 0.44,
        opacity: [0.24, 0.38],
        blur: [6, 10],
        duration: 66,
        windInfluence: 15,
        direction: "normal",
      },
      {
        top: [64, 76],
        height: [13, 17],
        threshold: 0.72,
        count: [3, 4],
        width: [24, 34],
        depth: 0.5,
        opacity: [0.16, 0.28],
        blur: [12, 18],
        duration: 70,
        windInfluence: 12,
        direction: "reverse",
      },
    ],
  },
  storm: {
    minCoverage: 0.9,
    defaultCoverage: 0.97,
    minLayers: 4,
    hazeTop: 0.18,
    hazeBottom: 0.34,
    dayColor: [173, 183, 201],
    nightColor: [149, 160, 178],
    shadowColor: [13, 19, 31],
    layers: [
      {
        top: [8, 13],
        height: [16, 19],
        threshold: 0,
        count: [5, 7],
        width: [24, 36],
        depth: 0.32,
        opacity: [0.42, 0.58],
        blur: [8, 12],
        duration: 68,
        windInfluence: 30,
        direction: "normal",
      },
      {
        top: [22, 31],
        height: [18, 22],
        threshold: 0.52,
        count: [5, 7],
        width: [28, 40],
        depth: 0.48,
        opacity: [0.48, 0.66],
        blur: [4, 8],
        duration: 48,
        windInfluence: 30,
        direction: "reverse",
      },
      {
        top: [40, 55],
        height: [18, 22],
        threshold: 0.68,
        count: [4, 6],
        width: [30, 44],
        depth: 0.6,
        opacity: [0.44, 0.62],
        blur: [2, 5],
        duration: 38,
        windInfluence: 24,
        direction: "normal",
      },
      {
        top: [62, 76],
        height: [14, 18],
        threshold: 0.78,
        count: [4, 6],
        width: [18, 28],
        depth: 0.56,
        opacity: [0.24, 0.4],
        blur: [6, 12],
        duration: 28,
        windInfluence: 18,
        direction: "reverse",
      },
    ],
  },
  fog: {
    minCoverage: 0.68,
    defaultCoverage: 0.82,
    minLayers: 3,
    hazeTop: 0.08,
    hazeBottom: 0.32,
    dayColor: [244, 247, 249],
    nightColor: [215, 221, 230],
    shadowColor: [107, 117, 130],
    layers: [
      {
        top: [28, 36],
        height: [15, 18],
        threshold: 0,
        count: [3, 5],
        width: [24, 36],
        depth: 0.18,
        opacity: [0.16, 0.26],
        blur: [16, 24],
        duration: 110,
        windInfluence: 12,
        direction: "reverse",
      },
      {
        top: [50, 62],
        height: [18, 22],
        threshold: 0.5,
        count: [4, 6],
        width: [28, 42],
        depth: 0.24,
        opacity: [0.18, 0.3],
        blur: [18, 28],
        duration: 92,
        windInfluence: 10,
        direction: "normal",
      },
      {
        top: [70, 82],
        height: [14, 18],
        threshold: 0.62,
        count: [4, 6],
        width: [34, 48],
        depth: 0.28,
        opacity: [0.2, 0.34],
        blur: [20, 30],
        duration: 82,
        windInfluence: 8,
        direction: "reverse",
      },
    ],
  },
};

function getProfileKey(condition = "") {
  const normalized = condition.toLowerCase();

  if (
    normalized.includes("thunder") ||
    normalized.includes("storm") ||
    normalized.includes("squall") ||
    normalized.includes("hail")
  ) {
    return "storm";
  }

  if (
    normalized.includes("fog") ||
    normalized.includes("mist") ||
    normalized.includes("haze") ||
    normalized.includes("smoke")
  ) {
    return "fog";
  }

  if (
    normalized.includes("snow") ||
    normalized.includes("sleet") ||
    normalized.includes("ice") ||
    normalized.includes("freezing")
  ) {
    return "snow";
  }

  if (
    normalized.includes("rain") ||
    normalized.includes("drizzle") ||
    normalized.includes("shower")
  ) {
    return "rain";
  }

  if (normalized.includes("overcast")) {
    return "overcast";
  }

  if (
    normalized.includes("partly") ||
    normalized.includes("interval") ||
    normalized.includes("mostly sunny")
  ) {
    return "partlyCloudy";
  }

  if (
    normalized.includes("mostly cloudy") ||
    normalized.includes("cloudy") ||
    normalized.includes("cloud")
  ) {
    return "cloudy";
  }

  return "clear";
}

function getViewportScale(viewportWidth = 1440) {
  if (viewportWidth < 480) return 0.72;
  if (viewportWidth < 768) return 0.86;
  return 1;
}

function getPhasePalette(type, progress, profile) {
  const isNight = type === "moon";
  const cloudBase = isNight ? profile.nightColor : profile.dayColor;

  if (isNight) {
    return {
      highlight: mixRgb(cloudBase, [248, 252, 255], 0.24),
      midtone: cloudBase,
      base: mixRgb(cloudBase, [118, 132, 156], 0.26),
      shadow: profile.shadowColor,
    };
  }

  if (progress < 0.18) {
    return {
      highlight: mixRgb(cloudBase, [255, 227, 205], 0.4),
      midtone: mixRgb(cloudBase, [255, 210, 186], 0.22),
      base: mixRgb(cloudBase, [217, 166, 147], 0.22),
      shadow: mixRgb(profile.shadowColor, [114, 72, 64], 0.24),
    };
  }

  if (progress < 0.74) {
    return {
      highlight: mixRgb(cloudBase, [255, 255, 255], 0.26),
      midtone: cloudBase,
      base: mixRgb(cloudBase, [199, 217, 241], 0.2),
      shadow: profile.shadowColor,
    };
  }

  return {
    highlight: mixRgb(cloudBase, [255, 219, 200], 0.32),
    midtone: mixRgb(cloudBase, [238, 198, 222], 0.16),
    base: mixRgb(cloudBase, [186, 164, 206], 0.22),
    shadow: mixRgb(profile.shadowColor, [71, 55, 92], 0.28),
  };
}

function resolveCoverage(profile, cloudCover) {
  const measuredCoverage = Number.isFinite(cloudCover)
    ? clamp(cloudCover / 100, 0, 1)
    : null;

  if (measuredCoverage === null) {
    return profile.defaultCoverage;
  }

  return clamp(
    Math.max(profile.minCoverage, measuredCoverage),
    profile.minCoverage,
    1,
  );
}

export function getCloudColor(
  condition = "",
  type = "sun",
  progress = 0.5,
  cloudCover = 0,
) {
  const profile =
    cloudProfiles[getProfileKey(condition)] || cloudProfiles.clear;
  const palette = getPhasePalette(type, progress, profile);
  const coverage = resolveCoverage(profile, cloudCover);
  const topAlpha = clamp(profile.hazeTop + coverage * 0.06, 0.015, 0.28);
  const bottomAlpha = clamp(profile.hazeBottom + coverage * 0.08, 0.05, 0.38);

  return `radial-gradient(circle at 50% 100%, ${toRgba(palette.highlight, topAlpha * 0.65)} 0%, transparent 42%), linear-gradient(180deg, ${toRgba(palette.highlight, topAlpha)} 0%, ${toRgba(palette.midtone, topAlpha * 0.55)} 36%, ${toRgba(palette.base, bottomAlpha)} 100%)`;
}

export function getCloudBands(
  condition = "",
  type = "sun",
  progress = 0.5,
  cloudCover = 0,
  windSpeed = 0,
  options = {},
) {
  const profile =
    cloudProfiles[getProfileKey(condition)] || cloudProfiles.clear;
  const palette = getPhasePalette(type, progress, profile);
  const coverage = resolveCoverage(profile, cloudCover);
  const windFactor = clamp((Number(windSpeed) || 0) / 35, 0, 1.35);
  const viewportScale = getViewportScale(options.viewportWidth);
  const reducedMotion = Boolean(options.reducedMotion);

  return profile.layers
    .filter(
      (layer, index) =>
        index < profile.minLayers || coverage >= layer.threshold,
    )
    .map((layer, bandIndex) => {
      const density = clamp(
        (coverage - layer.threshold + 0.18) / (1 - layer.threshold + 0.18),
        0.28,
        1,
      );
      const maxClouds = reducedMotion
        ? 3
        : Math.min(6, Math.round(4 * viewportScale));
      const count = Math.max(
        1,
        Math.min(
          maxClouds,
          Math.round(
            lerp(layer.count[0], layer.count[1], density) * viewportScale,
          ),
        ),
      );
      const duration = clamp(
        layer.duration - windFactor * layer.windInfluence,
        reducedMotion ? 90 : 22,
        reducedMotion ? 140 : 150,
      );
      const bandOpacity = clamp(
        lerp(layer.opacity[0], layer.opacity[1], density) +
          (type === "moon" ? 0.03 : 0),
        0.06,
        0.78,
      );
      const blur = lerp(layer.blur[0], layer.blur[1], density);
      const top = lerp(layer.top[0], layer.top[1], density);
      const height = lerp(layer.height[0], layer.height[1], density);

      return {
        top: `${top}%`,
        height: `${height}%`,
        opacity: 1,
        blur,
        speed: `${duration}s`,
        direction: layer.direction,
        clouds: Array.from({ length: count }).map((_, cloudIndex) => {
          const seed =
            (bandIndex + 1) * 97 + (cloudIndex + 1) * 31 + coverage * 100;
          const spread = (cloudIndex + 0.5) / count;
          const jitter = noise(seed);
          const width =
            lerp(layer.width[0], layer.width[1], jitter) * viewportScale;
          const heightRatio = lerp(0.68, 1.08, noise(seed + 2));
          const left = -8 + spread * 116 + (jitter - 0.5) * 10;
          const translateY = (noise(seed + 3) - 0.5) * 20;
          const scaleX = lerp(0.92, 1.18, noise(seed + 4));
          const scaleY = lerp(0.84, 1.05, noise(seed + 5));
          const cloudOpacity = clamp(
            bandOpacity - cloudIndex * 0.025 + (jitter - 0.5) * 0.03,
            0.08,
            0.88,
          );
          const shadowAlpha = clamp(0.06 + layer.depth * 0.1, 0.06, 0.16);

          return {
            left: `${left}%`,
            width: `${width}%`,
            height: `${heightRatio * 100}%`,
            opacity: cloudOpacity,
            transform: `translateY(${translateY}%) scale(${scaleX}, ${scaleY})`,
            background: `linear-gradient(180deg, ${toRgba(palette.highlight, Math.min(cloudOpacity + 0.08, 0.9))} 0%, ${toRgba(palette.midtone, cloudOpacity)} 64%, ${toRgba(palette.base, cloudOpacity * 0.82)} 100%)`,
            boxShadow: reducedMotion
              ? "none"
              : `0 ${8 + bandIndex * 4}px ${16 + bandIndex * 8}px ${toRgba(palette.shadow, shadowAlpha)}`,
            borderRadius: `${56 + noise(seed + 6) * 10}% ${48 + noise(seed + 7) * 12}% ${52 + noise(seed + 8) * 10}% ${46 + noise(seed + 9) * 12}% / ${58 + noise(seed + 10) * 8}% ${46 + noise(seed + 11) * 10}% ${54 + noise(seed + 12) * 8}% ${42 + noise(seed + 13) * 12}%`,
          };
        }),
      };
    });
}
