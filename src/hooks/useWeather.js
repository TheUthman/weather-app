import { useEffect, useRef, useState } from "react";
import { fetchForecastBundle } from "../services/weatherService";

export const useWeather = (lat, lng) => {
  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [loadingHourly, setLoadingHourly] = useState(true);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [error, setError] = useState(null);
  const generationRef = useRef(0);

  useEffect(() => {
    const currentGen = ++generationRef.current;

    const fetchForecast = async () => {
      try {
        setLoadingCurrent(true);
        setLoadingHourly(true);
        setLoadingDaily(true);
        setError(null);

        const forecast = await fetchForecastBundle(lat, lng);

        if (generationRef.current !== currentGen) return;

        setWeather(forecast.current);
        setHourly(forecast.hourly || []);
        setDaily(forecast.daily || []);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
        setError(err.message || "Failed to fetch weather data");
      } finally {
        if (generationRef.current === currentGen) {
          setLoadingCurrent(false);
          setLoadingHourly(false);
          setLoadingDaily(false);
        }
      }
    };

    if (lat && lng) {
      const startFetch = () => {
        if (generationRef.current === currentGen) {
          void fetchForecast();
        }
      };

      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        const id = window.requestIdleCallback(startFetch, { timeout: 1000 });
        const currentGeneration = currentGen;
        return () => {
          window.cancelIdleCallback?.(id);
          if (generationRef.current === currentGeneration) {
            generationRef.current++;
          }
        };
      }

      const id = window.setTimeout(startFetch, 180);
      const currentGeneration = currentGen;
      return () => {
        window.clearTimeout(id);
        if (generationRef.current === currentGeneration) {
          generationRef.current++;
        }
      };
    }
  }, [lat, lng]);

  return {
    weather,
    hourly,
    daily,
    loadingCurrent,
    loadingHourly,
    loadingDaily,
    error,
    loading: loadingCurrent && loadingHourly && loadingDaily,
  };
};
