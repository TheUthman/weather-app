import { useMemo } from "react";
import { FiMapPin } from "react-icons/fi";
import { IoWater } from "react-icons/io5";
import {
  WiBarometer,
  WiSunrise,
  WiSunset,
} from "react-icons/wi";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import WeatherIcon from "./WeatherIcon";
import { getCloudColor } from "../utils/cloudLightning";

// Determine readable text color based on cloud color brightness
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

const CurrentWeather = ({ data, unit, loading, celestialType, celestialProgress }) => {
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

  const statCardStyle = useMemo(
    () => ({
      background: cloudColor,
      boxShadow: `0 4px 16px ${shadowColor}`,
    }),
    [cloudColor, shadowColor]
  );

  if (loading || !data || !data.current) {
    return (
      <section className="current-weather skeleton-card" style={sectionStyle}>
        <div className="location" style={{ color: textColor }}>
          <FiMapPin size={18} style={{ color: mutedColor }} />
          <div className="skeleton-line skeleton-title"></div>
        </div>
        <div className="current-main">
          <div className="current-temp-icon">
            <div className="skeleton-circle"></div>
            <div className="temp-display">
              <div className="skeleton-line skeleton-temp"></div>
            </div>
          </div>
          <div className="current-details">
            <div className="skeleton-line skeleton-condition"></div>
            <div className="skeleton-line skeleton-feels"></div>
          </div>
        </div>

        <div className="weather-stats">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card">
              <div
                className="skeleton-circle-small"
                style={{ marginBottom: "8px" }}
              ></div>
              <div className="skeleton-line skeleton-stat-val"></div>
            </div>
          ))}
        </div>

        <div className="sun-times">
          <div className="sun-item" style={{ width: "40%" }}>
            <div className="skeleton-circle-small"></div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div className="skeleton-line skeleton-sun-val"></div>
              <div className="skeleton-line skeleton-sun-lbl"></div>
            </div>
          </div>
          <div className="sun-item" style={{ width: "40%" }}>
            <div className="skeleton-circle-small"></div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div className="skeleton-line skeleton-sun-val"></div>
              <div className="skeleton-line skeleton-sun-lbl"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`current-weather weather-${data.current.icon}`} style={sectionStyle}>
      <div className="location" style={{ color: textColor }}>
        <FiMapPin size={18} style={{ color: mutedColor }} />
        <h1>{data.location}</h1>
      </div>
      <div className="current-main">
        <div className={`current-temp-icon icon-${data.current.icon}`}>
          <WeatherIcon iconName={data.current.icon} size={"100%"} />
          <div className="temp-display">
            <span className="current-temp" style={{ color: textColor }}>
              {convertTemp(data.current.temp)}
            </span>
            <span className="temp-unit" style={{ color: mutedColor }}>°{unit}</span>
          </div>
        </div>
        <div className="current-details">
          <p className="condition" style={{ color: textColor }}>{data.current.condition}</p>
          <p className="feels-like" style={{ color: mutedColor }}>
            Feels like {convertTemp(data.current.feelsLike)}°
          </p>
        </div>
      </div>

      <div className="weather-stats">
        <div className="stat-card" style={statCardStyle}>
          <DotLottieReact
            src="https://lottie.host/93a4aacf-3ce2-4a3c-8a6e-207cb696dbe7/DHBVR0KNE3.lottie"
            loop
            autoplay
            className="lottie"
          />
          <div className="stat-info">
            <span className="stat-value" style={{ color: textColor }}>{data.current.humidity}%</span>
            <span className="stat-label" style={{ color: mutedColor }}>Humidity</span>
          </div>
        </div>
        <div className="stat-card" style={statCardStyle}>
          <DotLottieReact
            src="https://lottie.host/7618d137-1067-4d0a-bf8c-6d2662e77c1b/hBurLipvaO.lottie"
            loop
            autoplay
            className="lottie"
          />
          <div className="stat-info">
            <span className="stat-value" style={{ color: textColor }}>{data.current.windSpeed} mph</span>
            <span className="stat-label" style={{ color: mutedColor }}>Wind</span>
          </div>
        </div>
        <div className="stat-card" style={statCardStyle}>
          <WiBarometer size={28} style={{ color: mutedColor }} />
          <div className="stat-info">
            <span className="stat-value" style={{ color: textColor }}>{data.current.pressure} in</span>
            <span className="stat-label" style={{ color: mutedColor }}>Pressure</span>
          </div>
        </div>
        <div className="stat-card" style={statCardStyle}>
          <IoWater size={24} />
          <div className="stat-info">
            <span className="stat-value" style={{ color: textColor }}>{data.current.uvIndex}</span>
            <span className="stat-label" style={{ color: mutedColor }}>UV Index</span>
          </div>
        </div>
      </div>

      <div className="sun-times">
        <div className="sun-item">
          <WiSunrise size={40}/>
          <div>
            <span className="sun-value" style={{ color: textColor }}>{data.current.sunrise}</span>
            <span className="sun-label" style={{ color: mutedColor }}>Sunrise</span>
          </div>
        </div>
        <div className="sun-item">
          <WiSunset size={40} />
          <div>
            <span className="sun-value" style={{ color: textColor }}>{data.current.sunset}</span>
            <span className="sun-label" style={{ color: mutedColor }}>Sunset</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurrentWeather;