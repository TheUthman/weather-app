import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchAirQualityData,
  fetchForecastBundle,
  fetchHistoricalComparison,
} from "../services/weatherService";
import { coordinateKey } from "../utils/weatherState";

export const useWeather = (lat, lng) => {
  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [nextHourRain, setNextHourRain] = useState([]);
  const [historicalComparison, setHistoricalComparison] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [loadingHourly, setLoadingHourly] = useState(true);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [loadingHistorical, setLoadingHistorical] = useState(true);
  const [loadingAirQuality, setLoadingAirQuality] = useState(true);
  const [error, setError] = useState(null);
  const [resolvedKey, setResolvedKey] = useState(null);
  const [errorKey, setErrorKey] = useState(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const generationRef = useRef(0);
  const retry = useCallback(() => setRequestVersion((version) => version + 1), []);
  const requestedKey = coordinateKey(lat, lng);

  useEffect(() => {
    const currentGen = ++generationRef.current;
    const requestKey = coordinateKey(lat, lng);
    const controller = new AbortController();

    const fetchForecast = async () => {
      try {
        setLoadingCurrent(true);
        setLoadingHourly(true);
        setLoadingDaily(true);
        setLoadingHistorical(true);
        setLoadingAirQuality(true);
        setWeather(null);
        setHourly([]);
        setDaily([]);
        setAlerts([]);
        setNextHourRain([]);
        setHistoricalComparison(null);
        setAirQuality(null);
        setError(null);
        setErrorKey(null);

        const forecast = await fetchForecastBundle(lat, lng, {
          signal: controller.signal,
        });

        if (generationRef.current !== currentGen) return;

        setWeather(forecast.current);
        setHourly(forecast.hourly || []);
        setDaily(forecast.daily || []);
        setAlerts(forecast.alerts || []);
        setNextHourRain(forecast.nextHourRain || []);
        setResolvedKey(requestKey);

        void fetchHistoricalComparison(lat, lng, {
          signal: controller.signal,
          timezone: forecast.current?.timezone,
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

        void fetchAirQualityData(lat, lng, {
          signal: controller.signal,
        })
          .then((nextAirQuality) => {
            if (generationRef.current === currentGen) {
              setAirQuality(nextAirQuality);
            }
          })
          .catch((airQualityError) => {
            if (airQualityError.name !== "AbortError") {
              setAirQuality(null);
            }
          })
          .finally(() => {
            if (generationRef.current === currentGen) {
              setLoadingAirQuality(false);
            }
          });
      } catch (err) {
        if (err.name === "AbortError") return;
        if (generationRef.current !== currentGen) return;
        console.error(err);
        setError(err.message || "Failed to fetch weather data");
        setErrorKey(requestKey);
        setLoadingHistorical(false);
        setLoadingAirQuality(false);
      } finally {
        if (generationRef.current === currentGen) {
          setLoadingCurrent(false);
          setLoadingHourly(false);
          setLoadingDaily(false);
        }
      }
    };

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      void fetchForecast();

      return () => {
        controller.abort();
        generationRef.current = currentGen + 1;
      };
    }
  }, [lat, lng, requestVersion]);

  const isResolvedRequest = requestedKey !== null && resolvedKey === requestedKey;
  const isFailedRequest = requestedKey !== null && errorKey === requestedKey;

  return {
    weather: isResolvedRequest ? weather : null,
    hourly: isResolvedRequest ? hourly : [],
    daily: isResolvedRequest ? daily : [],
    alerts: isResolvedRequest ? alerts : [],
    nextHourRain: isResolvedRequest ? nextHourRain : [],
    historicalComparison: isResolvedRequest ? historicalComparison : null,
    airQuality: isResolvedRequest ? airQuality : null,
    loadingCurrent: !isResolvedRequest && !isFailedRequest ? true : loadingCurrent,
    loadingHourly: !isResolvedRequest && !isFailedRequest ? true : loadingHourly,
    loadingDaily: !isResolvedRequest && !isFailedRequest ? true : loadingDaily,
    loadingHistorical: !isResolvedRequest && !isFailedRequest ? true : loadingHistorical,
    loadingAirQuality: !isResolvedRequest && !isFailedRequest ? true : loadingAirQuality,
    error: isFailedRequest ? error : null,
    resolvedKey: isResolvedRequest ? resolvedKey : null,
    retry,
    loading: !isResolvedRequest && !isFailedRequest
      ? true
      : loadingCurrent && loadingHourly && loadingDaily,
  };
};
