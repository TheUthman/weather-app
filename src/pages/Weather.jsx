/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CurrentWeather from "../components/CurrentWeather";
import HourlyForecast from "../components/HourlyForecast";
import DailyForecast from "../components/DailyForecast";
import { useWeather } from "../hooks/useWeather";
import {
  fetchGeocodingData,
  fetchReverseGeocodingData,
} from "../services/geocodingService";

// Helper parser to extract temperature values and convert Celsius to Fahrenheit
const parseTemp = (tempObj) => {
  if (tempObj === undefined || tempObj === null) return 0;
  if (typeof tempObj === "number") return tempObj;
  if (typeof tempObj === "object") {
    const val =
      tempObj.degrees !== undefined
        ? tempObj.degrees
        : tempObj.value !== undefined
          ? tempObj.value
          : 0;
    const unitType = tempObj.unit || "";
    if (
      unitType.toUpperCase() === "CELSIUS" ||
      unitType.toUpperCase() === "C"
    ) {
      return Math.round((val * 9) / 5 + 32);
    }
    return Math.round(val);
  }
  return Number(tempObj) || 0;
};

// Helper to get wind speed in mph
const getWindSpeed = (windObj) => {
  if (!windObj) return 0;
  const val =
    windObj.speed?.value !== undefined
      ? windObj.speed.value
      : windObj.value !== undefined
        ? windObj.value
        : 0;
  const speedUnit = windObj.speed?.unit || windObj.unit || "";
  if (
    speedUnit.toUpperCase() === "KM_PER_HOUR" ||
    speedUnit.toUpperCase() === "KMH"
  ) {
    return Math.round(val * 0.621371); // Convert km/h to mph
  }
  return Math.round(val);
};

// Helper to parse pressure to inHg
const getPressure = (pressureObj) => {
  if (!pressureObj) return 29.92;
  const val =
    pressureObj.meanSeaLevelMillibars !== undefined
      ? pressureObj.meanSeaLevelMillibars
      : pressureObj.value !== undefined
        ? pressureObj.value
        : pressureObj;
  if (typeof val === "number") {
    if (val > 500) {
      return Number((val * 0.02953).toFixed(2)); // Convert hPa/millibars to inHg
    }
    return val;
  }
  return 29.92;
};

// Helper to format ISO time strings to standard AM/PM format
const formatTimeStr = (isoString) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    console.warn("Failed to format date string:", e);
    return isoString;
  }
};

const formatHour = (isoString, index) => {
  if (index === 0) return "Now";
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleTimeString([], { hour: "numeric" });
  } catch (e) {
    console.warn("Failed to format date string:", e);
    return isoString;
  }
};

const formatDayName = (isoString) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString([], { weekday: "short" });
  } catch (e) {
    console.warn("Failed to format date string:", e);
    return isoString;
  }
};

const getIcon = (uri) => {
  if (!uri) return "sunny";
  // Extract the filename from the URI (e.g., ".../partly_cloudy.svg")
  const filename = uri.split("/").pop() || "sunny";
  // Remove extension and normalize underscores to hyphens
  const name = filename.split(".")[0].replace(/_/g, "-").toLowerCase();

  // Map the normalized name to keys supported by the WeatherIcon component
  if (name.includes("thunderstorm") || name.includes("storm"))
    return "thunderstorm";
  if (name.includes("snow") || name.includes("blizzard")) return "snow";
  if (
    name.includes("rain") ||
    name.includes("showers") ||
    name.includes("drizzle")
  )
    return "rain";
  if (name.includes("cloudy")) {
    if (name.includes("partly") || name.includes("mostly")) {
      return name.includes("night") ? "night-cloudy" : "partly-cloudy";
    }
    return "cloudy";
  }
  if (name.includes("clear") || name.includes("sunny")) {
    return name.includes("night") ? "night-clear" : "sunny";
  }
  return name;
};

