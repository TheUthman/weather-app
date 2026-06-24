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

const HourlyForecast = ({ data, unit, loading, celestialType, celestialProgress }) => {
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

  const hourlyCardStyle = useMemo(
    () => ({
      background: cloudColor,
      boxShadow: `0 4px 12px ${shadowColor}`,
    }),
    [cloudColor, shadowColor]
  );

  if (loading || !data || data.length === 0) {
    return (
      <section className="hourly-forecast skeleton-card" style={sectionStyle}>
        <h2 style={{ color: textColor }}>Hourly Forecast</h2>
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
    <section className="hourly-forecast" style={sectionStyle}>
      <h2 style={{ color: textColor }}>Hourly Forecast</h2>
      <div className="hourly-scroll">
        {data &&
          data.map((hour, index) => (
            <div key={index} className="hourly-card" style={hourlyCardStyle}>
              <span className="hourly-time" style={{ color: mutedColor }}>{hour.time}</span>
              <WeatherIcon iconName={hour.icon} size={50} />
              <span className="hourly-temp" style={{ color: textColor }}>{convertTemp(hour.temp)}°</span>
            </div>
          ))}
      </div>
    </section>
  );
};

export default memo(HourlyForecast);