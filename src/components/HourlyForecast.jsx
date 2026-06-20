import { memo } from "react";
import WeatherIcon from "./WeatherIcon";

const HourlyForecast = ({ data, unit, loading }) => {
  const convertTemp = (temp) => {
    if (unit === "C") {
      return Math.round(((temp - 32) * 5) / 9);
    }
    return temp;
  };

  if (loading || !data || data.length === 0) {
    return (
      <section className="hourly-forecast skeleton-card">
        <h2>Hourly Forecast</h2>
        <div className="hourly-scroll">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="hourly-card-skeleton">
              <div className="skeleton-line skeleton-time-lbl"></div>
              <div
                className="skeleton-circle-small"
                style={{ margin: "8px 0" }}
              ></div>
              <div className="skeleton-line skeleton-temp-lbl"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="hourly-forecast">
      <h2>Hourly Forecast</h2>
      <div className="hourly-scroll">
        {data &&
          data.map((hour, index) => (
            <div key={index} className="hourly-card">
              <span className="hourly-time">{hour.time}</span>
              <WeatherIcon iconName={hour.icon} size={50} />
              <span className="hourly-temp">{convertTemp(hour.temp)}°</span>
            </div>
          ))}
      </div>
    </section>
  );
};

export default memo(HourlyForecast);
