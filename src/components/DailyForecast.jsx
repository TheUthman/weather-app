import { memo, useMemo } from "react";
import WeatherIcon from "./WeatherIcon";
import { getCloudColor } from "../utils/cloudLightning";

const getTextColor = (type, progress) => {
  if (type === "moon") return "rgba(230, 235, 255, 0.95)";
  if (progress < 0.2) return "rgba(80, 30, 10, 0.95)";
  if (progress < 0.6) return "rgba(10, 30, 50, 0.95)";
  if (progress < 0.9) return "rgba(240, 220, 255, 0.95)";
  return "rgba(200, 210, 230, 0.95)";
};

const getMutedTextColor = (type, progress) => {
  if (type === "moon") return "rgba(180, 190, 220, 0.8)";
  if (progress < 0.2) return "rgba(80, 30, 10, 0.7)";
  if (progress < 0.6) return "rgba(10, 30, 50, 0.7)";
  if (progress < 0.9) return "rgba(200, 180, 240, 0.8)";
  return "rgba(160, 175, 200, 0.8)";
};

const getShadowColor = (type, progress) => {
  if (type === "moon") return "rgba(0, 0, 20, 0.4)";
  if (progress < 0.2) return "rgba(120, 40, 0, 0.3)";
  if (progress < 0.6) return "rgba(0, 20, 40, 0.2)";
  if (progress < 0.9) return "rgba(60, 0, 100, 0.35)";
  return "rgba(0, 0, 20, 0.4)";
};

const DailyForecast = ({ data, unit, loading, celestialType, celestialProgress }) => {
  const convertTemp = (temp) => {
    if (unit === "C") {
      return Math.round(((temp - 32) * 5) / 9);
    }
    return temp;
  };

  const cloudColor = useMemo(
    () => getCloudColor(celestialType, celestialProgress),
    [celestialType, celestialProgress]
  );

  const textColor = useMemo(
    () => getTextColor(celestialType, celestialProgress),
    [celestialType, celestialProgress]
  );

  const mutedColor = useMemo(
    () => getMutedTextColor(celestialType, celestialProgress),
    [celestialType, celestialProgress]
  );

  const shadowColor = useMemo(
    () => getShadowColor(celestialType, celestialProgress),
    [celestialType, celestialProgress]
  );

  const sectionStyle = useMemo(
    () => ({
      background: cloudColor,
      color: textColor,
      boxShadow: `0 8px 32px ${shadowColor}`,
    }),
    [cloudColor, textColor, shadowColor]
  );

  if (loading || !data || data.length === 0) {
    return (
      <section className="daily-forecast skeleton-card" style={sectionStyle}>
        <h2 style={{ color: textColor }}>Extended Forecast</h2>
        <div className="daily-list">
          {[...Array(7)].map((_, index) => (
            <div key={index} className="daily-row-skeleton">
              <div className="skeleton-line skeleton-day"></div>
              <div className="skeleton-line skeleton-icon-text"></div>
              <div className="skeleton-line skeleton-precip-lbl"></div>
              <div className="skeleton-line skeleton-temp-range"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="daily-forecast" style={sectionStyle}>
      <h2 style={{ color: textColor }}>Extended Forecast</h2>
      <div className="daily-list">
        {data.map((day, index) => (
          <div key={index} className="daily-row">
            <span className="daily-day" style={{ color: textColor }}>{day.day}</span>
            <div className="daily-condition">
              <WeatherIcon iconName={day.icon} size={50} />
              <span className="daily-condition-text" style={{ color: mutedColor }}>{day.condition}</span>
            </div>
            <div className="daily-precip">
              {day.precip > 0 && (
                <span className="precip-badge" style={{ background: cloudColor, color: textColor, boxShadow: `0 2px 8px ${shadowColor}` }}>{day.precip}%</span>
              )}
            </div>
            <div className="daily-temps">
              <span className="daily-high" style={{ color: textColor }}>{convertTemp(day.high)}°</span>
              <span className="daily-low" style={{ color: mutedColor }}>{convertTemp(day.low)}°</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default memo(DailyForecast);