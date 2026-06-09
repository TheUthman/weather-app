import { useState } from "react";
import { Header, CurrentWeather, HourlyForecast, DailyForecast } from "../components";
import mockWeather from "../data/mockWeather";

const Weather = ({ onOpenSettings }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [unit, setUnit] = useState("F");

  return (
    <div className="weather-app">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unit={unit}
        setUnit={setUnit}
        onOpenSettings={onOpenSettings}
      />

      <main className="weather-content">
        <CurrentWeather data={mockWeather} unit={unit} />
        <HourlyForecast data={mockWeather.hourly} unit={unit} />
        <DailyForecast data={mockWeather.daily} unit={unit} />
      </main>
    </div>
  );
};

export default Weather;
