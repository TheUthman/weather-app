/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import CurrentWeather from "../components/CurrentWeather";
import HourlyForecast from "../components/HourlyForecast";
import DailyForecast from "../components/DailyForecast";
import { useWeather } from "../hooks/useWeather";
import { fetchGeocodingData } from "../services/geocodingService";

const Weather = ({ preferences, setActivePage }) => {
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

    const loadInitialLocation = async () => {
      if (preferences.location === "auto") {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (!active) return;
              const { latitude, longitude } = position.coords;
              setCoords({ lat: latitude, lng: longitude });
              setActiveLocationName("Detected Location");
            },
            async (error) => {
              console.warn("Geolocation failed or denied, falling back to manual defaultCity:", error);
              if (!active) return;
              await loadDefaultCity();
            }
          );
        } else {
          console.warn("Geolocation not supported by browser, falling back to manual defaultCity.");
          await loadDefaultCity();
        }
      } else {
        await loadDefaultCity();
      }
    };

    loadInitialLocation();

    return () => {
      active = false;
    };
  }, [preferences.location, preferences.defaultCity]);

  // Fetch weather data via custom hook
  const { weather, hourly, daily, loading } = useWeather(coords.lat, coords.lng);

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

  // Helper parser to extract temperature values and convert Celsius to Fahrenheit
  const parseTemp = (tempObj) => {
    if (tempObj === undefined || tempObj === null) return 0;
    if (typeof tempObj === "number") return tempObj;
    if (typeof tempObj === "object") {
      const val = tempObj.degrees !== undefined ? tempObj.degrees : (tempObj.value !== undefined ? tempObj.value : 0);
      const unitType = tempObj.unit || "";
      if (unitType.toUpperCase() === "CELSIUS" || unitType.toUpperCase() === "C") {
        return Math.round((val * 9) / 5 + 32);
      }
      return Math.round(val);
    }
    return Number(tempObj) || 0;
  };

  // Helper to get wind speed in mph
  const getWindSpeed = (windObj) => {
    if (!windObj) return 0;
    const val = windObj.speed?.value !== undefined ? windObj.speed.value : (windObj.value !== undefined ? windObj.value : 0);
    const speedUnit = windObj.speed?.unit || windObj.unit || "";
    if (speedUnit.toUpperCase() === "KM_PER_HOUR" || speedUnit.toUpperCase() === "KMH") {
      return Math.round(val * 0.621371); // Convert km/h to mph
    }
    return Math.round(val);
  };

  // Helper to parse pressure to inHg
  const getPressure = (pressureObj) => {
    if (!pressureObj) return 29.92;
    const val = pressureObj.meanSeaLevelMillibars !== undefined ? pressureObj.meanSeaLevelMillibars : (pressureObj.value !== undefined ? pressureObj.value : pressureObj);
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
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      return date.toLocaleTimeString([], { hour: 'numeric' });
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
      return date.toLocaleDateString([], { weekday: 'short' });
    } catch (e) {
      console.warn("Failed to format date string:", e);
      return isoString;
    }
  };
  const getIcon = (uri) => {
    if (!uri) return "sunny";
    const parts = uri.split('/');
    return parts[parts.length - 1] || "sunny";
  };


  const getMappedWeatherData = () => {
    if (!weather) return null;

    const conditionText = weather.weatherCondition?.description?.text || weather.weatherCondition?.text || "Clear";
    const iconName = getIcon(weather.weatherCondition?.iconBaseUri);

    const firstDay = daily && daily[0];
    const sunriseStr = firstDay?.sunrise ? formatTimeStr(firstDay.sunrise) : "06:00 AM";
    const sunsetStr = firstDay?.sunset ? formatTimeStr(firstDay.sunset) : "07:30 PM";

    return {
      location: activeLocationName,
      current: {
        temp: parseTemp(weather.temperature),
        condition: conditionText,
        icon: iconName,
        feelsLike: parseTemp(weather.feelsLikeTemperature),
        humidity: weather.relativeHumidity !== undefined ? weather.relativeHumidity : 0,
        windSpeed: getWindSpeed(weather.wind),
        pressure: getPressure(weather.airPressure),
        uvIndex: weather.uvIndex !== undefined ? weather.uvIndex : 0,
        sunrise: sunriseStr,
        sunset: sunsetStr,
      },
      hourly: (hourly || []).slice(0, 12).map((h, index) => ({
        time: formatHour(h.interval?.startTime, index),
        temp: parseTemp(h.temperature),
        icon: getIcon(h.weatherCondition?.iconBaseUri),
      })),
      daily: (daily || []).map((d) => ({
        day: formatDayName(d.interval?.startTime),
        high: parseTemp(d.daytimeForecast?.temperature?.max !== undefined ? d.daytimeForecast.temperature.max : d.temperature?.max),
        low: parseTemp(d.daytimeForecast?.temperature?.min !== undefined ? d.daytimeForecast.temperature.min : d.temperature?.min),
        icon: getIcon(d.daytimeForecast?.weatherCondition?.iconBaseUri || d.weatherCondition?.iconBaseUri),
        condition: d.daytimeForecast?.weatherCondition?.description?.text || d.daytimeForecast?.weatherCondition?.text || "Clear",
        precip: d.daytimeForecast?.precipitation?.probability || d.precipitation?.probability || 0,
      })),
    };
  };

  const weatherData = getMappedWeatherData();

  // Show a loading screen while initial coords or weather are loading
  if (loading || !weatherData || searchLoading) {
    return (
      <div className="weather-page page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.7)' }}>Loading weather details...</p>
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
        onOpenSettings={() => setActivePage && setActivePage("settings")}
        onSearch={handleSearch}
      />

      <div className="weather-dashboard">
        <div className="main-stats">
          <CurrentWeather data={weatherData} unit={unit} />
          <HourlyForecast data={weatherData.hourly} unit={unit} />
        </div>
        <DailyForecast data={weatherData.daily} unit={unit} />
      </div>
    </div>
  );
};

export default Weather;
