/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useTransition,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import CurrentWeather from "../components/CurrentWeather";
import HourlyForecast from "../components/HourlyForecast";
import DailyForecast from "../components/DailyForecast";
import SkyLayer from "../components/SkyLayer";
import { useWeather } from "../hooks/useWeather";
import { useCelestial } from "../hooks/useCelestial";
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

const getWindDirection = (degrees) => {
  if (degrees === undefined || degrees === null) return "";
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(degrees / 45) % 8];
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
  const name =
    uri.split("/").pop()?.split(".")[0].replace(/_/g, "-").toLowerCase() ||
    "sunny";
  if (name.includes("thunderstorm")) return "thunderstorm";
  if (name.includes("snow")) return "snow";
  if (name.includes("rain") || name.includes("drizzle")) return "rain";
  if (name.includes("fog") || name.includes("haz") || name.includes("mist") || name.includes("wind")) return "cloudy";
  if (name.includes("cloudy")) {
    if (name.includes("mostly") || name.includes("overcast")) return "cloudy";
    return name.includes("night") ? "night-cloudy" : "partly-cloudy";
  }
  if (name.includes("clear") || name.includes("sun") || name.includes("fair"))
    return name.includes("night") ? "night-clear" : "sunny";
  return "cloudy";
};

const Weather = ({ preferences, setPreferences }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize with cached coordinates to trigger weather fetch immediately on load
  const [coords, setCoords] = useState(() => {
    const cached = localStorage.getItem("last_weather_coords");
    if (cached) {
      return JSON.parse(cached);
    }
    return { lat: null, lng: null };
  });

  // UI Cache: Store weather object to render LCP content instantly before fetch completes
  const [cachedData, setCachedData] = useState(() => {
    const saved = localStorage.getItem("last_weather_ui_data");
    return saved ? JSON.parse(saved) : null;
  });

  const [activeLocationName, setActiveLocationName] = useState(
    localStorage.getItem("last_weather_name") || "",
  );
  const [unit, setUnit] = useState(preferences.units === "metric" ? "C" : "F");
  // Transition for high-responsiveness
  const [isPending, startTransition] = useTransition();
  const [pointer, setPointer] = useState({ x: 50, y: 35 });

  const [isRefreshing, setIsRefreshing] = useState(false);
  // Wrapped unit toggle to improve INP
  const handleUnitChange = useCallback((newUnit) => {
    const newPreferenceUnit = newUnit === "C" ? "metric" : "imperial";
    if (setPreferences) {
      setPreferences((prev) => ({ ...prev, units: newPreferenceUnit }));
    } else {
      // Fallback if setter isn't provided
      setUnit(newUnit);
    }
  }, [setPreferences]);

  useEffect(() => {
    setUnit(preferences.units === "metric" ? "C" : "F");
  }, [preferences.units]);

  // Handle navigation state from Search page (incoming search results)
  useEffect(() => {
    const state = location.state;
    if (state?.searchCoords) {
      startTransition(() => {
        setCoords(state.searchCoords);
        setActiveLocationName(state.searchQuery || "Searched Location");
        localStorage.setItem("last_weather_source", "search");
      });
      // Clear the navigation state so it doesn't re-trigger
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Persist coordinates whenever they change
  useEffect(() => {
    if (coords.lat && coords.lng) {
      localStorage.setItem("last_weather_coords", JSON.stringify(coords));
    }
    if (activeLocationName) {
      localStorage.setItem("last_weather_name", activeLocationName);
    }
  }, [coords, activeLocationName]);

  // Manually trigger location detection using browser geolocation
  const handleManualDetect = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      const { latitude, longitude } = position.coords;
      const result = { lat: latitude, lng: longitude };
      setCoords(result);
      // Reverse geocode to get the city name
      const cityName = await fetchReverseGeocodingData(latitude, longitude);
      setActiveLocationName(cityName || "Detected Location");
      localStorage.setItem("last_weather_source", "auto");
    } catch (err) {
      console.error("Manual detection failed", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  }, []);

  useEffect(() => {
    // If there is an active incoming search transition, let the search useEffect handle it.
    if (location.state?.searchCoords) return;

    const cachedSource = localStorage.getItem("last_weather_source");
    const cachedName = localStorage.getItem("last_weather_name");

    const modeMismatch = preferences.location !== cachedSource;
    const cityMismatch = preferences.location === "manual" && preferences.defaultCity !== cachedName;
    const noCoords = !coords.lat || !coords.lng;

    if (modeMismatch || cityMismatch || noCoords) {
      let active = true;

      const loadDefaultCity = async () => {
        try {
          const city = preferences.defaultCity || "San Francisco";
          const result = await fetchGeocodingData(city);
          if (!active) return;
          if (result && result.lat && result.lng) {
            setCoords(result);
            setActiveLocationName(city);
            localStorage.setItem("last_weather_source", "manual");
          }
        } catch (err) {
          console.error("Failed to load default city location:", err);
        }
      };

      const loadLocationByBrowser = async () => {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 300000,
            });
          });
          if (!active) return;
          const { latitude, longitude } = position.coords;
          const newLat = latitude;
          const newLng = longitude;
          const newName = await fetchReverseGeocodingData(latitude, longitude);
          if (!active) return;

          setCoords({ lat: newLat, lng: newLng });
          setActiveLocationName(newName || "Detected Location");
          localStorage.setItem("last_weather_source", "auto");
        } catch (err) {
          console.error("Browser geolocation failed:", err);
          await loadDefaultCity();
        }
      };

      if (preferences.location === "auto") {
        loadLocationByBrowser();
      } else {
        loadDefaultCity();
      }

      return () => {
        active = false;
      };
    }
  }, [preferences.location, preferences.defaultCity, location.state, coords.lat, coords.lng]);

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

  // Celestial data for sky-aware coloring of weather components
  const celestial = useCelestial(daily);

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
            windDirection: getWindDirection(weather.wind?.direction),
            pressure: getPressure(weather.airPressure),
            uvIndex: weather.uvIndex !== undefined ? weather.uvIndex : 0,
            precipitation: weather.precipitation ?? 0,
            cloudCover: weather.cloudCover ?? 0,
            visibility:
              weather.visibility !== null && weather.visibility !== undefined
                ? Math.round((weather.visibility / 1609.344) * 10) / 10
                : null,
            dewPoint: parseTemp(weather.dewPoint),
            sunrise: sunriseStr,
            sunset: sunsetStr,
          }
        : null,
      hourly: (hourly || []).slice(0, 12).map((h, index) => ({
        time: formatHour(h.interval?.startTime, index),
        temp: parseTemp(h.temperature),
        icon: getIcon(h.weatherCondition?.iconBaseUri),
        precip: h.precipitationProbability || 0,
      })),
      daily: (daily || []).map((d) => ({
        day: formatDayName(d.interval?.startTime),
        high: parseTemp(d.temperatureMax),
        low: parseTemp(d.temperatureMin),
        icon: getIcon(d.weatherCondition?.iconBaseUri),
        condition: d.weatherCondition?.text || "Unknown",
        precip: d.precipitationProbability || 0,
      })),
    };
  }, [weather, hourly, daily, activeLocationName]);

  useEffect(() => {
    if (weatherData.current && !loadingCurrent) {
      localStorage.setItem("last_weather_ui_data", JSON.stringify(weatherData));
    }
  }, [weatherData, loadingCurrent]);

  // Show a loading screen only when we do not have coordinates yet (initial loading)
  if (coords.lat === null || coords.lng === null) {
    return (
      <div
        className="weather-page page-container"
        style={{
          "--pointer-x": `${pointer.x}%`,
          "--pointer-y": `${pointer.y}%`,
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
    <>
      <SkyLayer
        daily={daily}
        condition={weatherData.current?.condition}
      />
    <div
      className="weather-page page-container"
      style={{
        "--pointer-x": `${pointer.x}%`,
        "--pointer-y": `${pointer.y}%`,
      }}
    >

      <Header
        unit={unit}
        setUnit={handleUnitChange}
        onOpenSettings={() => navigate("/settings")}
        onOpenSearch={() => navigate("/search")}
        onDetectLocation={handleManualDetect}
        isDetecting={isRefreshing}
      />

      <div className="weather-dashboard">
        <CurrentWeather
          data={weatherData.current ? weatherData : cachedData}
          unit={unit}
          loading={loadingCurrent && !cachedData}
          celestialType={celestial.type}
          celestialProgress={celestial.progress}
        />
        <div className="main-stats">
          <HourlyForecast
            data={
              weatherData.current
                ? weatherData.hourly
                : cachedData?.hourly || []
            }
            unit={unit}
            loading={loadingHourly && !cachedData}
            celestialType={celestial.type}
            celestialProgress={celestial.progress}
          />
          <DailyForecast
            data={
              weatherData.current ? weatherData.daily : cachedData?.daily || []
            }
            unit={unit}
            loading={loadingDaily && !cachedData}
            celestialType={celestial.type}
            celestialProgress={celestial.progress}
          />
        </div>
      </div>
    </div>
    </>
  );
};

export default Weather;
