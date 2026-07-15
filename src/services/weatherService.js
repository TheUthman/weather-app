const WEATHER_BASE = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_BASE = "https://air-quality-api.open-meteo.com/v1/air-quality";
import { buildHistoricalWindows } from "../utils/weatherState";

const localTimeToIso = (localTime, utcOffsetSeconds = 0) => {
  if (!localTime) return null;
  const localAsUtc = Date.parse(`${localTime}Z`);
  if (!Number.isFinite(localAsUtc)) return null;
  return new Date(localAsUtc - utcOffsetSeconds * 1000).toISOString();
};

// Helper: Map Open-Meteo weather codes to icon names
const weatherCodeToIcon = (code) => {
  if (code === 0 || code === 1) return "sunny";
  if (code === 2) return "partly-cloudy";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "cloudy";
  if (code >= 51 && code <= 57) return "rain";
  if (code >= 61 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 85 && code <= 86) return "snow";
  if (code >= 95 && code <= 99) return "thunderstorm";
  return "cloudy";
};

// Helper: Map Open-Meteo weather codes to condition text
const weatherCodeToCondition = (code) => {
  const map = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Light Drizzle",
    53: "Drizzle",
    55: "Heavy Drizzle",
    56: "Freezing Drizzle",
    57: "Freezing Drizzle",
    61: "Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    66: "Freezing Rain",
    67: "Freezing Rain",
    71: "Light Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    77: "Snow Grains",
    80: "Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    85: "Light Snow Showers",
    86: "Heavy Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Thunderstorm with Hail",
  };
  return map[code] || "Unknown";
};

const transformCurrent = (current, daily) => {
  if (!current) return null;

  const sunriseISO = daily?.sunrise?.[0];
  const sunsetISO = daily?.sunset?.[0];

  return {
    temperature: {
      degrees: Math.round(current.temperature_2m),
      unit: "C",
    },
    feelsLikeTemperature: {
      degrees: Math.round(current.apparent_temperature),
      unit: "C",
    },
    relativeHumidity: current.relative_humidity_2m,
    weatherCode: current.weather_code,
    weatherCondition: {
      text: weatherCodeToCondition(current.weather_code),
      iconBaseUri: `https://open-meteo.com/${weatherCodeToIcon(current.weather_code)}`,
    },
    wind: {
      speed: { value: current.wind_speed_10m, unit: "KM_PER_HOUR" },
      gust: { value: current.wind_gusts_10m ?? 0, unit: "KM_PER_HOUR" },
      direction: current.wind_direction_10m,
    },
    airPressure: {
      meanSeaLevelMillibars: current.pressure_msl,
    },
    uvIndex: current.uv_index ?? 0,
    precipitation: current.precipitation ?? 0,
    cloudCover: current.cloud_cover ?? 0,
    visibility: current.visibility ?? null,
    dewPoint: {
      degrees: current.dew_point_2m ?? 0,
      unit: "C",
    },
    _sunrise: sunriseISO,
    _sunset: sunsetISO,
    _intervalStart: current.time,
  };
};

const transformHourly = (hourly) => {
  if (!hourly || !hourly.time) return [];

  return hourly.time.map((time, i) => ({
    interval: { startTime: time },
    temperature: {
      degrees: Math.round(hourly.temperature_2m[i]),
      unit: "C",
    },
    weatherCondition: {
      text: weatherCodeToCondition(hourly.weather_code[i]),
      iconBaseUri: `https://open-meteo.com/${weatherCodeToIcon(hourly.weather_code[i])}`,
    },
    weatherCode: hourly.weather_code[i],
    precipitationProbability: hourly.precipitation_probability?.[i] ?? 0,
    precipitation: hourly.precipitation?.[i] ?? 0,
    relativeHumidity: hourly.relative_humidity_2m?.[i] ?? null,
    windSpeed: hourly.wind_speed_10m?.[i] ?? 0,
    windGust: hourly.wind_gusts_10m?.[i] ?? 0,
    uvIndex: hourly.uv_index?.[i] ?? 0,
    isDay: hourly.is_day?.[i] === 1,
  }));
};

