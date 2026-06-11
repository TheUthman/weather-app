import { FiMapPin } from "react-icons/fi";
import { IoWater } from "react-icons/io5";
import {
  WiStrongWind,
  WiHumidity,
  WiBarometer,
  WiSunrise,
  WiSunset,
} from "react-icons/wi";
import WeatherIcon from "./WeatherIcon";

const CurrentWeather = ({ data, unit }) => {
  const convertTemp = (temp) => {
    if (unit === "C") {
      return Math.round(((temp - 32) * 5) / 9);
    }
    return temp;
  };

  return (
    <section className="current-weather">
      <div className="location">
        <FiMapPin size={18} />
        <h1>{data.location}</h1>
      </div>
      <div className="current-main">
        <div className="current-temp-icon">
          <WeatherIcon iconName={data.current.icon} size={120} />
          <div className="temp-display">
            <span className="current-temp">
              {convertTemp(data.current.temp)}
            </span>
            <span className="temp-unit">°{unit}</span>
          </div>
        </div>
        <div className="current-details">
          <p className="condition">{data.current.condition}</p>
          <p className="feels-like">
            Feels like {convertTemp(data.current.feelsLike)}°
          </p>
        </div>
      </div>

      <div className="weather-stats">
        <div className="stat-card">
          <WiHumidity size={28} />
          <div className="stat-info">
            <span className="stat-value">{data.current.humidity}%</span>
            <span className="stat-label">Humidity</span>
          </div>
        </div>
        <div className="stat-card">
          <WiStrongWind size={28} />
          <div className="stat-info">
            <span className="stat-value">{data.current.windSpeed} mph</span>
            <span className="stat-label">Wind</span>
          </div>
        </div>
        <div className="stat-card">
          <WiBarometer size={28} />
          <div className="stat-info">
            <span className="stat-value">{data.current.pressure} in</span>
            <span className="stat-label">Pressure</span>
          </div>
        </div>
        <div className="stat-card">
          <IoWater size={24} />
          <div className="stat-info">
            <span className="stat-value">{data.current.uvIndex}</span>
            <span className="stat-label">UV Index</span>
          </div>
        </div>
      </div>

      <div className="sun-times">
        <div className="sun-item">
          <WiSunrise size={40} />
          <div>
            <span className="sun-value">{data.current.sunrise}</span>
            <span className="sun-label">Sunrise</span>
          </div>
        </div>
        <div className="sun-item">
          <WiSunset size={40} />
          <div>
            <span className="sun-value">{data.current.sunset}</span>
            <span className="sun-label">Sunset</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurrentWeather;