const Weather = ({ preferences }) => {
  const navigate = useNavigate();
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLocationName, setActiveLocationName] = useState("");
  const [unit, setUnit] = useState(preferences.units === "metric" ? "C" : "F");
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    setUnit(preferences.units === "metric" ? "C" : "F");
  }, [preferences.units]);

  useEffect(() => {
    let active = true;

    const loadDefaultCity = async () => {
      try {
        const city = preferences.defaultCity || "San Francisco";
        const result = await fetchGeocodingData(city);
        if (!active) return;
        if (result && result.lat && result.lng) {
          setCoords(result);
          setActiveLocationName(city);
        }
      } catch (err) {
        console.error("Failed to load default city location:", err);
      }
    };

    const loadLocationByIP = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (!active) return;
        if (data.latitude && data.longitude) {
          setCoords({ lat: data.latitude, lng: data.longitude });
          setActiveLocationName(data.city || "Detected Location");
          console.log(`IP-based location detected: ${data.city}`);
        } else {
          await loadDefaultCity();
        }
      } catch (err) {
        console.error("IP Geolocation failed:", err);
        await loadDefaultCity();
      }
    };

    const loadInitialLocation = async () => {
      if (preferences.location === "auto") {
        await loadLocationByIP();
      } else {
        await loadDefaultCity();
      }
    };

    loadInitialLocation();

    return () => {
      active = false;
    };
  }, [preferences.location, preferences.defaultCity]);

  // Update browser document title when active location changes
  useEffect(() => {
    if (activeLocationName) {
      document.title = `${activeLocationName} - Weather Radar`;
    } else {
      document.title = "Weather Radar";
    }
  }, [activeLocationName]);

  // Fetch weather data via custom hook
  const {
    weather,
    hourly,
    daily,
    loadingCurrent,
    loadingHourly,
    loadingDaily,
  } = useWeather(coords.lat, coords.lng);

  // Search input query submit handler
  const handleSearch = async (query) => {
    if (!query || !query.trim()) return;
    try {
      setSearchLoading(true);
      const newCoords = await fetchGeocodingData(query);
      if (newCoords && newCoords.lat && newCoords.lng) {
        setCoords(newCoords);
        setActiveLocationName(query);
        setSearchQuery("");
      }
    } catch (err) {
      console.error("Geocoding failed for search query:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Mapped weather data memoized to prevent lag during scrolling and unrelated re-renders
  const weatherData = useMemo(() => {
    const conditionText =
      weather?.weatherCondition?.description?.text ||
      weather?.weatherCondition?.text ||
      "Clear";
    const iconName = getIcon(weather?.weatherCondition?.iconBaseUri);

    const firstDay = daily?.[0];
    const sunriseStr = firstDay?.sunEvents?.sunriseTime
      ? formatTimeStr(firstDay.sunEvents.sunriseTime)
      : "06:00 AM";
    const sunsetStr = firstDay?.sunEvents?.sunsetTime
      ? formatTimeStr(firstDay.sunEvents.sunsetTime)
      : "07:30 PM";

    return {
      location: activeLocationName,
      current: weather
        ? {
            temp: parseTemp(weather.temperature),
            condition: conditionText,
            icon: iconName,
            feelsLike: parseTemp(weather.feelsLikeTemperature),
            humidity:
              weather.relativeHumidity !== undefined
                ? weather.relativeHumidity
                : 0,
            windSpeed: getWindSpeed(weather.wind),
            pressure: getPressure(weather.airPressure),
            uvIndex: weather.uvIndex !== undefined ? weather.uvIndex : 0,
            sunrise: sunriseStr,
            sunset: sunsetStr,
          }
        : null,
      hourly: (hourly || []).slice(0, 12).map((h, index) => ({
        time: formatHour(h.interval?.startTime, index),
        temp: parseTemp(h.temperature),
        icon: getIcon(h.weatherCondition?.iconBaseUri),
      })),
      daily: (daily || []).map((d) => ({
        day: formatDayName(d.interval?.startTime),
        high: parseTemp(d.maxTemperature),
        low: parseTemp(d.minTemperature),
        icon: getIcon(
          // Prioritize daytime icons for the 7-day overview
          d.daytimeForecast?.weatherCondition?.iconBaseUri ||
            d.weatherCondition?.iconBaseUri,
        )
          .replace("night-", "")
          .replace("clear", "sunny"),
        condition:
          d.daytimeForecast?.weatherCondition?.description?.text ||
          d.daytimeForecast?.weatherCondition?.text ||
          "Clear",
        precip: d.daytimeForecast?.precipitation?.probability?.percent || 0,
      })),
    };
  }, [weather, hourly, daily, activeLocationName]);

  // Show a loading screen only when we do not have coordinates yet (initial loading)
  if (coords.lat === null || coords.lng === null) {
    return (
      <div
        className="weather-page page-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
        }}
      >
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Locating weather station...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-page page-container">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unit={unit}
        setUnit={setUnit}
        onOpenSettings={() => navigate("/settings")}
        onSearch={handleSearch}
      />

      <div className="weather-dashboard">
        <div className="main-stats">
          <CurrentWeather
            data={weatherData}
            unit={unit}
            loading={loadingCurrent || searchLoading}
          />
          <DailyForecast
            data={weatherData.daily}
            unit={unit}
            loading={loadingDaily || searchLoading}
          />
        </div>
        <HourlyForecast
          data={weatherData.hourly}
          unit={unit}
          loading={loadingHourly || searchLoading}
        />
      </div>
    </div>
  );
};

export default Weather;
