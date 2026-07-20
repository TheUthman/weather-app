export const isFiniteMeasurement = (value) =>
  value !== null &&
  value !== undefined &&
  value !== "" &&
  Number.isFinite(Number(value));

export const hasValidCoords = (coords) =>
  Number.isFinite(coords?.lat) && Number.isFinite(coords?.lng);

export const coordinateKey = (latOrCoords, lng) => {
  const coords = typeof latOrCoords === "object"
    ? latOrCoords
    : { lat: latOrCoords, lng };
  return hasValidCoords(coords) ? `${coords.lat}:${coords.lng}` : null;
};

export const coordsMatch = (left, right) =>
  hasValidCoords(left) &&
  hasValidCoords(right) &&
  Math.abs(left.lat - right.lat) < 0.000001 &&
  Math.abs(left.lng - right.lng) < 0.000001;

export const shouldUseCachedForecast = (error, liveCurrent, cachedData) =>
  Boolean(error && !liveCurrent && cachedData);

const formatDate = (date) => date.toISOString().slice(0, 10);

export const buildHistoricalWindows = (targetYear, targetMonth, targetDay) =>
  [3, 2, 1].map((yearsAgo) => {
    const center = new Date(
      Date.UTC(targetYear - yearsAgo, targetMonth, targetDay),
    );
    const start = new Date(center.getTime() - 3 * 86_400_000);
    const end = new Date(center.getTime() + 3 * 86_400_000);
    return {
      year: center.getUTCFullYear(),
      start: formatDate(start),
      end: formatDate(end),
    };
  });
