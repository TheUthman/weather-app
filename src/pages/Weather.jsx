/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import CurrentWeather from "../components/CurrentWeather";
import { useWeather } from "../hooks/useWeather";

const SkyLayer = lazy(() => import("../components/SkyLayer"));
const InsightsCard = lazy(() => import("../components/InsightsCard"));
const HourlyForecast = lazy(() => import("../components/HourlyForecast"));
const DailyForecast = lazy(() => import("../components/DailyForecast"));
import {
  fetchGeocodingData,
  fetchReverseGeocodingData,
} from "../services/geocodingService";
import { useToast } from "../context/ToastContext";

const FAVORITES_STORAGE_KEY = "weatherAppFavoriteLocations";

const getFavoriteId = (coords) => `${coords.lat}-${coords.lng}`;

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
  if (
    name.includes("fog") ||
    name.includes("haz") ||
    name.includes("mist") ||
    name.includes("wind")
  )
    return "cloudy";
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
  const { addToast } = useToast();
  const defaultCoords = useMemo(() => ({ lat: 37.7749, lng: -122.4194 }), []);

  // Initialize with cached coordinates to trigger weather fetch immediately on load
  const [coords, setCoords] = useState(() => {
    if (location.state?.searchCoords) {
      return location.state.searchCoords;
    }
    const cached = localStorage.getItem("last_weather_coords");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.lat != null && parsed?.lng != null) {
          return parsed;
        }
      } catch {
        // Fall back to the default city coordinates below.
      }
    }
    return defaultCoords;
  });

  // UI cache is only a fallback when the live request fails.
  const [cachedData, setCachedData] = useState(() => {
    try {
      const saved = localStorage.getItem("last_weather_ui_data");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeLocationName, setActiveLocationName] = useState(() => {
    if (location.state?.searchQuery) {
      return location.state.searchQuery;
    }
    return localStorage.getItem("last_weather_name") || "";
  });
  const [unit, setUnit] = useState(preferences.units === "metric" ? "C" : "F");
  const [pointer, setPointer] = useState({ x: 50, y: 35 });
  const [showSkyLayer, setShowSkyLayer] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  // Wrapped unit toggle to improve INP
  const handleUnitChange = useCallback(
    (newUnit) => {
      const newPreferenceUnit = newUnit === "C" ? "metric" : "imperial";
      if (setPreferences) {
        setPreferences((prev) => ({ ...prev, units: newPreferenceUnit }));
      } else {
        // Fallback if setter isn't provided
        setUnit(newUnit);
      }
    },
    [setPreferences],
  );

  useEffect(() => {
    setUnit(preferences.units === "metric" ? "C" : "F");
  }, [preferences.units]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const revealSky = () => setShowSkyLayer(true);
    const id = window.setTimeout(revealSky, 250);
    return () => window.clearTimeout(id);
  }, []);

  // Handle navigation state from Search page (incoming search results)
  useEffect(() => {
    const state = location.state;
    if (state?.searchCoords) {
      localStorage.setItem("last_weather_source", "search");
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

    const getPosition = (options) =>
      new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

    try {
      let position;
      try {
        // Try high-accuracy first with a generous timeout
        position = await getPosition({
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 60000,
        });
      } catch (highAccErr) {
        // If high-accuracy times out (code 3), retry with low accuracy
        if (highAccErr.code === 3) {
          position = await getPosition({
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 300000,
          });
        } else {
          throw highAccErr;
        }
      }

      const { latitude, longitude } = position.coords;
      const result = { lat: latitude, lng: longitude };
      setCoords(result);
      // Reverse geocode to get the city name
      const cityName = await fetchReverseGeocodingData(latitude, longitude);
      setActiveLocationName(cityName || "Detected Location");
      localStorage.setItem("last_weather_source", "auto");
      addToast(
        `Location updated to ${cityName || "Detected Location"}`,
        "success",
      );
    } catch (err) {
      console.error("Manual detection failed", err);
      const message =
        err.code === 1
          ? "Location access denied. Check browser permissions."
          : err.code === 3
            ? "Location request timed out. Try again."
            : "Could not detect location. Using default city.";
      addToast(message, "error");
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  }, [addToast]);

  useEffect(() => {
    // If there is an active incoming search transition, let the search useEffect handle it.
    if (location.state?.searchCoords) return;

    const cachedSource = localStorage.getItem("last_weather_source");
    const cachedName = localStorage.getItem("last_weather_name");

    const modeMismatch = preferences.location !== cachedSource;
    const cityMismatch =
      preferences.location === "manual" &&
      preferences.defaultCity !== cachedName;
    const noCoords = !coords.lat || !coords.lng;

    if (modeMismatch || cityMismatch || noCoords) {
      let cleanup = () => {};
      const timer = window.setTimeout(() => {
        let active = true;
        cleanup = () => {
          active = false;
        };

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
            addToast(
              "Failed to find the default city. Check your settings.",
              "error",
            );
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
            const newName = await fetchReverseGeocodingData(
              latitude,
              longitude,
            );
            if (!active) return;

            setCoords({ lat: newLat, lng: newLng });
            setActiveLocationName(newName || "Detected Location");
            localStorage.setItem("last_weather_source", "auto");
          } catch (err) {
            console.error("Browser geolocation failed:", err);
            addToast(
              "Auto-detect failed. Falling back to default city.",
              "warning",
            );
            await loadDefaultCity();
          }
        };

        if (preferences.location === "auto") {
          loadLocationByBrowser();
        } else {
          loadDefaultCity();
        }
      }, 180);

      return () => {
        cleanup();
        window.clearTimeout(timer);
      };
    }
  }, [
    preferences.location,
    preferences.defaultCity,
    location.state,
    coords.lat,
    coords.lng,
    addToast,
  ]);

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
    error: weatherError,
  } = useWeather(coords.lat, coords.lng);

  // Persist sunrise/sunset times for automatic theme switching
  useEffect(() => {
    const firstDay = daily?.[0];
    if (firstDay?.sunEvents?.sunriseTime && firstDay?.sunEvents?.sunsetTime) {
      localStorage.setItem("weather_sunrise", firstDay.sunEvents.sunriseTime);
      localStorage.setItem("weather_sunset", firstDay.sunEvents.sunsetTime);
    }
  }, [daily]);

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

  const shouldUseCachedFallback =
    Boolean(weatherError) && !weatherData.current && Boolean(cachedData);
  const displayData = weatherData.current
    ? weatherData
    : shouldUseCachedFallback
      ? cachedData
      : null;
  const displayHourly = weatherData.current
    ? weatherData.hourly
    : shouldUseCachedFallback
      ? cachedData?.hourly || []
      : [];
  const displayDaily = weatherData.current
    ? weatherData.daily
    : shouldUseCachedFallback
      ? cachedData?.daily || []
      : [];
  const isWaitingForLiveData = !weatherData.current && !weatherError;
  const currentFavoriteId =
    coords.lat && coords.lng ? getFavoriteId(coords) : "";
  const isCurrentFavorite =
    Boolean(currentFavoriteId) &&
    favorites.some((favorite) => favorite.id === currentFavoriteId);
  const canFavoriteCurrent = Boolean(
    currentFavoriteId && activeLocationName && displayData?.current,
  );

  const handleToggleFavorite = useCallback(() => {
    if (!canFavoriteCurrent) {
      addToast("Load a location before saving it.", "warning");
      return;
    }

    const favorite = {
      id: currentFavoriteId,
      name: activeLocationName,
      admin1: "",
      country: "",
      latitude: coords.lat,
      longitude: coords.lng,
    };

    if (isCurrentFavorite) {
      setFavorites((current) =>
        current.filter((item) => item.id !== currentFavoriteId),
      );
      addToast(`${activeLocationName} removed from favorites`, "info");
      return;
    }

    setFavorites((current) => [favorite, ...current].slice(0, 8));
    addToast(`${activeLocationName} added to favorites`, "success");
  }, [
    activeLocationName,
    addToast,
    canFavoriteCurrent,
    coords.lat,
    coords.lng,
    currentFavoriteId,
    isCurrentFavorite,
  ]);

  return (
    <>
      {showSkyLayer && (
        <Suspense fallback={null}>
          <SkyLayer
            daily={daily}
            condition={weatherData.current?.condition}
            cloudCover={weatherData.current?.cloudCover}
            windSpeed={weatherData.current?.windSpeed}
            precipitation={weatherData.current?.precipitation}
          />
        </Suspense>
      )}
      <div
        className="weather-page page-container"
        style={{
          "--pointer-x": `${pointer.x}%`,
          "--pointer-y": `${pointer.y}%`,
        }}
      >
        <Header
          unit={unit}
          data={weatherData?.current?.condition}
          setUnit={handleUnitChange}
          onOpenSettings={() => navigate("/settings")}
          onOpenSearch={() => navigate("/search")}
          onDetectLocation={handleManualDetect}
          isDetecting={isRefreshing}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={isCurrentFavorite}
          canFavorite={canFavoriteCurrent}
        />

        <div className="weather-dashboard">
          <CurrentWeather
            data={displayData}
            unit={unit}
            loading={loadingCurrent || isWaitingForLiveData}
          />
          {displayData?.current ? (
            <Suspense
              fallback={
                <div
                  style={{
                    minHeight: 220,
                    borderRadius: 20,
                    background: "var(--card-bg)",
                  }}
                />
              }
            >
              <InsightsCard
                weatherCondition={displayData.current.condition}
                temperature={displayData.current.temp}
                humidity={displayData.current.humidity}
                uvIndex={displayData.current.uvIndex}
                aqi={50}
                pm25={15}
                pm10={25}
              />
            </Suspense>
          ) : (
            <div
              style={{
                minHeight: 220,
                borderRadius: 20,
                background: "var(--card-bg)",
              }}
            />
          )}
          <div className="main-stats">
            <Suspense
              fallback={
                <div
                  style={{
                    minHeight: 260,
                    borderRadius: 20,
                    background: "var(--card-bg)",
                  }}
                />
              }
            >
              <HourlyForecast
                data={displayHourly}
                unit={unit}
                loading={loadingHourly || isWaitingForLiveData}
              />
            </Suspense>
            <Suspense
              fallback={
                <div
                  style={{
                    minHeight: 260,
                    borderRadius: 20,
                    background: "var(--card-bg)",
                  }}
                />
              }
            >
              <DailyForecast
                data={displayDaily}
                unit={unit}
                loading={loadingDaily || isWaitingForLiveData}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
};

export default Weather;
