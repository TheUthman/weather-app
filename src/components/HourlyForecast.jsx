import { memo } from "react";
import { FiCloudRain } from "react-icons/fi";
import WeatherIcon from "./WeatherIcon";

const HourlyForecast = ({ data, unit, loading }) => {
  const convertTemp = (temp) => {
    if (unit === "C") return Math.round(((temp - 32) * 5) / 9);
    return temp;
  };

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
              <div className="skeleton-circle-small" />
              <div className="skeleton-line skeleton-temp-lbl" />
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
            <span className="hourly-time">{hour.time}</span>
            <WeatherIcon iconName={hour.icon} size={34} />
            <span className="hourly-temp">{convertTemp(hour.temp)}°</span>
            {hour.precip > 0 && (
              <span className="hourly-rain">
                <FiCloudRain size={12} />
                {hour.precip}%
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default memo(HourlyForecast);
