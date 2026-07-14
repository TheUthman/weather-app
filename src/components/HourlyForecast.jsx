import { memo } from "react";
import Icon from "./Icon";
import WeatherIcon from "./WeatherIcon";

const HourlyForecast = ({ data, unit, loading }) => {
  const convertTemp = (temp) => {
    if (unit === "C") return Math.round(((temp - 32) * 5) / 9);
    return temp;
  };

  const formatPercent = (value) => `${Math.round(Number(value) || 0)}%`;
  const formatWind = (value) => `${Math.round(Number(value) || 0)} km/h`;

  if (loading || !data || data.length === 0) {
    return (
      <section className="hourly-forecast forecast-panel">
        <div className="section-heading">
          <h2>Hourly</h2>
        </div>
        <div className="hourly-scroll">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="hourly-card-skeleton">
              <div className="skeleton-line skeleton-time-lbl" />
              <div className="hourly-card-main">
                <div className="skeleton-circle-small" />
                <div className="skeleton-line skeleton-temp-lbl" />
              </div>
              <div className="skeleton-line" style={{ width: "72%" }} />
              <div className="hourly-card-stats">
                {[...Array(3)].map((__, statIndex) => (
                  <div className="hourly-stat" key={statIndex}>
                    <div className="skeleton-line" style={{ width: "46%" }} />
                    <div className="skeleton-line" style={{ width: "34%" }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="hourly-forecast forecast-panel" aria-label="Hourly forecast">
      <div className="section-heading">
        <h2>Hourly</h2>
        <span>Next 12 hours</span>
      </div>
      <div className="hourly-scroll">
        {data.map((hour, index) => (
          <div key={`${hour.time}-${index}`} className="hourly-card">
            <div className="hourly-card-header">
              <span className="hourly-time">{hour.time}</span>
              {index === 0 && <span className="hourly-now-badge">Current</span>}
            </div>

            <div className="hourly-card-main">
              <WeatherIcon iconName={hour.icon} size={34} />
              <div className="hourly-temperature">
                <span className="hourly-temp">{convertTemp(hour.temp)}°</span>
                <span className="hourly-unit">{unit}</span>
              </div>
            </div>

            <span className="hourly-condition" title={hour.condition}>
              {hour.condition}
            </span>

            <div className="hourly-card-stats" aria-label={`Details for ${hour.time}`}>
              <div className="hourly-stat">
                <span><Icon name="cloudRain" size={12} />Rain</span>
                <strong>{formatPercent(hour.precip)}</strong>
              </div>
              <div className="hourly-stat">
                <span><Icon name="droplet" size={12} />Humidity</span>
                <strong>{hour.humidity == null ? "—" : formatPercent(hour.humidity)}</strong>
              </div>
              <div className="hourly-stat">
                <span><Icon name="wind" size={12} />Wind</span>
                <strong>{formatWind(hour.windSpeedKmh)}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default memo(HourlyForecast);
