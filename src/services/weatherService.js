const WEATHER_BASE = "https://api.open-meteo.com/v1/forecast";

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
    weatherCondition: {
      text: weatherCodeToCondition(current.weather_code),
      iconBaseUri: `https://open-meteo.com/${weatherCodeToIcon(current.weather_code)}`,
    },
    wind: {
      speed: { value: current.wind_speed_10m, unit: "KM_PER_HOUR" },
    },
    airPressure: {
      meanSeaLevelMillibars: current.pressure_msl,
    },
    uvIndex: current.uv_index ?? 0,
    // Provide sunrise/sunset at the top level for use by Weather.jsx
    _sunrise: sunriseISO,
    _sunset: sunsetISO,
    _intervalStart: current.time,
  };
};

// Transform Open-Meteo hourly data to match the expected hourly shape
const transformHourly = (hourly) => {
  if (!hourly || !hourly.time) return [];
  return hourly.time.map((time, i) => ({
    interval: { startTime: time },
    temperature: {
      degrees: Math.round(hourly.temperature_2m[i]),
      unit: "C",
    },
    weatherCondition: {
      iconBaseUri: `https://open-meteo.com/${weatherCodeToIcon(hourly.weather_code[i])}`,
    },
  }));
};

export const fetchWeatherData = async (lat, lng) => {
  try {
    const response = await fetch(
      `${WEATHER_BASE}?latitude=${lat}&longitude=${lng}` +
      "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index,pressure_msl" +
      "&daily=sunrise,sunset" +
      "&timezone=auto"
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch current conditions: status ${response.status}`);
    }
    const data = await response.json();
    return transformCurrent(data.current, data.daily);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
};

export const fetchDaysWeather = async (lat, lng) => {
  try {
    const response = await fetch(
      `${WEATHER_BASE}?latitude=${lat}&longitude=${lng}` +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset" +
      "&forecast_days=10" +
      "&timezone=auto"
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch days forecast: status ${response.status}`);
    }
    const data = await response.json();

    if (!data.daily) return { forecastDays: [] };

    // Return shape matching previous { forecastDays: [...] }
    const days = data.daily.time.map((time, i) => ({
      interval: { startTime: time },
      temperatureMax: {
        degrees: Math.round(data.daily.temperature_2m_max[i]),
        unit: "C",
      },
      temperatureMin: {
        degrees: Math.round(data.daily.temperature_2m_min[i]),
        unit: "C",
      },
      weatherCondition: {
        text: weatherCodeToCondition(data.daily.weather_code[i]),
        iconBaseUri: `https://open-meteo.com/${weatherCodeToIcon(data.daily.weather_code[i])}`,
      },
      sunEvents: {
        sunriseTime: data.daily.sunrise[i],
        sunsetTime: data.daily.sunset[i],
      },
      precipitationProbability: data.daily.precipitation_probability_max[i] ?? 0,
    }));

    return { forecastDays: days };
  } catch (error) {
    console.error("Error fetching days weather data:", error);
    throw error;
  }
};

export const fetchHourlyWeather = async (lat, lng) => {
  try {
    const response = await fetch(
      `${WEATHER_BASE}?latitude=${lat}&longitude=${lng}` +
      "&hourly=temperature_2m,weather_code" +
      "&forecast_hours=12" +
      "&timezone=auto"
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch hourly forecast: status ${response.status}`);
    }
    const data = await response.json();

    if (!data.hourly) return { forecastHours: [] };

    return { forecastHours: transformHourly(data.hourly) };
  } catch (error) {
    console.error("Error fetching hourly weather data:", error);
    throw error;
  }
};
