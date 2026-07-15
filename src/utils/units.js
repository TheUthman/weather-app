import { isFiniteMeasurement } from "./weatherState";

export const fahrenheitToCelsius = (value) => (Number(value) - 32) * 5 / 9;
export const celsiusToFahrenheit = (value) => Number(value) * 9 / 5 + 32;
export const mphToKmh = (value) => Number(value) * 1.609344;
export const kmhToMph = (value) => Number(value) * 0.621371;
export const milesToKm = (value) => Number(value) * 1.609344;
export const inHgToHpa = (value) => Number(value) / 0.02953;
export const mmToInches = (value) => Number(value) / 25.4;

const valid = isFiniteMeasurement;

export const displayTemperature = (fahrenheit, unit) => {
  if (!valid(fahrenheit)) return null;
  return Math.round(unit === "C" ? fahrenheitToCelsius(fahrenheit) : Number(fahrenheit));
};

export const displayTemperatureDelta = (celsiusDelta, unit) => {
  if (!valid(celsiusDelta)) return null;
  return unit === "C" ? Number(celsiusDelta) : Number(celsiusDelta) * 9 / 5;
};

export const formatWindFromMph = (mph, unit) => {
  if (!valid(mph)) return "—";
  return unit === "C" ? `${Math.round(mphToKmh(mph))} km/h` : `${Math.round(Number(mph))} mph`;
};

export const formatWindFromKmh = (kmh, unit, includeUnit = true) => {
  if (!valid(kmh)) return "—";
  const value = unit === "C" ? Number(kmh) : kmhToMph(kmh);
  const suffix = unit === "C" ? " km/h" : " mph";
  return `${Math.round(value)}${includeUnit ? suffix : ""}`;
};

export const convertWindFromKmh = (kmh, unit) =>
  unit === "C" ? Number(kmh) : kmhToMph(kmh);

export const formatPressureFromInHg = (inHg, unit) => {
  if (!valid(inHg)) return "—";
  return unit === "C" ? `${Math.round(inHgToHpa(inHg))} hPa` : `${Number(inHg).toFixed(2)} inHg`;
};

export const formatVisibilityFromMiles = (miles, unit) => {
  if (!valid(miles)) return "—";
  return unit === "C" ? `${milesToKm(miles).toFixed(1)} km` : `${Number(miles).toFixed(1)} mi`;
};

export const formatPrecipitationFromMm = (mm, unit, digits = 2) => {
  if (!valid(mm)) return "—";
  return unit === "C" ? `${Number(mm).toFixed(1)} mm` : `${mmToInches(mm).toFixed(digits)} in`;
};

export const formatSignedPrecipitationFromMm = (mm, unit) => {
  if (!valid(mm)) return "—";
  const converted = unit === "C" ? Number(mm) : mmToInches(mm);
  const suffix = unit === "C" ? "mm" : "in";
  return `${converted > 0 ? "+" : ""}${converted.toFixed(unit === "C" ? 1 : 2)} ${suffix}`;
};
