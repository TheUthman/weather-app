const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const hasAny = (condition, words) =>
  words.some((word) => condition.includes(word));

export function getWeatherOverlay(
  condition = "",
  progress = 0.5,
  cloudCover = 0,
  precipitation = 0,
) {
  const normalized = condition.toLowerCase();
  const coverFactor = clamp((Number(cloudCover) || 0) / 100, 0, 1);
  const precipitationFactor = clamp((Number(precipitation) || 0) / 8, 0, 1);

  let tint = [7, 18, 35];
  let topDarkness = 0;
  let bottomDarkness = 0;

  if (progress < 0.18) {
    topDarkness += 0.08;
    bottomDarkness += 0.04;
  }

  if (hasAny(normalized, ["fog", "mist", "haze", "smoke"])) {
    tint = [147, 163, 184];
    topDarkness += 0.06;
    bottomDarkness += 0.12;
  }

  if (hasAny(normalized, ["cloud", "overcast"])) {
    topDarkness += 0.04;
    bottomDarkness += 0.06;
  }

  if (hasAny(normalized, ["rain", "drizzle", "shower"])) {
    tint = [24, 41, 68];
    topDarkness += 0.12;
    bottomDarkness += 0.14;
  }

  if (hasAny(normalized, ["snow", "sleet", "ice", "freezing"])) {
    tint = [90, 108, 135];
    topDarkness += 0.08;
    bottomDarkness += 0.1;
  }

  if (hasAny(normalized, ["thunder", "storm", "squall", "hail"])) {
    tint = [8, 12, 22];
    topDarkness += 0.22;
    bottomDarkness += 0.18;
  }

  topDarkness += coverFactor * 0.12 + precipitationFactor * 0.08;
  bottomDarkness += coverFactor * 0.08 + precipitationFactor * 0.1;

  return {
    background: `linear-gradient(180deg, rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, ${clamp(topDarkness, 0, 0.45)}) 0%, rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, ${clamp(bottomDarkness, 0, 0.38)}) 100%)`,
  };
}
