import { useEffect, useState } from "react";
import { clamp, getProgress } from "../utils/celestialMath";

export function useCelestial(daily) {
  const [now, setNow] = useState(() => Date.now());

  // live clock update (smooth movement)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!daily?.length) {
    return { type: "sun", progress: 0 };
  }

  const today = daily[0];

  const sunrise = new Date(today.sunEvents?.sunriseTime).getTime();
  const sunset = new Date(today.sunEvents?.sunsetTime).getTime();

  const tomorrowSunrise = new Date(
    daily[1]?.sunEvents?.sunriseTime || today.sunEvents?.sunriseTime
  ).getTime();

  if (isNaN(sunrise) || isNaN(sunset) || isNaN(tomorrowSunrise)) {
    return { type: "sun", progress: 0.5 };
  }

  const isDay = now >= sunrise && now <= sunset;

  // 🌞 DAY MODE
  if (isDay) {
    return {
      type: "sun",
      progress: clamp(getProgress(sunrise, sunset, now)),
    };
  }

  // 🌙 NIGHT MODE (moon = inverse sun cycle)
  return {
    type: "moon",
    progress: clamp(getProgress(sunset, tomorrowSunrise, now)),
  };
}