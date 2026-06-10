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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const [current, hours, days] = await Promise.all([
          fetchWeatherData(lat, lng),
          fetchHourlyWeather(lat, lng),
          fetchDaysWeather(lat, lng),
        ]);

        setWeather(current);
        setHourly(hours.forecastHours || []);
        setDaily(days.forecastDays || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (lat && lng) {
      fetchWeather();
    }
  }, [lat, lng]);

  return { weather, hourly, daily, loading };
};