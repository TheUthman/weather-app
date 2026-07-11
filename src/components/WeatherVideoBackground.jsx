import { memo, useMemo } from "react";
import { useCelestial } from "../hooks/useCelestial";

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

const getFallbackPhase = () => {
  const hour = new Date().getHours();
  if (hour < 5 || hour >= 20) return "night";
  if (hour < 8) return "dawn";
  if (hour >= 17) return "dusk";
  return "day";
};

const WeatherVideoBackground = ({ daily, condition, icon }) => {
  const celestial = useCelestial(daily);
  const scene = useMemo(
    () => getWeatherScene(condition, icon),
    [condition, icon],
  );
  const timePhase = useMemo(() => {
    if (!daily?.length) return getFallbackPhase();
    if (celestial.type === "moon") return "night";
    if (celestial.progress < 0.14) return "dawn";
    if (celestial.progress > 0.78) return "dusk";
    return "day";
  }, [celestial.progress, celestial.type, daily]);

  return (
    <div
      className={`minimal-weather-film scene-${scene} time-${timePhase}`}
      data-weather-scene={scene}
      data-time-phase={timePhase}
      aria-hidden="true"
    >
      <video key={scene} autoPlay muted loop playsInline preload="metadata">
        <source src={VIDEO_BY_WEATHER[scene]} type="video/mp4" />
      </video>
      <div className="minimal-time-light" />
      {scene === "storm" && <div className="minimal-lightning" />}
    </div>
  );
};

export default memo(WeatherVideoBackground);
