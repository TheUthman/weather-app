import { memo, useEffect, useRef, useState } from "react";
import { FiRotateCcw } from "react-icons/fi";
import Icon from "./Icon";
import WeatherIcon from "./WeatherIcon";
import { formatFreshnessLabel, formatZonedTime } from "../utils/dateTime";
import { classifyTouchGesture } from "../utils/dialInteraction";
import {
  displayTemperature,
  formatPrecipitationFromMm,
  formatPressureFromInHg,
  formatVisibilityFromMiles,
  formatWindFromMph,
} from "../utils/units";

const convertTemp = (temp, unit) => displayTemperature(temp, unit) ?? 0;

const Metric = ({ icon, label, value }) => (
  <div className="metric-item">
    <span className="metric-icon">{icon}</span>
    <span className="metric-label">{label}</span>
    <strong className="metric-value">{value}</strong>
  </div>
);

const LocalTime = memo(function LocalTime({ timezone }) {
  const [time, setTime] = useState(() => formatZonedTime(new Date(), timezone));

  useEffect(() => {
    const tick = () => {
      setTime(formatZonedTime(new Date(), timezone));
    };

    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [timezone]);

  return <time>{time}</time>;
});

const normalizeAngleDelta = (angle) => ((angle + 180) % 360 + 360) % 360 - 180;
const wrapIndex = (index, length) => ((index % length) + length) % length;

const dialPosition = (index, selectedIndex = 0, rotation = 0) => {
  const indexDistance = Math.abs(index - selectedIndex);
  const distance = Math.min(indexDistance, 12 - indexDistance);
  const scale = distance === 0 ? 1.25 : Math.max(0.74, 1 - distance * 0.055);
  const opacity = distance === 0 ? 1 : Math.max(0.34, 0.88 - distance * 0.09);
  const angle = index * 30 + rotation;

  return {
    "--dial-angle": `${angle}deg`,
    "--dial-angle-inverse": `${-angle}deg`,
    "--hour-scale": scale.toFixed(3),
    "--hour-opacity": opacity.toFixed(2),
    "--hour-distance": distance,
  };
};

const HourlyWeatherDial = memo(function HourlyWeatherDial({
  current,
  hourly,
  unit,
  temperature,
  feelsLike,
}) {
  const dialHours = hourly.slice(0, 12);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dialRotation, setDialRotation] = useState(0);
  const dragState = useRef(null);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef(null);
  const reducedMotionRef = useRef(false);
  const selectedHour = dialHours[selectedIndex] || dialHours[0];
  const selectedTemperature = selectedHour
    ? convertTemp(selectedHour.temp, unit)
    : temperature;
  const selectedHumidity = selectedIndex === 0
    ? current.humidity
    : selectedHour?.humidity;
  const selectedRain = `${Math.round(Number(selectedHour?.precip) || 0)}%`;
  const dialTemperatures = dialHours.map((hour) => convertTemp(hour.temp, unit));
  const minimumTemperature = dialTemperatures.length
    ? Math.min(...dialTemperatures)
    : temperature;
  const maximumTemperature = dialTemperatures.length
    ? Math.max(...dialTemperatures)
    : temperature;
  const peakRainChance = dialHours.length
    ? Math.max(...dialHours.map((hour) => Number(hour.precip) || 0))
    : 0;
  const temperatureChange = dialTemperatures.length > 1
    ? dialTemperatures.at(-1) - dialTemperatures[0]
    : 0;
  const temperatureTrend = Math.abs(temperatureChange) < 2
    ? "Steady"
    : `${temperatureChange > 0 ? "↑" : "↓"} ${Math.abs(temperatureChange)}°`;
  const chartRange = Math.max(maximumTemperature - minimumTemperature, 1);
  const chartPoints = dialTemperatures.map((value, index) => ({
    x: dialTemperatures.length > 1
      ? (index / (dialTemperatures.length - 1)) * 100
      : 50,
    y: ((value - minimumTemperature) / chartRange) * 72 + 14,
  }));
  const chartClipPath = chartPoints.length
    ? `polygon(0 100%, ${chartPoints.map((point) => `${point.x}% ${100 - point.y}%`).join(", ")}, 100% 100%)`
    : "polygon(0 100%, 0 60%, 100% 60%, 100% 100%)";

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const stopDialAnimation = () => {
    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
  };

  const commitRotation = (rotation) => {
    rotationRef.current = rotation;
    setDialRotation(rotation);
  };

  const springToRotation = (target, releaseVelocity = 0) => {
    stopDialAnimation();

    if (reducedMotionRef.current) {
      velocityRef.current = 0;
      commitRotation(target);
      return;
    }

    velocityRef.current = Math.max(-540, Math.min(540, releaseVelocity));
    let previousTime = null;

    const settle = (time) => {
      const deltaTime = previousTime === null
        ? 1 / 60
        : Math.min((time - previousTime) / 1000, 0.032);
      previousTime = time;
      const displacement = target - rotationRef.current;

      // A slightly under-damped rotary spring gives the dial weight without wobbling.
      const acceleration = displacement * 205 - velocityRef.current * 25;
      velocityRef.current += acceleration * deltaTime;
      const nextRotation = rotationRef.current + velocityRef.current * deltaTime;
      commitRotation(nextRotation);

      if (Math.abs(target - nextRotation) < 0.025 && Math.abs(velocityRef.current) < 0.35) {
        velocityRef.current = 0;
        commitRotation(target);
        animationFrameRef.current = null;
        return;
      }

      animationFrameRef.current = requestAnimationFrame(settle);
    };

    animationFrameRef.current = requestAnimationFrame(settle);
  };

  const selectHour = (index, releaseVelocity = 0) => {
    if (!dialHours.length) return;
    const nextIndex = wrapIndex(index, dialHours.length);
    const nominalTarget = -nextIndex * 30;
    const target = rotationRef.current + normalizeAngleDelta(nominalTarget - rotationRef.current);
    setSelectedIndex(nextIndex);
    springToRotation(target, releaseVelocity);
  };

  const selectRelativeHour = (step) => {
    selectHour(selectedIndex + step);
  };

  const handleDialKeyDown = (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectRelativeHour(1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectRelativeHour(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectHour(0);
    }
  };

  const pointerAngle = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return Math.atan2(
      event.clientY - (bounds.top + bounds.height / 2),
      event.clientX - (bounds.left + bounds.width / 2),
    ) * (180 / Math.PI);
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const isTouch = event.pointerType === "touch";
    dragState.current = {
      lastAngle: pointerAngle(event),
      lastTime: event.timeStamp,
      startX: event.clientX,
      startY: event.clientY,
      pointerId: event.pointerId,
      isTouch,
      velocity: 0,
      moved: false,
      active: !isTouch,
      tracking: true,
    };
    if (!isTouch) {
      stopDialAnimation();
      event.currentTarget.classList.add("weather-dial-dragging");
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
  };

  const handlePointerMove = (event) => {
    const state = dragState.current;
    if (!state?.tracking || !dialHours.length) return;

    if (state.isTouch && !state.active) {
      const intent = classifyTouchGesture(
        event.clientX - state.startX,
        event.clientY - state.startY,
      );
      if (intent === "pending") return;
      if (intent === "scroll") {
        dragState.current = { ...state, moved: true, tracking: false };
        return;
      }

      state.active = true;
      state.moved = true;
      state.lastAngle = pointerAngle(event);
      state.lastTime = event.timeStamp;
      stopDialAnimation();
      event.currentTarget.classList.add("weather-dial-dragging");
      event.currentTarget.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      return;
    }

    if (!state.active) return;
    if (state.isTouch) event.preventDefault();
    const time = event.timeStamp;
    const angle = pointerAngle(event);
    const angleDelta = normalizeAngleDelta(angle - state.lastAngle);
    const deltaTime = Math.max((time - state.lastTime) / 1000, 0.008);
    const nextRotation = rotationRef.current + angleDelta;
    const instantaneousVelocity = angleDelta / deltaTime;

    state.velocity = state.velocity * 0.72 + instantaneousVelocity * 0.28;
    state.lastAngle = angle;
    state.lastTime = time;
    state.moved ||= Math.abs(angleDelta) > 0.35;
    commitRotation(nextRotation);

    const nearestIndex = wrapIndex(Math.round(-nextRotation / 30), dialHours.length);
    setSelectedIndex((currentIndex) => currentIndex === nearestIndex ? currentIndex : nearestIndex);
  };

  const handlePointerUp = (event) => {
    const state = dragState.current;
    if (state?.active) {
      state.active = false;
      const projectedRotation = rotationRef.current + state.velocity * 0.075;
      const nearestIndex = wrapIndex(Math.round(-projectedRotation / 30), dialHours.length);
      selectHour(nearestIndex, state.velocity);
    }
    dragState.current = state ? { ...state, tracking: false } : null;
    event.currentTarget.classList.remove("weather-dial-dragging");
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
  };

  return (
    <div className="weather-dial-shell">
      <div
        className="weather-dial"
        role="group"
        aria-label="12-hour weather dial. Use arrow keys or drag to select an hour."
        tabIndex={0}
        onKeyDown={handleDialKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="weather-dial-face" aria-hidden="true">
          <div className="weather-dial-radar">
            <span className="weather-dial-radar-sweep" />
            <i className="weather-dial-radar-blip radar-blip-one" />
            <i className="weather-dial-radar-blip radar-blip-two" />
            <i className="weather-dial-radar-blip radar-blip-three" />
          </div>
          <div className="weather-dial-ticks" />
          <div className="weather-dial-orbit" />
          <div className="weather-dial-hand" />
          <div className="weather-dial-scale">
            {Array.from({ length: 12 }, (_, index) => (
              <i
                className={index % 3 === 0 ? "scale-quarter" : "scale-major"}
                key={index}
                style={{ "--marker-angle": `${index * 30}deg` }}
              />
            ))}
          </div>
          <div className="weather-dial-calibration">
            {Array.from({ length: 12 }, (_, index) => (
              <i key={index} style={{ "--marker-angle": `${index * 30 + 15}deg` }} />
            ))}
          </div>
        </div>
        {dialHours.map((hour, index) => {
          const hourTemperature = convertTemp(hour.temp, unit);

          return (
            <div
              className={`weather-dial-hour${index === selectedIndex ? " weather-dial-hour-active" : ""}${index === 0 ? " weather-dial-hour-now" : ""}${hour.isDay === true ? " weather-dial-hour-day" : hour.isDay === false ? " weather-dial-hour-night" : ""}`}
              key={`${hour.time}-${index}`}
              id={`weather-dial-hour-${index}`}
              style={dialPosition(index, selectedIndex, dialRotation)}
            >
              <button
                className="weather-dial-hour-content"
                type="button"
                tabIndex={index === selectedIndex ? 0 : -1}
                aria-pressed={index === selectedIndex}
                title={`${hour.condition}${hour.isDay === true ? " during daylight" : hour.isDay === false ? " at night" : ""}`}
                onClick={() => {
                  if (!dragState.current?.moved) selectHour(index);
                }}
              >
                <span className="weather-dial-time">{index === 0 ? "Now" : hour.time}</span>
                <span className="weather-dial-hour-reading">
                  <WeatherIcon iconName={hour.icon} size={24} />
                  <strong>{hourTemperature}°</strong>
                </span>
                <small className="weather-dial-card-hour">{hour.time}</small>
              </button>
            </div>
          );
        })}

        <div className="weather-dial-center" aria-live="polite">
          <span className="weather-dial-live">
            <i />{selectedIndex === 0 ? "Current" : selectedHour?.time}
          </span>
          <WeatherIcon iconName={selectedHour?.icon || current.icon} size={92} />
          <div className="temp-display">
            <span className="current-temp">{selectedTemperature}</span>
            <span className="temp-unit">°{unit}</span>
          </div>
          <p className="condition">{selectedHour?.condition || current.condition}</p>
          <p className="feels-like">
            {selectedIndex === 0 ? `Feels like ${feelsLike}°` : "Hourly forecast"}
          </p>
          <div className="weather-dial-center-stats">
            <span><Icon name="droplet" size={11} />{selectedHumidity ?? "—"}%</span>
            <span><Icon name="cloudRain" size={11} />{selectedRain}</span>
          </div>
        </div>
      </div>

      {selectedIndex !== 0 && (
        <div className="weather-dial-controls">
          <button
            className="weather-dial-recalibrate"
            type="button"
            onClick={() => selectHour(0)}
          >
            <FiRotateCcw size={13} aria-hidden="true" />
            Recalibrate to now
          </button>
        </div>
      )}

      <div className="weather-dial-summary" aria-label="12-hour weather summary">
        <div className="weather-dial-summary-card">
          <span>Temperature range</span>
          <strong>{minimumTemperature}°–{maximumTemperature}°</strong>
          <div className="weather-dial-sparkline" aria-hidden="true">
            <i className="weather-dial-sparkline-fill" style={{ clipPath: chartClipPath }} />
            {chartPoints.map((point, index) => (
              <b
                key={index}
                style={{ left: `${point.x}%`, bottom: `${point.y}%` }}
              />
            ))}
          </div>
        </div>
        <div className="weather-dial-summary-card">
          <span>Peak rain chance</span>
          <strong>{Math.round(peakRainChance)}%</strong>
          <div className="weather-dial-rain-bars" aria-hidden="true">
            {dialHours.slice(0, 8).map((hour, index) => (
              <i
                key={index}
                style={{ height: `${Math.max(12, Number(hour.precip) || 0)}%` }}
              />
            ))}
          </div>
        </div>
        <div className="weather-dial-summary-card">
          <span>Temperature trend</span>
          <strong>{temperatureTrend}</strong>
          <div className="weather-dial-trend-track" aria-hidden="true">
            <i style={{ transform: `rotate(${Math.max(-18, Math.min(18, temperatureChange * -5))}deg)` }} />
            <b />
          </div>
        </div>
      </div>

      <div className="weather-dial-instructions" aria-label="Dial interaction guidance">
        <span><i>1</i>Drag or swipe around the dial</span>
        <span><i>2</i>Snaps to the nearest hour</span>
        <span><i>3</i>Center updates with selection</span>
      </div>
    </div>
  );
});

const WeatherDialSkeleton = () => (
  <div className="weather-dial-shell weather-dial-skeleton" aria-hidden="true">
    <div className="weather-dial">
      <div className="weather-dial-face">
        <div className="weather-dial-ticks" />
        <div className="weather-dial-orbit" />
      </div>
      {[...Array(12)].map((_, index) => (
        <div className="weather-dial-hour" key={index} style={dialPosition(index)}>
          <div className="weather-dial-hour-content skeleton-circle-small" />
        </div>
      ))}
      <div className="weather-dial-center">
        <div className="skeleton-circle-small weather-dial-icon-skeleton" />
        <div className="skeleton-line skeleton-temp" style={{ height: "64px", width: "108px" }} />
        <div className="skeleton-line" style={{ height: "14px", width: "90px" }} />
      </div>
    </div>
    <div className="weather-dial-summary">
      {[...Array(3)].map((_, index) => (
        <div key={index}><div className="skeleton-line" /></div>
      ))}
    </div>
  </div>
);

const CurrentWeather = ({
  data,
  hourly = [],
  unit,
  loading,
  isStale = false,
  updatedAt = null,
}) => {
  if (loading || !data || !data.current) {
    return (
      <section className="current-weather current-weather-skeleton" aria-label="Loading current weather">
        <header className="current-weather-header">
          <div className="current-location-block">
            <div className="skeleton-circle-small" />
            <div>
              <div className="skeleton-line" style={{ height: "9px", width: "70px", marginBottom: "7px" }} />
              <div className="skeleton-line skeleton-title" style={{ height: "18px", width: "150px" }} />
            </div>
          </div>
          <div className="skeleton-line" style={{ height: "28px", width: "92px" }} />
        </header>

        <div className="current-weather-content">
          <div className="current-dial-panel">
            <div className="current-section-heading">
              <div className="skeleton-line" style={{ height: "12px", width: "110px" }} />
              <div className="skeleton-line" style={{ height: "10px", width: "80px" }} />
            </div>
          <WeatherDialSkeleton />
          </div>

          <div className="current-details-panel">
            <div className="weather-metrics" aria-label="Loading weather details">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="metric-item">
                  <div className="skeleton-circle-small" />
                  <div className="skeleton-line skeleton-stat-val" />
                </div>
              ))}
            </div>
            <div className="sun-journey skeleton-line" />
          </div>
        </div>
      </section>
    );
  }

  const { current } = data;
  const temperature = convertTemp(current.temp, unit);
  const feelsLike = convertTemp(current.feelsLike, unit);
  const dewPoint = convertTemp(current.dewPoint, unit);
  const windSpeed = formatWindFromMph(current.windSpeed, unit);
  const wind = current.windDirection
    ? `${windSpeed} ${current.windDirection}`
    : windSpeed;

  return (
    <section className="current-weather" aria-label="Current weather">
      <header className="current-weather-header">
        <div className="current-location-block">
          <span className="current-location-icon">
            <Icon name="mapPin" size={16} />
          </span>
          <div>
            <span className="current-location-label">Current location</span>
            <h1>{data.location || "Current Location"}</h1>
          </div>
        </div>
        <div className="current-time-block">
          <span className={`current-live-pill${isStale ? " current-cached-pill" : ""}`}><i />{isStale ? "Cached" : "Live"}</span>
          <div className="current-local-time">
            <Icon name="time" size={16} />
            <LocalTime timezone={current.timezone} />
          </div>
          <span className="current-freshness">{formatFreshnessLabel({ updatedAt, timezone: current.timezone, isStale })}</span>
        </div>
      </header>

      <div className="current-weather-content">
        <div className="current-dial-panel">
          <div className="current-section-heading current-dial-heading">
            <div>
              <span>12-hour outlook</span>
              <strong>Weather Dial</strong>
              <small>Each stop is one hour</small>
            </div>
          </div>
          <HourlyWeatherDial
            key={current.updatedAt || data.location}
            current={current}
            hourly={hourly}
            unit={unit}
            temperature={temperature}
            feelsLike={feelsLike}
          />
        </div>

        <aside className="current-details-panel">
          <div className="current-section-heading">
            <div>
              <span>Right now</span>
              <strong>Atmosphere</strong>
            </div>
            <span className="current-section-hint">8 live readings</span>
          </div>

          <div className="weather-metrics" aria-label="Weather details">
            <Metric icon={<Icon name="droplet" />} label="Humidity" value={`${current.humidity}%`} />
            <Metric icon={<Icon name="wind" />} label="Wind" value={wind} />
            <Metric icon={<Icon name="barometer" />} label="Pressure" value={formatPressureFromInHg(current.pressure, unit)} />
            <Metric icon={<Icon name="sun" />} label="UV Index" value={current.uvIndex} />
            <Metric icon={<Icon name="cloudRain" />} label="Rain" value={formatPrecipitationFromMm(current.precipitation, unit)} />
            <Metric icon={<Icon name="cloud" />} label="Clouds" value={`${current.cloudCover}%`} />
            <Metric icon={<Icon name="eye" />} label="Visibility" value={formatVisibilityFromMiles(current.visibility, unit)} />
            <Metric icon={<Icon name="droplet" />} label="Dew Point" value={`${dewPoint}°${unit}`} />
          </div>

          <div className="sun-journey" aria-label="Sun times">
            <div className="sun-journey-heading">
              <span>Daylight journey</span>
              <Icon name="sun" size={18} />
            </div>
            <div className="sun-journey-track" aria-hidden="true"><i /></div>
            <div className="sun-times">
              <div className="sun-item">
                <Icon name="sunrise" size={26} />
                <span><small>Sunrise</small><strong>{current.sunrise}</strong></span>
              </div>
              <div className="sun-item">
                <span><small>Sunset</small><strong>{current.sunset}</strong></span>
                <Icon name="sunset" size={26} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default memo(CurrentWeather);