const transformDaily = (daily) => {
  if (!daily?.time) return [];

  return daily.time.map((time, i) => ({
    interval: { startTime: time },
    temperatureMax: {
      degrees: Math.round(daily.temperature_2m_max[i]),
      unit: "C",
    },
    temperatureMin: {
      degrees: Math.round(daily.temperature_2m_min[i]),
      unit: "C",
    },
    weatherCondition: {
      text: weatherCodeToCondition(daily.weather_code[i]),
      iconBaseUri: `https://open-meteo.com/${weatherCodeToIcon(daily.weather_code[i])}`,
    },
    weatherCode: daily.weather_code[i],
    sunEvents: {
      sunriseTime: daily.sunrise[i],
      sunsetTime: daily.sunset[i],
    },
    precipitationProbability: daily.precipitation_probability_max[i] ?? 0,
    precipitationSum: daily.precipitation_sum?.[i] ?? 0,
    windGustMax: daily.wind_gusts_10m_max?.[i] ?? 0,
    uvIndexMax: daily.uv_index_max?.[i] ?? 0,
  }));
};

const buildNextHourRain = (hourly) => {
  if (!hourly?.length) return [];

  const currentHour = hourly[0];
  const nextHour = hourly[1] || currentHour;

  return [0, 15, 30, 45].map((minutes, index) => {
    const progress = index / 4;
    const probability = Math.round(
      currentHour.precipitationProbability +
        (nextHour.precipitationProbability -
          currentHour.precipitationProbability) *
          progress,
    );
    const amount = Number(
      (
        (currentHour.precipitation +
          (nextHour.precipitation - currentHour.precipitation) * progress) /
        4
      ).toFixed(2),
    );

    return {
      label: minutes === 0 ? "Now" : `+${minutes} min`,
      minutes,
      probability,
      amount,
    };
  });
};

const buildForecastAlerts = (current, hourly, daily) => {
  const alerts = [];
  const nextHours = hourly.slice(0, 12);
  const today = daily[0];
  const expiresAt = nextHours.at(-1)?.interval?.startTime || null;

  if (
    current?.weatherCode >= 95 ||
    nextHours.some((hour) => hour.weatherCode >= 95)
  ) {
    alerts.push({
      id: "thunderstorm-risk",
      severity: "severe",
      title: "Thunderstorm risk",
      summary: "Thunderstorms may bring lightning, sudden heavy rain, and gusty winds.",
      guidance: "Move indoors when thunder is heard and avoid exposed areas.",
      kind: "thunderstorm",
      expiresAt,
      source: "Forecast signal",
    });
  }

  const strongestGust = Math.max(
    current?.wind?.gust?.value || 0,
    ...nextHours.map((hour) => hour.windGust || 0),
    today?.windGustMax || 0,
  );
  if (strongestGust >= 60) {
    alerts.push({
      id: "strong-wind-risk",
      severity: strongestGust >= 80 ? "severe" : "moderate",
      title: "Strong wind possible",
      summary: `Wind gusts may reach ${Math.round(strongestGust)} km/h.`,
      kind: "wind",
      value: strongestGust,
      guidance: "Secure loose outdoor items and take care around trees and power lines.",
      expiresAt,
      source: "Forecast signal",
    });
  }

  if (
    (today?.precipitationSum || 0) >= 25 ||
    nextHours.some(
      (hour) =>
        hour.precipitationProbability >= 85 && hour.precipitation >= 8,
    )
  ) {
    alerts.push({
      id: "heavy-rain-risk",
      severity: "moderate",
      title: "Heavy rain possible",
      summary: `Around ${Math.round(today?.precipitationSum || 0)} mm of rain may fall today.`,
      kind: "rain",
      value: today?.precipitationSum || 0,
      guidance: "Allow extra travel time and avoid moving through flooded roads.",
      expiresAt,
      source: "Forecast signal",
    });
  }

  if ((today?.temperatureMax?.degrees || 0) >= 40) {
    alerts.push({
      id: "extreme-heat-risk",
      severity: "severe",
      title: "Extreme heat risk",
      summary: `Temperatures may reach ${Math.round(today.temperatureMax.degrees)}°C.`,
      kind: "heat",
      value: today.temperatureMax.degrees,
      guidance: "Limit strenuous activity, drink water often, and seek shade.",
      expiresAt,
      source: "Forecast signal",
    });
  }

  return alerts.slice(0, 3);
};

const buildForecastUrl = (lat, lng) =>
  `${WEATHER_BASE}?latitude=${lat}&longitude=${lng}` +
  "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,uv_index,pressure_msl,precipitation,cloud_cover,visibility,dew_point_2m" +
  "&hourly=temperature_2m,relative_humidity_2m,weather_code,precipitation_probability,precipitation,wind_speed_10m,wind_gusts_10m,uv_index,is_day" +
  "&forecast_hours=12" +
  "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_gusts_10m_max,uv_index_max,sunrise,sunset" +
  "&forecast_days=10" +
  "&timezone=auto";

