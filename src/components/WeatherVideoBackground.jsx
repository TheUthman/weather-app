import { memo, useMemo } from "react";

const VIDEO_BY_WEATHER = {
  clear: "/weather-videos/clear.mp4",
  clouds: "/weather-videos/clouds.mp4",
  fog: "/weather-videos/fog.mp4",
  rain: "/weather-videos/rain.mp4",
  snow: "/weather-videos/snow.mp4",
  storm: "/weather-videos/rain.mp4",
};

const getWeatherScene = (condition = "", icon = "") => {
  const value = `${condition} ${icon}`.toLowerCase();

  if (/(thunder|lightning|storm)/.test(value)) return "storm";
  if (/(snow|sleet|ice|blizzard)/.test(value)) return "snow";
  if (/(rain|drizzle|shower)/.test(value)) return "rain";
  if (/(fog|mist|haze|smoke)/.test(value)) return "fog";
  if (/(cloud|overcast)/.test(value)) return "clouds";
  return "clear";
};

const WeatherVideoBackground = ({ condition, icon }) => {
  const scene = useMemo(
    () => getWeatherScene(condition, icon),
    [condition, icon],
  );

  return (
    <div className={`minimal-weather-film scene-${scene}`} aria-hidden="true">
      <video key={scene} autoPlay muted loop playsInline preload="metadata">
        <source src={VIDEO_BY_WEATHER[scene]} type="video/mp4" />
      </video>
      {scene === "storm" && <div className="minimal-lightning" />}
    </div>
  );
};

export default memo(WeatherVideoBackground);
