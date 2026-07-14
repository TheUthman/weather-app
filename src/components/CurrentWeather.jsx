import { memo, useEffect, useState } from "react";
import Icon from "./Icon";
import WeatherIcon from "./WeatherIcon";

const convertTemp = (temp, unit) => {
  if (unit === "C") return Math.round(((temp - 32) * 5) / 9);
  return temp;
};

const formatRain = (value) => {
  const amount = Number(value) || 0;
  if (amount === 0) return "0 in";
  return `${amount.toFixed(2)} in`;
};

const Metric = ({ icon, label, value }) => (
  <div className="metric-item">
    <span className="metric-icon">{icon}</span>
    <span className="metric-label">{label}</span>
    <strong className="metric-value">{value}</strong>
  </div>
);

const LocalTime = memo(function LocalTime() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    }),
  );

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
      );
    };

    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  return <h3>{time}</h3>;
});

const dialPosition = (index) => {
  const closestScale = 1.16;
  const farthestScale = 0.76;
  const scaleStep = (closestScale - farthestScale) / 11;

  return {
    "--dial-angle": `${index * 30}deg`,
    "--dial-angle-inverse": `${index * -30}deg`,
    "--hour-scale": (closestScale - scaleStep * index).toFixed(3),
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

  return (
    <div className="weather-dial-shell">
      <div className="weather-dial" role="list" aria-label="Hourly weather dial">
        <div className="weather-dial-face" aria-hidden="true">
          <div className="weather-dial-ticks" />
          <div className="weather-dial-orbit" />
          <div className="weather-dial-hand" />
        </div>
        {dialHours.map((hour, index) => {
          const hourTemperature = convertTemp(hour.temp, unit);

          return (
            <div
              className={`weather-dial-hour${index === 0 ? " weather-dial-hour-now" : ""}`}
              key={`${hour.time}-${index}`}
              role="listitem"
              style={dialPosition(index)}
              aria-label={`${index === 0 ? "Now" : hour.time}, ${hourTemperature} degrees, ${hour.condition}`}
            >
              <div className="weather-dial-hour-content" aria-hidden="true">
                <span className="weather-dial-time">{index === 0 ? "Now" : hour.time}</span>
                <span className="weather-dial-hour-reading">
                  <WeatherIcon iconName={hour.icon} size={24} />
                  <strong>{hourTemperature}°</strong>
                </span>
              </div>
            </div>
          );
        })}

        <div className="weather-dial-center">
          <span className="weather-dial-live"><i />Current</span>
          <WeatherIcon iconName={current.icon} size={92} />
          <div className="temp-display">
            <span className="current-temp">{temperature}</span>
            <span className="temp-unit">°{unit}</span>
          </div>
          <p className="condition">{current.condition}</p>
          <p className="feels-like">Feels like {feelsLike}°</p>
          <div className="weather-dial-center-stats">
            <span><Icon name="droplet" size={11} />{current.humidity}%</span>
            <span><Icon name="cloudRain" size={11} />{formatRain(current.precipitation)}</span>
          </div>
        </div>
      </div>

      <div className="weather-dial-summary" aria-label="12-hour weather summary">
        <div>
          <span>Temperature range</span>
          <strong>{minimumTemperature}°–{maximumTemperature}°</strong>
        </div>
        <div>
          <span>Peak rain chance</span>
          <strong>{Math.round(peakRainChance)}%</strong>
        </div>
        <div>
          <span>Temperature trend</span>
          <strong>{temperatureTrend}</strong>
        </div>
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

const CurrentWeather = ({ data, hourly = [], unit, loading }) => {
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
  const wind = current.windDirection
    ? `${current.windSpeed} mph ${current.windDirection}`
    : `${current.windSpeed} mph`;

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
          <span className="current-live-pill"><i />Live</span>
          <div className="current-local-time">
            <Icon name="time" size={16} />
            <LocalTime />
          </div>
        </div>
      </header>

      <div className="current-weather-content">
        <div className="current-dial-panel">
          <div className="current-section-heading">
            <div>
              <span>12-hour outlook</span>
              <strong>Weather clock</strong>
            </div>
            <span className="current-section-hint">Each stop is one hour</span>
          </div>
          <HourlyWeatherDial
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
            <Metric icon={<Icon name="barometer" />} label="Pressure" value={`${current.pressure} in`} />
            <Metric icon={<Icon name="sun" />} label="UV Index" value={current.uvIndex} />
            <Metric icon={<Icon name="cloudRain" />} label="Rain" value={formatRain(current.precipitation)} />
            <Metric icon={<Icon name="cloud" />} label="Clouds" value={`${current.cloudCover}%`} />
            <Metric icon={<Icon name="eye" />} label="Visibility" value={current.visibility ? `${current.visibility} mi` : "N/A"} />
            <Metric icon={<Icon name="compass" />} label="Dew Point" value={`${dewPoint}°`} />
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
