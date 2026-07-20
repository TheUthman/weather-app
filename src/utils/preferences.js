export const DEFAULT_PREFERENCES = Object.freeze({
  units: "imperial",
  theme: "auto",
  visualStyle: "classic",
  componentTransparency: 0,
  location: "manual",
  defaultCity: "San Francisco",
});

const oneOf = (value, options, fallback) =>
  options.includes(value) ? value : fallback;

export const normalizePreferences = (value = {}) => {
  const input = value && typeof value === "object" ? value : {};
  const transparency = Number(input.componentTransparency);

  return {
    units: oneOf(input.units, ["imperial", "metric"], DEFAULT_PREFERENCES.units),
    theme: oneOf(input.theme, ["light", "dark", "auto"], DEFAULT_PREFERENCES.theme),
    visualStyle: oneOf(
      input.visualStyle,
      ["classic", "minimal"],
      DEFAULT_PREFERENCES.visualStyle,
    ),
    componentTransparency: Number.isFinite(transparency)
      ? Math.min(100, Math.max(0, transparency))
      : DEFAULT_PREFERENCES.componentTransparency,
    location: oneOf(input.location, ["auto", "manual"], DEFAULT_PREFERENCES.location),
    defaultCity:
      typeof input.defaultCity === "string" && input.defaultCity.trim()
        ? input.defaultCity.trim()
        : DEFAULT_PREFERENCES.defaultCity,
  };
};
