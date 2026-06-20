import { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        setLoadingCurrent(true);
        setError(null);
        const current = await fetchWeatherData(lat, lng);
        setWeather(current);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch weather data");
      } finally {
        setLoadingCurrent(false);
      }
    };

    const fetchHourly = async () => {
      try {
        setLoadingHourly(true);
        const hours = await fetchHourlyWeather(lat, lng);
        setHourly(hours.forecastHours || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingHourly(false);
      }
    };

    const fetchDaily = async () => {
      try {
        setLoadingDaily(true);
        const days = await fetchDaysWeather(lat, lng);
        setDaily(days.forecastDays || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDaily(false);
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