export const fetchForecastBundle = async (lat, lng, options = {}) => {
  try {
    const response = await fetch(buildForecastUrl(lat, lng), {
      signal: options.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch weather forecast: status ${response.status}`,
      );
    }

    const data = await response.json();

    const current = transformCurrent(data.current, data.daily);
    const hourly = transformHourly(data.hourly);
    const daily = transformDaily(data.daily);
    const utcOffsetSeconds = data.utc_offset_seconds || 0;

    daily.forEach((day) => {
      if (!day.sunEvents) return;
      day.sunEvents.sunriseTime = localTimeToIso(
        day.sunEvents.sunriseTime,
        utcOffsetSeconds,
      );
      day.sunEvents.sunsetTime = localTimeToIso(
        day.sunEvents.sunsetTime,
        utcOffsetSeconds,
      );
    });

    if (current) {
      current.timezone = data.timezone || null;
      current.utcOffsetSeconds = data.utc_offset_seconds || 0;
      current.updatedAt = localTimeToIso(
        data.current?.time,
        data.utc_offset_seconds || 0,
      );
    }

    return {
      current,
      hourly,
      daily,
      nextHourRain: buildNextHourRain(hourly),
      alerts: buildForecastAlerts(current, hourly, daily),
    };
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Error fetching bundled weather data:", error);
    }
    throw error;
  }
};

export const fetchAirQualityData = async (lat, lng, options = {}) => {
  const url =
    `${AIR_QUALITY_BASE}?latitude=${lat}&longitude=${lng}` +
    "&current=us_aqi,pm2_5,pm10&timezone=auto";
  const response = await fetch(url, { signal: options.signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch air quality: status ${response.status}`);
  }
  const data = await response.json();
  if (!data.current) return null;
  return {
    aqi: data.current.us_aqi ?? null,
    pm25: data.current.pm2_5 ?? null,
    pm10: data.current.pm10 ?? null,
    updatedAt: localTimeToIso(
      data.current.time,
      data.utc_offset_seconds || 0,
    ),
  };
};

const average = (values) => {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
};

export const fetchHistoricalComparison = async (lat, lng, options = {}) => {
  const now = new Date();
  let targetYear = now.getUTCFullYear();
  let targetMonth = now.getUTCMonth();
  let targetDay = now.getUTCDate();
  if (options.timezone) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: options.timezone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).formatToParts(now);
      const get = (type) => Number(parts.find((part) => part.type === type)?.value);
      targetYear = get("year");
      targetMonth = get("month") - 1;
      targetDay = get("day");
    } catch {
      // UTC date parts above are a safe fallback for an invalid timezone.
    }
  }
  const windows = buildHistoricalWindows(targetYear, targetMonth, targetDay);
  const datasets = await Promise.all(
    windows.map(async ({ start, end }) => {
      const url =
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}` +
        `&start_date=${start}&end_date=${end}` +
        "&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum" +
        "&timezone=auto";
      const response = await fetch(url, { signal: options.signal });
      if (!response.ok) {
        throw new Error(`Failed to fetch historical comparison: status ${response.status}`);
      }
      return response.json();
    }),
  );
  const dailyRecords = datasets.flatMap(({ daily }) =>
    (daily?.time || []).map((time, index) => ({
      time,
      temperatureMean: daily.temperature_2m_mean?.[index],
      temperatureMax: daily.temperature_2m_max?.[index],
      temperatureMin: daily.temperature_2m_min?.[index],
      precipitation: daily.precipitation_sum?.[index],
    })),
  );
  if (!dailyRecords.length) return null;

  return {
    years: new Set(dailyRecords.map(({ time }) => time.slice(0, 4))).size,
    sampleDays: dailyRecords.length,
    averageTemperature: average(dailyRecords.map(({ temperatureMean }) => temperatureMean)),
    averageHigh: average(dailyRecords.map(({ temperatureMax }) => temperatureMax)),
    averageLow: average(dailyRecords.map(({ temperatureMin }) => temperatureMin)),
    averagePrecipitation: average(dailyRecords.map(({ precipitation }) => precipitation)),
  };
};

export const fetchWeatherData = async (lat, lng) => {
  const { current } = await fetchForecastBundle(lat, lng);
  return current;
};

export const fetchDaysWeather = async (lat, lng) => {
  const { daily } = await fetchForecastBundle(lat, lng);
  return { forecastDays: daily };
};

export const fetchHourlyWeather = async (lat, lng) => {
  const { hourly } = await fetchForecastBundle(lat, lng);
  return { forecastHours: hourly };
};
