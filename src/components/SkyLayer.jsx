/* eslint-disable no-unused-vars */
import { useMemo } from "react";

import { useCelestial } from "../hooks/useCelestial";
import { getArcPosition } from "../utils/celestialMath";
import { getSkyGradient } from "../utils/skyGradient";
import { getSunGlow } from "../utils/sunGlow";
import { getStarOpacity } from "../utils/stars";
import { getWeatherOverlay } from "../utils/weatherEffect";
import { getCloudColor } from "../utils/cloudLightning";

import Stars from "./Stars";

export default function SkyLayer({ daily, condition = "" }) {
  // 🌞 celestial state (MUST come first)
  const celestial = useCelestial(daily);

  // 📏 radius for sky arc
  const radius = useMemo(() => window.innerWidth * 0.45, []);

  // 🌍 position of sun/moon
  const { x, y } = getArcPosition(celestial.progress, radius);

  // 🌈 sky background gradient
  const skyStyle = getSkyGradient(
    celestial.type,
    celestial.progress
  );

  // 🌟 stars opacity
  const starsOpacity = getStarOpacity(
    celestial.type,
    celestial.progress
  );

  // ☀️ sun glow (only when sun is active)
  const sunGlow =
    celestial.type === "sun"
      ? getSunGlow(celestial.progress)
      : {};

  const overlayStyle = getWeatherOverlay(
    condition,
    celestial.progress
  );

  const cloudColor = getCloudColor(celestial.type, celestial.progress);

  return (
    <div className="sky-layer">

      <Stars opacity={starsOpacity} />

      {celestial.type === "sun" && (
        <div
          className="celestial sun"
          style={{
            transform: `translate(calc(50vw + ${x}px), calc(70vh + ${y}px))`,
            ...sunGlow,
          }}
        />
      )}

      {celestial.type === "moon" && (
        <div
          className="celestial moon"
          style={{
            transform: `translate(calc(50vw + ${x}px), calc(70vh + ${y}px))`,
          }}
        />
      )}

      <div
        className="cloud-layer"
        style={{ background: cloudColor }}
      />

      <div
        className="weather-overlay"
        style={overlayStyle}
      />
    </div>
  );
}