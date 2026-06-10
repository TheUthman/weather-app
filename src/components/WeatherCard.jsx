import { getWeatherIcon } from "../weatherData";

const WeatherCard = ({ time, temperature, icon, unit }) => {
  const displayTemperature =
    unit === "imperial" ? temperature.imperial : temperature.metric;
  const tempUnit = unit === "imperial" ? "°F" : "°C";

  return (
    <div className="weather-card">
      <p className="weather-card-time">{time}</p>
      <span className="weather-card-icon">{getWeatherIcon(icon)}</span>
      <p className="weather-card-temp">
        {displayTemperature}
        {tempUnit}
      </p>
    </div>
  );
};

export default WeatherCard;
