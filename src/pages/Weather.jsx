import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import CurrentWeather from "../components/CurrentWeather";
import Icon from "../components/Icon";
import { useWeather } from "../hooks/useWeather";
import { formatZonedTime } from "../utils/dateTime";
import {
  coordinateKey,
  coordsMatch,
  hasValidCoords,
} from "../utils/weatherState";

const InsightsCard = lazy(() => import("../components/InsightsCard"));
const WeatherIntelligence = lazy(
  () => import("../components/WeatherIntelligence"),
);
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

const Weather = ({ preferences, setPreferences, onBackgroundWeather }) => {
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
  const [cachedEntry, setCachedEntry] = useState(() => {
    try {
      const saved = localStorage.getItem("last_weather_ui_data");
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed?.data && parsed?.coords) return parsed;
      const cachedCoords = JSON.parse(
        localStorage.getItem("last_weather_coords") || "null",
      );
      return parsed?.current && cachedCoords
        ? { data: parsed, coords: cachedCoords, savedAt: null }
        : null;
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
  const unit = preferences.units === "metric" ? "C" : "F";
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
      setPreferences?.((prev) => ({ ...prev, units: newPreferenceUnit }));
    },
    [setPreferences],
  );

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

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
    if (hasValidCoords(coords)) {
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
      // Reverse geocode to get the city name
      const cityName = await fetchReverseGeocodingData(latitude, longitude);
      setCoords(result);
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
            : "Could not update location. Keeping the current forecast.";
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
    const noCoords = !hasValidCoords(coords);

    if (modeMismatch || cityMismatch || noCoords) {
      let cleanup = () => {};
      const timer = window.setTimeout(() => {
        let active = true;
        cleanup = () => {
          active = false;
        };

        const loadDefaultCity = async (source = "manual") => {
          try {
            const city = preferences.defaultCity || "San Francisco";
            const result = await fetchGeocodingData(city);
            if (!active) return;
            if (hasValidCoords(result)) {
              setCoords(result);
              setActiveLocationName(city);
              localStorage.setItem("last_weather_source", source);
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
            await loadDefaultCity("auto");
          }
        };

        if (preferences.location === "auto") {
          loadLocationByBrowser();
        } else {
          loadDefaultCity("manual");
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
    coords,
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
    alerts,
    nextHourRain,
    historicalComparison,
    airQuality,
    loadingCurrent,
    loadingHourly,
    loadingDaily,
    loadingHistorical,
    loadingAirQuality,
    error: weatherError,
    retry: retryWeather,
    resolvedKey,
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
      ? formatZonedTime(firstDay.sunEvents.sunriseTime, weather?.timezone)
      : "06:00 AM";
    const sunsetStr = firstDay?.sunEvents?.sunsetTime
      ? formatZonedTime(firstDay.sunEvents.sunsetTime, weather?.timezone)
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
            timezone: weather.timezone || null,
            updatedAt: weather.updatedAt || null,
          }
        : null,
      hourly: (hourly || []).slice(0, 12).map((h, index) => ({
        time: formatHour(h.interval?.startTime, index),
        temp: parseTemp(h.temperature),
        feelsLike:
          h.feelsLikeTemperature == null
            ? null
            : parseTemp(h.feelsLikeTemperature),
        rawTempC: h.temperature?.degrees ?? 0,
        icon: getIcon(h.weatherCondition?.iconBaseUri),
        condition: h.weatherCondition?.text || "Unknown",
        precip: h.precipitationProbability || 0,
        precipAmount: h.precipitation || 0,
        humidity: h.relativeHumidity,
        windSpeedKmh: h.windSpeed || 0,
        windGustKmh: h.windGust || 0,
        windDirection: getWindDirection(h.windDirection),
        uvIndex: h.uvIndex || 0,
        pressure: h.pressure == null ? null : getPressure(h.pressure),
        cloudCover: h.cloudCover,
        visibility:
          h.visibility == null
            ? null
            : Math.round((h.visibility / 1609.344) * 10) / 10,
        dewPoint:
          h.dewPoint == null
            ? null
            : parseTemp({ degrees: h.dewPoint, unit: "C" }),
        isDay: h.isDay,
      })),
      daily: (daily || []).map((d) => ({
        day: formatDayName(d.interval?.startTime),
        high: parseTemp(d.temperatureMax),
        low: parseTemp(d.temperatureMin),
        highC: d.temperatureMax?.degrees ?? 0,
        lowC: d.temperatureMin?.degrees ?? 0,
        icon: getIcon(d.weatherCondition?.iconBaseUri),
        condition: d.weatherCondition?.text || "Unknown",
        precip: d.precipitationProbability || 0,
        precipitationSum: d.precipitationSum || 0,
        windGustMax: d.windGustMax || 0,
        uvIndexMax: d.uvIndexMax || 0,
        sunEvents: d.sunEvents || null,
      })),
      alerts: alerts || [],
      nextHourRain: nextHourRain || [],
      historicalComparison,
      airQuality,
    };
  }, [
    weather,
    hourly,
    daily,
    alerts,
    nextHourRain,
    historicalComparison,
    airQuality,
    activeLocationName,
  ]);

  useEffect(() => {
    if (
      weatherData.current &&
      !loadingCurrent &&
      resolvedKey === coordinateKey(coords)
    ) {
      const entry = {
        data: weatherData,
        coords,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem("last_weather_ui_data", JSON.stringify(entry));
      // Mirror the successfully persisted entry for same-session offline fallback.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCachedEntry(entry);
    }
  }, [weatherData, loadingCurrent, coords, resolvedKey]);

  // Render the last successful forecast immediately while the fresh request is
  // in flight. Coordinates and cached UI data are persisted together, so this
  // avoids holding the LCP card behind network latency without showing another
  // location's forecast.
  const cachedData = coordsMatch(cachedEntry?.coords, coords)
    ? cachedEntry?.data
    : null;
  const shouldUseCachedFallback = !weatherData.current && Boolean(cachedData);
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
  const displayAlerts = weatherData.current
    ? weatherData.alerts
    : cachedData?.alerts || [];
  const displayNextHourRain = weatherData.current
    ? weatherData.nextHourRain
    : cachedData?.nextHourRain || [];
  const displayHistoricalComparison = weatherData.current
    ? weatherData.historicalComparison
    : cachedData?.historicalComparison || null;
  const displayAirQuality = weatherData.current
    ? weatherData.airQuality
    : cachedData?.airQuality || null;
  const isWaitingForLiveData = !weatherData.current && !cachedData && !weatherError;
  const isShowingCachedData = shouldUseCachedFallback;
  const headerStatus = weatherError && !displayData?.current
    ? "error"
    : isShowingCachedData
      ? "cached"
      : !displayData?.current
        ? "loading"
        : "live";
  const displayUpdatedAt = isShowingCachedData
    ? cachedEntry?.savedAt || displayData?.current?.updatedAt
    : displayData?.current?.updatedAt;
  const currentFavoriteId =
    hasValidCoords(coords) ? getFavoriteId(coords) : "";
  const isCurrentFavorite =
    Boolean(currentFavoriteId) &&
    favorites.some((favorite) => favorite.id === currentFavoriteId);
  const canFavoriteCurrent = Boolean(
    currentFavoriteId && activeLocationName && displayData?.current,
  );
  const backgroundCurrent = displayData?.current;

  useEffect(() => {
    if (!backgroundCurrent) return;

    onBackgroundWeather?.({
      daily,
      condition: backgroundCurrent.condition || "Clear",
      icon: backgroundCurrent.icon || "sunny",
      cloudCover: backgroundCurrent.cloudCover || 0,
      windSpeed: backgroundCurrent.windSpeed || 0,
      precipitation: backgroundCurrent.precipitation || 0,
    });
  }, [backgroundCurrent, daily, onBackgroundWeather]);

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
      <div className="weather-page page-container">
        <Header
          unit={unit}
          data={displayData?.current?.condition}
          status={headerStatus}
          setUnit={handleUnitChange}
          onDetectLocation={handleManualDetect}
          isDetecting={isRefreshing}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={isCurrentFavorite}
          canFavorite={canFavoriteCurrent}
        />

        <div className="weather-dashboard">
          {weatherError && displayData?.current ? (
            <section className="weather-refresh-warning" role="status">
              <Icon name="info" size={19} />
              <span>Live update failed. Showing the last saved forecast.</span>
              <button type="button" onClick={retryWeather}>Retry</button>
            </section>
          ) : null}
          {weatherError && !displayData?.current ? (
            <section className="weather-error-panel forecast-panel" role="alert">
              <span className="feature-icon"><Icon name="cloud" size={24} /></span>
              <div>
                <span className="feature-kicker">Forecast unavailable</span>
                <h2>We couldn’t update this location</h2>
                <p>Check your connection and try loading the forecast again.</p>
              </div>
              <button type="button" onClick={retryWeather}>Try again</button>
            </section>
          ) : (
          <>
          <CurrentWeather
            data={displayData}
            hourly={displayHourly}
            unit={unit}
            isStale={isShowingCachedData}
            updatedAt={displayUpdatedAt}
            loading={!displayData?.current && (loadingCurrent || isWaitingForLiveData)}
          />
          <Suspense
            fallback={<div className="weather-intelligence-placeholder" />}
          >
            <WeatherIntelligence
              alerts={displayAlerts}
              hourly={displayHourly}
              nextHourRain={displayNextHourRain}
              historicalComparison={displayHistoricalComparison}
              today={displayDaily[0] || null}
              unit={unit}
              loading={!displayData?.current && (loadingCurrent || isWaitingForLiveData)}
              loadingHistorical={loadingHistorical && !displayHistoricalComparison}
            />
          </Suspense>
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
                unit={unit}
                airQuality={displayAirQuality}
                loadingAirQuality={loadingAirQuality && !displayAirQuality}
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
                current={displayData?.current}
                unit={unit}
                isStale={isShowingCachedData}
                updatedAt={displayUpdatedAt}
                loading={!displayHourly.length && (loadingHourly || isWaitingForLiveData)}
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
                loading={!displayDaily.length && (loadingDaily || isWaitingForLiveData)}
              />
            </Suspense>
          </div>
          </>
          )}
        </div>
      </div>
    </>
  );
};

export default Weather;
