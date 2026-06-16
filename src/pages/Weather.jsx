/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useTransition,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
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

const weatherCodeMap = {
  0: { condition: "Clear Sky", icon: "sunny" },
  1: { condition: "Mainly Clear", icon: "sunny" },
  2: { condition: "Partly Cloudy", icon: "partly-cloudy" },
  3: { condition: "Overcast", icon: "cloudy" },
  45: { condition: "Fog", icon: "cloudy" },
  48: { condition: "Fog", icon: "cloudy" },
  51: { condition: "Light Drizzle", icon: "rain" },
  53: { condition: "Drizzle", icon: "rain" },
  55: { condition: "Heavy Drizzle", icon: "rain" },
  61: { condition: "Rain", icon: "rain" },
  63: { condition: "Moderate Rain", icon: "rain" },
  65: { condition: "Heavy Rain", icon: "rain" },
  71: { condition: "Snow", icon: "snow" },
  80: { condition: "Rain Showers", icon: "rain" },
  95: { condition: "Thunderstorm", icon: "thunderstorm" },
};

const getIcon = (uri) => {
  if (!uri) return "sunny";
  const name = uri.split("/").pop()?.split(".")[0].replace(/_/g, "-").toLowerCase() || "sunny";
  if (name.includes("thunderstorm")) return "thunderstorm";
  if (name.includes("snow")) return "snow";
  if (name.includes("rain") || name.includes("drizzle")) return "rain";
  if (name.includes("cloudy")) return name.includes("night") ? "night-cloudy" : "partly-cloudy";
  if (name.includes("clear") || name.includes("sunny")) return name.includes("night") ? "night-clear" : "sunny";
  return "cloudy";
};

const Weather = ({ preferences }) => {
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
  const [openMeteoDaily, setOpenMeteoDaily] = useState([]);
  const [loadingDailyMeteo, setLoadingDailyMeteo] = useState(false);

  // Transition for high-responsiveness
  const [isPending, startTransition] = useTransition();

  // Pull to refresh states
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullThreshold = 70;
  const touchStartRef = useRef(0);
  const containerRef = useRef(null);

  // Wrapped unit toggle to improve INP
  const handleUnitChange = useCallback((newUnit) => {
    startTransition(() => {
      setUnit(newUnit);
    });
  }, []);

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

  // Manually trigger location detection (Feature Request)
  const handleManualDetect = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      if (data.latitude && data.longitude) {
        const result = { lat: data.latitude, lng: data.longitude };
        setCoords(result);
        setActiveLocationName(data.city || "Detected Location");
      }
    } catch (err) {
      console.error("Manual detection failed", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  }, []);

  useEffect(() => {
    // Don't auto-trigger if we have cached coords or a search result
    if (location.state?.searchCoords || coords.lat) return;

    let active = true;

    const loadDefaultCity = async () => {
      try {
        const city = preferences.defaultCity || "San Francisco";
        const result = await fetchGeocodingData(city);
        if (!active) return;
        if (result && result.lat && result.lng) {
          setCoords((prev) => {
            if (prev.lat === result.lat && prev.lng === result.lng) return prev;
            return result;
          });
          setActiveLocationName((prev) => (prev === city ? prev : city));
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
          const newLat = data.latitude;
          const newLng = data.longitude;
          const newName = data.city || "Detected Location";

          setCoords((prev) => {
            if (prev.lat === newLat && prev.lng === newLng) return prev;
            return { lat: newLat, lng: newLng };
          });
          setActiveLocationName((prev) => (prev === newName ? prev : newName));
          console.log(`IP-based location detected: ${data.city}`);
        } else {
          await loadDefaultCity();
        }
      } catch (err) {
        console.error("IP Geolocation failed:", err);
        await loadDefaultCity();
      }
    };

    const loadInitialLocation = async (force = false) => {
      if (force) setIsRefreshing(true);
      if (preferences.location === "auto") {
        await loadLocationByIP();
      } else {
        await loadDefaultCity();
      }
      if (force) {
        setTimeout(() => setIsRefreshing(false), 800);
      }
    };

    loadInitialLocation();

    return () => {
      active = false;
    };
  }, [preferences.location, preferences.defaultCity, location.state]);

  // Fetch Open-Meteo Daily Forecast separately as requested
  useEffect(() => {
    if (!coords.lat || !coords.lng) return;
    let cancelled = false;

    const fetchMeteo = async () => {
      setLoadingDailyMeteo(true);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=10&timezone=auto`;
        const response = await fetch(url);
        const result = await response.json();
        if (!cancelled && result.daily) {
          const mapped = result.daily.time.map((time, i) => ({
            day: formatDayName(time),
            high: Math.round((result.daily.temperature_2m_max[i] * 9) / 5 + 32),
            low: Math.round((result.daily.temperature_2m_min[i] * 9) / 5 + 32),
            icon: weatherCodeMap[result.daily.weather_code[i]]?.icon || "cloudy",
            condition: weatherCodeMap[result.daily.weather_code[i]]?.condition || "Unknown",
            precip: result.daily.precipitation_probability_max[i] || 0,
          }));
          setOpenMeteoDaily(mapped);
        }
      } catch (err) {
        console.error("Open-Meteo fetch failed", err);
      } finally {
        if (!cancelled) setLoadingDailyMeteo(false);
      }
    };
    fetchMeteo();
    return () => { cancelled = true; };
  }, [coords.lat, coords.lng]);

  // Pull to Refresh Handlers
  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      touchStartRef.current = e.touches[0].clientY;
    } else {
      touchStartRef.current = 0;
    }
  };

  const handleTouchMove = (e) => {
    if (touchStartRef.current === 0 || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartRef.current;

    if (distance > 0) {
      const dampedDistance = Math.min(distance * 0.4, 120);
      setPullDistance(dampedDistance);
      if (dampedDistance > 10) {
        if (e.cancelable) e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > pullThreshold && !isRefreshing) {
      window.location.reload();
    }
    setPullDistance(0);
    touchStartRef.current = 0;
  };

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
      daily: openMeteoDaily || [],
    };
  }, [weather, hourly, openMeteoDaily, activeLocationName]);

  // Persist UI data to localStorage for instant subsequent LCP
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
    <div
      className={`weather-page page-container ${pullDistance > 0 ? "pulling" : ""}`}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition:
          pullDistance === 0
            ? "transform 0.3s cubic-bezier(0.2, 0, 0.1, 1)"
            : "none",
      }}
    >
      <div
        className="pull-indicator"
        style={{ opacity: pullDistance / pullThreshold }}
      >
        <FiRefreshCw
          className={pullDistance > pullThreshold ? "spin-ready" : ""}
          style={{ transform: `rotate(${pullDistance * 3}deg)` }}
        />
      </div>

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
        />
        <div className="main-stats">
          <HourlyForecast
            data={weatherData.current ? weatherData.hourly : (cachedData?.hourly || [])}
            unit={unit}
            loading={loadingHourly && !cachedData}
          />
          <DailyForecast
            data={weatherData.current ? weatherData.daily : (cachedData?.daily || [])}
            unit={unit}
            loading={loadingDailyMeteo && !cachedData}
          />
        </div>
      </div>
    </div>
  );
};

export default Weather;
