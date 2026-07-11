import { memo, useEffect, useMemo, useState } from "react";

import { useCelestial } from "../hooks/useCelestial";
import { getArcPosition } from "../utils/celestialMath";
import { getSkyGradient } from "../utils/skyGradient";
import { getSunGlow } from "../utils/sunGlow";
import { getStarOpacity } from "../utils/stars";
import { getWeatherOverlay } from "../utils/weatherEffect";
import { getCloudColor, getCloudBands } from "../utils/cloudLightning";

import Stars from "./Stars";

const getConditionType = (condition = "") => {
  const value = condition.toLowerCase();
  if (/thunder|storm|squall|hail/.test(value)) return "storm";
  if (/snow|sleet|ice|freezing/.test(value)) return "snow";
  if (/rain|drizzle|shower/.test(value)) return "rain";
  if (/fog|mist|haze|smoke/.test(value)) return "fog";
  if (/overcast/.test(value)) return "overcast";
  if (/cloud/.test(value)) return "cloudy";
  return "clear";
};

function SkyLayer({
  daily,
  condition = "",
  cloudCover = 0,
  windSpeed = 0,
  precipitation = 0,
}) {
  // 🌞 celestial state (MUST come first)
  const celestial = useCelestial(daily);
  const conditionType = getConditionType(condition);
  const phase =
    celestial.type === "moon"
      ? "night"
      : celestial.progress < 0.16
        ? "dawn"
        : celestial.progress > 0.78
          ? "dusk"
          : "day";

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
    );
  }, []);

  const [shouldRenderEffects, setShouldRenderEffects] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const revealEffects = () => {
      if (!cancelled) setShouldRenderEffects(true);
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(revealEffects, { timeout: 400 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback?.(id);
      };
    }

    const id = window.setTimeout(revealEffects, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  const isCompactViewport = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  }, []);

  // 📏 radius for sky arc
  const radius = useMemo(() => window.innerWidth * 0.45, []);

  // 🌍 position of sun/moon
  const { x, y } = getArcPosition(celestial.progress, radius);

  // 🌈 sky background gradient
  const skyStyle = getSkyGradient(celestial.type, celestial.progress);

  // 🌟 stars opacity
  const starsOpacity = getStarOpacity(celestial.type, celestial.progress);

  // ☀️ sun glow (only when sun is active)
  const sunGlow =
    celestial.type === "sun" ? getSunGlow(celestial.progress) : {};

  const overlayStyle = getWeatherOverlay(
    condition,
    celestial.progress,
    cloudCover,
    precipitation,
  );

  const cloudColor = getCloudColor(
    condition || "clear",
    celestial.type,
    celestial.progress,
    cloudCover,
  );
  const shouldRenderDetailedEffects =
    shouldRenderEffects || reducedMotion || isCompactViewport;

  const cloudBands = shouldRenderDetailedEffects
    ? getCloudBands(
        condition || "clear",
        celestial.type,
        celestial.progress,
        cloudCover,
        windSpeed,
        {
          reducedMotion,
          viewportWidth:
            typeof window !== "undefined" ? window.innerWidth : 1440,
        },
      )
    : [];

  return (
    <div
      className={`sky-layer sky-${phase} weather-${conditionType}`}
      style={skyStyle}
      aria-hidden="true"
    >
      <div className="sky-atmosphere" />
      {shouldRenderDetailedEffects && (
        <Stars
          opacity={starsOpacity}
          reducedMotion={reducedMotion}
          compact={isCompactViewport}
        />
      )}

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

      {shouldRenderDetailedEffects && (
        <div className="cloud-layer" style={{ background: cloudColor }}>
          {cloudBands.map((band, bandIndex) => (
            <div
              key={bandIndex}
              className="cloud-band"
              style={{
                top: band.top,
                opacity: band.opacity,
                height: band.height,
                filter: band.blur ? `blur(${band.blur}px)` : undefined,
                animationDuration: reducedMotion ? "0s" : band.speed,
                animationDirection:
                  band.direction === "reverse" ? "reverse" : "normal",
              }}
            >
              {band.clouds.map((cloud, cloudIndex) => (
                <div key={cloudIndex} className="cloud" style={cloud} />
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="weather-overlay" style={overlayStyle} />
      <div className="weather-phenomena">
        {(conditionType === "rain" || conditionType === "storm") && (
          <>
            <div className="rain-field rain-field-far" />
            <div className="rain-field rain-field-near" />
          </>
        )}
        {conditionType === "snow" && (
          <>
            <div className="snow-field snow-field-far" />
            <div className="snow-field snow-field-near" />
          </>
        )}
        {conditionType === "fog" && (
          <>
            <div className="fog-bank fog-bank-one" />
            <div className="fog-bank fog-bank-two" />
          </>
        )}
        {conditionType === "storm" && <div className="storm-flash" />}
      </div>
    </div>
  );
}

export default memo(SkyLayer);
