import { FiCloud, FiCloudRain, FiCompass, FiDroplet, FiEye, FiMapPin, FiSun, FiWind } from "react-icons/fi";
import { WiBarometer, WiSunrise, WiSunset } from "react-icons/wi";
import WeatherIcon from "./WeatherIcon";

const convertTemp = (temp, unit) => {
  if (unit === "C") return Math.round(((temp - 32) * 5) / 9);
  return temp;
};

const formatRain = (value) => {
  const amount = Number(value) || 0;
  if (amount === 0) return "0 in";
  return `${amount.toFixed(2)} in`;
};

const Metric = ({ icon, label, value }) => (
  <div className="metric-item">
    <span className="metric-icon">{icon}</span>
    <span className="metric-label">{label}</span>
    <strong className="metric-value">{value}</strong>
  </div>
);

const CurrentWeather = ({ data, unit, loading }) => {
  if (loading || !data || !data.current) {
    return (
      <section className="current-weather current-weather-skeleton">
        <div className="current-summary">
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-temp" />
          <div className="skeleton-line skeleton-condition" />
        </div>
        <div className="weather-metrics">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="metric-item">
              <div className="skeleton-circle-small" />
              <div className="skeleton-line skeleton-stat-val" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const { current } = data;
  const temperature = convertTemp(current.temp, unit);
  const feelsLike = convertTemp(current.feelsLike, unit);
  const dewPoint = convertTemp(current.dewPoint, unit);
  const wind = current.windDirection
    ? `${current.windSpeed} mph ${current.windDirection}`
    : `${current.windSpeed} mph`;

  return (
    <section className="current-weather" aria-label="Current weather">
      <div className="current-summary">
        <div className="location">
          <FiMapPin size={16} />
          <h1>{data.location || "Current Location"}</h1>
        </div>

        <div className="current-main">
          <WeatherIcon iconName={current.icon} size={112} />
          <div className="temp-display">
            <span className="current-temp">{temperature}</span>
            <span className="temp-unit">°{unit}</span>
          </div>
        </div>

        <div className="current-details">
          <p className="condition">{current.condition}</p>
          <p className="feels-like">Feels like {feelsLike}°</p>
        </div>
      </div>

      <div className="weather-metrics" aria-label="Weather details">
        <Metric icon={<FiDroplet />} label="Humidity" value={`${current.humidity}%`} />
        <Metric icon={<FiWind />} label="Wind" value={wind} />
        <Metric icon={<WiBarometer />} label="Pressure" value={`${current.pressure} in`} />
        <Metric icon={<FiSun />} label="UV Index" value={current.uvIndex} />
        <Metric icon={<FiCloudRain />} label="Rain" value={formatRain(current.precipitation)} />
        <Metric icon={<FiCloud />} label="Clouds" value={`${current.cloudCover}%`} />
        <Metric icon={<FiEye />} label="Visibility" value={current.visibility ? `${current.visibility} mi` : "N/A"} />
        <Metric icon={<FiCompass />} label="Dew Point" value={`${dewPoint}°`} />
      </div>

      <div className="sun-times" aria-label="Sun times">
        <div className="sun-item">
          <WiSunrise size={34} />
          <div>
            <span className="sun-label">Sunrise</span>
            <span className="sun-value">{current.sunrise}</span>
          </div>
        </div>
        <div className="sun-item">
          <WiSunset size={34} />
          <div>
            <span className="sun-label">Sunset</span>
            <span className="sun-value">{current.sunset}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurrentWeather;
