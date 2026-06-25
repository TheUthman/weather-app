import { memo, useMemo } from "react";
import { FiCloudRain } from "react-icons/fi";
import WeatherIcon from "./WeatherIcon";

const DailyForecast = ({ data, unit, loading }) => {
  const convertTemp = (temp) => {
    if (unit === "C") return Math.round(((temp - 32) * 5) / 9);
    return temp;
  };

  const range = useMemo(() => {
    if (!data || data.length === 0) return { min: 0, max: 1 };
    const toDisplayTemp = (temp) => {
      if (unit === "C") return Math.round(((temp - 32) * 5) / 9);
      return temp;
    };
    const lows = data.map((day) => toDisplayTemp(day.low));
    const highs = data.map((day) => toDisplayTemp(day.high));
    return { min: Math.min(...lows), max: Math.max(...highs) };
  }, [data, unit]);

  if (loading || !data || data.length === 0) {
    return (
      <section className="daily-forecast forecast-panel">
        <div className="section-heading">
          <h2>10 Day</h2>
        </div>
        <div className="daily-list">
          {[...Array(7)].map((_, index) => (
            <div key={index} className="daily-row-skeleton">
              <div className="skeleton-line skeleton-day" />
              <div className="skeleton-line skeleton-icon-text" />
              <div className="skeleton-line skeleton-temp-range" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="daily-forecast forecast-panel" aria-label="10 day forecast">
      <div className="section-heading">
        <h2>10 Day</h2>
        <span>Extended forecast</span>
      </div>
      <div className="daily-list">
        {data.map((day, index) => {
          const low = convertTemp(day.low);
          const high = convertTemp(day.high);
          const total = Math.max(range.max - range.min, 1);
          const left = ((low - range.min) / total) * 100;
          const width = Math.max(((high - low) / total) * 100, 8);

          return (
            <div key={`${day.day}-${index}`} className="daily-row">
              <span className="daily-day">{index === 0 ? "Today" : day.day}</span>
              <div className="daily-condition">
                <WeatherIcon iconName={day.icon} size={32} />
                <span className="daily-condition-text">{day.condition}</span>
              </div>
              <div className="daily-precip">
                {day.precip > 0 ? (
                  <span className="precip-badge">
                    <FiCloudRain size={12} />
                    {day.precip}%
                  </span>
                ) : (
                  <span className="precip-empty">-</span>
                )}
              </div>
              <div className="daily-range" aria-label={`${low} to ${high} degrees`}>
                <span className="daily-low">{low}°</span>
                <span className="range-track">
                  <span
                    className="range-fill"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </span>
                <span className="daily-high">{high}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default memo(DailyForecast);
