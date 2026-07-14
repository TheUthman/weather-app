import { memo, useEffect, useState } from "react";
import Icon from "./Icon";
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

const LocalTime = memo(function LocalTime() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    }),
  );

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
      );
    };

    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  return <h3>{time}</h3>;
});

const CurrentWeather = ({ data, unit, loading }) => {
  if (loading || !data || !data.current) {
    return (
      <section className="current-weather current-weather-skeleton" aria-label="Loading current weather">
        <div className="current-summary">
          <div className="location">
            <div className="location-header" style={{ height: "24px", alignItems: "center" }}>
              <div className="skeleton-circle-small" style={{ width: "16px", height: "16px", flexShrink: 0 }} />
              <div className="skeleton-line skeleton-title" style={{ height: "18px", width: "140px" }} />
            </div>
            <div className="location-header" style={{ height: "24px", alignItems: "center", marginLeft: "16px" }}>
              <div className="skeleton-circle-small" style={{ width: "16px", height: "16px", flexShrink: 0 }} />
              <div className="skeleton-line skeleton-title" style={{ height: "18px", width: "70px" }} />
            </div>
          </div>

          <div className="current-main">
            <div className="animated-weather-icon-wrapper">
              <div className="skeleton-circle-small" style={{ width: "112px", height: "112px", borderRadius: "24px" }} />
            </div>
            <div className="temp-display" style={{ alignItems: "center" }}>
              <div className="skeleton-line skeleton-temp" style={{ height: "72px", width: "100px" }} />
            </div>
          </div>

          <div className="current-details">
            <div className="skeleton-line skeleton-condition" style={{ height: "20px", width: "120px", margin: "0 auto 8px" }} />
            <div className="skeleton-line" style={{ height: "14px", width: "90px", margin: "0 auto" }} />
          </div>
        </div>

        <div className="weather-metrics" aria-label="Loading weather details">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="metric-item">
              <div className="skeleton-circle-small" />
              <div className="skeleton-line skeleton-stat-val" />
            </div>
          ))}
        </div>
        
        <div className="sun-times">
          <div className="sun-item" style={{ height: "66px" }}>
            <div className="skeleton-circle-small" style={{ width: "34px", height: "34px", marginLeft: "12px", borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingLeft: "10px" }}>
              <div className="skeleton-line" style={{ height: "12px", width: "50px" }} />
              <div className="skeleton-line" style={{ height: "14px", width: "60px" }} />
            </div>
          </div>
          <div className="sun-item" style={{ height: "66px" }}>
            <div className="skeleton-circle-small" style={{ width: "34px", height: "34px", marginLeft: "12px", borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingLeft: "10px" }}>
              <div className="skeleton-line" style={{ height: "12px", width: "50px" }} />
              <div className="skeleton-line" style={{ height: "14px", width: "60px" }} />
            </div>
          </div>
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
          <div className="location-header">
            <Icon name="mapPin" size={16} />
            <h1>{data.location || "Current Location"}</h1>
          </div>
          <div className="location-header">
            <Icon name="time" size={16} />
            <LocalTime />
          </div>
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
        <Metric
          icon={<Icon name="droplet" />}
          label="Humidity"
          value={`${current.humidity}%`}
        />
        <Metric icon={<Icon name="wind" />} label="Wind" value={wind} />
        <Metric
          icon={<Icon name="barometer" />}
          label="Pressure"
          value={`${current.pressure} in`}
        />
        <Metric icon={<Icon name="sun" />} label="UV Index" value={current.uvIndex} />
        <Metric
          icon={<Icon name="cloudRain" />}
          label="Rain"
          value={formatRain(current.precipitation)}
        />
        <Metric
          icon={<Icon name="cloud" />}
          label="Clouds"
          value={`${current.cloudCover}%`}
        />
        <Metric
          icon={<Icon name="eye" />}
          label="Visibility"
          value={current.visibility ? `${current.visibility} mi` : "N/A"}
        />
        <Metric icon={<Icon name="compass" />} label="Dew Point" value={`${dewPoint}°`} />
      </div>

      <div className="sun-times" aria-label="Sun times">
        <div className="sun-item">
          <Icon name="sunrise" size={34} />
          <span className="sun-label">Sunrise</span>
          <span className="sun-value">{current.sunrise}</span>
        </div>
        <div className="sun-item">
          <Icon name="sunset" size={34} />
          <span className="sun-label">Sunset</span>
          <span className="sun-value">{current.sunset}</span>
        </div>
      </div>
    </section>
  );
};

export default memo(CurrentWeather);
