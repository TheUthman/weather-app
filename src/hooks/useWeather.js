import { useEffect, useRef, useState } from "react";
import {
  fetchForecastBundle,
  fetchHistoricalComparison,
} from "../services/weatherService";

export const useWeather = (lat, lng) => {
  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [nextHourRain, setNextHourRain] = useState([]);
  const [historicalComparison, setHistoricalComparison] = useState(null);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [loadingHourly, setLoadingHourly] = useState(true);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [loadingHistorical, setLoadingHistorical] = useState(true);
  const [error, setError] = useState(null);
  const generationRef = useRef(0);

  useEffect(() => {
    const currentGen = ++generationRef.current;
    const controller = new AbortController();

    const fetchForecast = async () => {
      try {
        setLoadingCurrent(true);
        setLoadingHourly(true);
        setLoadingDaily(true);
        setLoadingHistorical(true);
        setAlerts([]);
        setNextHourRain([]);
        setHistoricalComparison(null);
        setError(null);

        const forecast = await fetchForecastBundle(lat, lng, {
          signal: controller.signal,
        });

        if (generationRef.current !== currentGen) return;

        setWeather(forecast.current);
        setHourly(forecast.hourly || []);
        setDaily(forecast.daily || []);
        setAlerts(forecast.alerts || []);
        setNextHourRain(forecast.nextHourRain || []);

        void fetchHistoricalComparison(lat, lng, {
          signal: controller.signal,
        })
          .then((comparison) => {
            if (generationRef.current === currentGen) {
              setHistoricalComparison(comparison);
            }
          })
          .catch((historyError) => {
            if (historyError.name !== "AbortError") {
              setHistoricalComparison(null);
            }
          })
          .finally(() => {
            if (generationRef.current === currentGen) {
              setLoadingHistorical(false);
            }
          });
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
        setError(err.message || "Failed to fetch weather data");
        setLoadingHistorical(false);
      } finally {
        if (generationRef.current === currentGen) {
          setLoadingCurrent(false);
          setLoadingHourly(false);
          setLoadingDaily(false);
        }
      }
    };

    if (lat && lng) {
      void fetchForecast();

      return () => {
        controller.abort();
        generationRef.current = currentGen + 1;
      };
    }
  }, [lat, lng]);

  return {
    weather,
    hourly,
    daily,
    alerts,
    nextHourRain,
    historicalComparison,
    loadingCurrent,
    loadingHourly,
    loadingDaily,
    loadingHistorical,
    error,
    loading: loadingCurrent && loadingHourly && loadingDaily,
  };
};
