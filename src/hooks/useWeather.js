import { useEffect, useState, useRef } from "react";
import {
  fetchWeatherData,
  fetchDaysWeather,
  fetchHourlyWeather
} from "../services/weatherService";

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

    const fetchCurrent = async () => {
      try {
        setLoadingCurrent(true);
        setError(null);
        const current = await fetchWeatherData(lat, lng);
        // Ignore stale responses from a previous generation
        if (generationRef.current !== currentGen) return;
        setWeather(current);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
        setError(err.message || "Failed to fetch weather data");
      } finally {
        if (generationRef.current === currentGen) {
          setLoadingCurrent(false);
        }
      }
    };

    const fetchHourly = async () => {
      try {
        setLoadingHourly(true);
        const hours = await fetchHourlyWeather(lat, lng);
        if (generationRef.current !== currentGen) return;
        setHourly(hours.forecastHours || []);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
      } finally {
        if (generationRef.current === currentGen) {
          setLoadingHourly(false);
        }
      }
    };

    const fetchDaily = async () => {
      try {
        setLoadingDaily(true);
        const days = await fetchDaysWeather(lat, lng);
        if (generationRef.current !== currentGen) return;
        setDaily(days.forecastDays || []);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
      } finally {
        if (generationRef.current === currentGen) {
          setLoadingDaily(false);
        }
      }
    };

    if (lat && lng) {
      fetchCurrent();
      fetchHourly();
      fetchDaily();
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
    loading: loadingCurrent && loadingHourly && loadingDaily
  };
};