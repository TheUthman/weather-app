// src/pages/Weather.jsx
import React, { useState } from "react";
import Header from "../components/Header";
import CurrentWeather from "../components/CurrentWeather";
import HourlyForecast from "../components/HourlyForecast";
import DailyForecast from "../components/DailyForecast";
import { dummyWeatherData } from "../weatherData";

const Weather = ({ preferences }) => {
  const { units } = preferences;
  const [searchQuery, setSearchQuery] = useState("");

  const current = dummyWeatherData.current;
  const forecast = dummyWeatherData.forecast;

  // Map units for components
  const unitLabel = units === "imperial" ? "F" : "C";

  // Comprehensive dummy data for the new layout
  const weatherData = {
    location: searchQuery || current.city,
    current: {
      temp: current.temperature.imperial,
      condition: current.description,
      icon: current.icon,
      feelsLike: current.temperature.imperial - 3,
      humidity: current.humidity,
      windSpeed: current.windSpeed.imperial,
      pressure: 29.92,
      uvIndex: 4,
      sunrise: "06:12 AM",
      sunset: "07:58 PM",
    },
    hourly: forecast.map((f) => ({
      time: f.time,
      temp: f.temperature.imperial,
      icon: f.icon,
    })),
    daily: [
      {
        day: "Mon",
        high: 72,
        low: 55,
        icon: "sunny",
        condition: "Sunny",
        precip: 0,
      },
      {
        day: "Tue",
        high: 68,
        low: 54,
        icon: "cloudy",
        condition: "Cloudy",
        precip: 10,
      },
      {
        day: "Wed",
        high: 65,
        low: 52,
        icon: "rain",
        condition: "Rainy",
        precip: 80,
      },
      {
        day: "Thu",
        high: 70,
        low: 55,
        icon: "partly-cloudy",
        condition: "Cloudy",
        precip: 20,
      },
      {
        day: "Fri",
        high: 75,
        low: 58,
        icon: "sunny",
        condition: "Sunny",
        precip: 0,
      },
      {
        day: "Sat",
        high: 78,
        low: 60,
        icon: "sunny",
        condition: "Sunny",
        precip: 0,
      },
      {
        day: "Sun",
        high: 74,
        low: 59,
        icon: "cloudy",
        condition: "Cloudy",
        precip: 5,
      },
    ],
  };

  return (
    <div className="weather-page page-container">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unit={unitLabel}
      />

      <div className="weather-dashboard">
        <div className="main-stats">
          <CurrentWeather data={weatherData} unit={unitLabel} />
          <HourlyForecast data={weatherData.hourly} unit={unitLabel} />
        </div>
        <DailyForecast data={weatherData.daily} unit={unitLabel} />
      </div>
    </div>
  );
};

export default Weather;
