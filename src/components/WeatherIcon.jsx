import { memo } from "react";

const iconMap = {
  sunny: "clear-day",
  "night-clear": "clear-night",
  "partly-cloudy": "partly-cloudy-day",
  "night-cloudy": "partly-cloudy-night",
  cloudy: "cloudy",
  rain: "rain",
  snow: "snow",
  thunderstorm: "thunderstorms",
};

const WeatherIcon = ({ iconName, size = 48 }) => {
  const file = iconMap[iconName] || "cloudy";
  return (
    <span className={`animated-weather-icon-wrapper icon-${iconName}`}>
      <img
        src={`/icons/meteocons/${file}.svg`}
        alt={iconName}
        width={size}
        height={size}
        decoding={size >= 100 ? "sync" : "async"}
        loading={size >= 100 ? "eager" : "lazy"}
        fetchPriority={size >= 100 ? "high" : "auto"}
        style={{ aspectRatio: "1 / 1", objectFit: "contain" }}
      />
    </span>
  );
};

export default memo(WeatherIcon);
