import { memo, useCallback, useMemo, useState } from "react";
import Icon from "./Icon";
import WeatherIcon from "./WeatherIcon";
import { formatFreshnessLabel } from "../utils/dateTime";
import {
  convertWindFromKmh,
  displayTemperature,
  formatPrecipitationFromMm,
  formatPressureFromInHg,
  formatVisibilityFromMiles,
  formatWindFromKmh,
} from "../utils/units";

const CHART_WIDTH = 660;
const CHART_HEIGHT = 225;
const CHART_PADDING = { top: 34, right: 18, bottom: 38, left: 42 };

const clampNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const HourlyChart = ({ data, mode, unit, convertTemp }) => {
  const config = useMemo(() => {
    const values = data.map((hour) => {
      if (mode === "rain") return clampNumber(hour.precip);
      if (mode === "wind") return convertWindFromKmh(hour.windSpeedKmh, unit);
      return convertTemp(hour.temp);
    });
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const padding = mode === "temperature" ? 2 : Math.max(4, (rawMax - rawMin) * 0.25);
    const min = mode === "rain" ? 0 : Math.max(0, Math.floor(rawMin - padding));
    const max = mode === "rain" ? Math.max(100, Math.ceil(rawMax / 10) * 10) : Math.ceil(rawMax + padding);
    return {
      values,
      min,
      max: max === min ? min + 1 : max,
      suffix: mode === "temperature" ? `°${unit}` : mode === "rain" ? "%" : unit === "C" ? " km/h" : " mph",
    };
  }, [data, mode, unit, convertTemp]);

  const plotWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const xFor = (index) => CHART_PADDING.left + (plotWidth * index) / Math.max(1, data.length - 1);
  const yFor = (value) => CHART_PADDING.top + ((config.max - value) / (config.max - config.min)) * plotHeight;
  const points = config.values.map((value, index) => `${xFor(index)},${yFor(value)}`).join(" ");
  const areaPoints = `${CHART_PADDING.left},${CHART_PADDING.top + plotHeight} ${points} ${CHART_PADDING.left + plotWidth},${CHART_PADDING.top + plotHeight}`;
  const ticks = Array.from({ length: 4 }, (_, index) => config.max - ((config.max - config.min) * index) / 3);
  const displayValue = (value) => `${Math.round(value)}${config.suffix}`;

  return (
    <svg className="hourly-chart" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label={`${mode} forecast for the next 12 hours`}>
      <defs>
        <linearGradient id={`hourly-chart-fill-${mode}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity=".23" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((tick, index) => {
        const y = yFor(tick);
        return (
          <g key={index} className="hourly-chart-gridline">
            <line x1={CHART_PADDING.left} x2={CHART_WIDTH - CHART_PADDING.right} y1={y} y2={y} />
            <text x={CHART_PADDING.left - 8} y={y + 4} textAnchor="end">{Math.round(tick)}{config.suffix}</text>
          </g>
        );
      })}
      <polygon points={areaPoints} fill={`url(#hourly-chart-fill-${mode})`} />
      <polyline className="hourly-chart-line" points={points} />
      {config.values.map((value, index) => (
        <g key={`${data[index].time}-${index}`} className="hourly-chart-point">
          <circle cx={xFor(index)} cy={yFor(value)} r="4" />
          <text className="hourly-chart-value" x={xFor(index)} y={yFor(value) - 12} textAnchor="middle">{displayValue(value)}</text>
          <text className="hourly-chart-time" x={xFor(index)} y={CHART_HEIGHT - 12} textAnchor="middle">{data[index].time}</text>
        </g>
      ))}
    </svg>
  );
};

const HourlyForecast = ({
  data,
  current,
  unit,
  loading,
  isStale = false,
  updatedAt = null,
}) => {
  const [chartMode, setChartMode] = useState("temperature");

  const convertTemp = useCallback(
    (temp) => displayTemperature(clampNumber(temp), unit) ?? 0,
    [unit],
  );
  const formatPercent = (value) => `${Math.round(clampNumber(value))}%`;
  const pressure = formatPressureFromInHg(current?.pressure, unit);
  const visibility = formatVisibilityFromMiles(current?.visibility, unit);
  const firstHour = data?.[0];
  const freshnessLabel = formatFreshnessLabel({
    updatedAt,
    timezone: current?.timezone,
    isStale,
  });

  const trend = useMemo(() => {
    if (!data?.length) return "Forecast trend will appear when hourly data is available.";
    const values = data.map((hour) => convertTemp(hour.temp));
    const start = values[0];
    const end = values.at(-1);
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (max - min <= 1) return `Temperatures stay near ${start}°${unit} throughout the next 12 hours.`;
    const direction = end > start ? "rise" : end < start ? "fall" : "remain steady";
    return `Temperatures ${direction} from ${start}°${unit} to ${end}°${unit}, ranging between ${min}° and ${max}°.`;
  }, [data, unit, convertTemp]);

  if (loading || !data || data.length === 0) {
    return (
      <section className="hourly-forecast hourly-details-panel forecast-panel" aria-busy="true">
        <div className="section-heading"><h2>Hourly details</h2><span>Next 12 hours</span></div>
        <div className="hourly-scroll hourly-strip-loading">
          {[...Array(8)].map((_, index) => <div key={index} className="hourly-card-skeleton"><div className="skeleton-line" /><div className="skeleton-circle-small" /><div className="skeleton-line" /></div>)}
        </div>
      </section>
    );
  }

  const metricCards = [
    ["cloudRain", "Rain chance", formatPercent(firstHour.precip)],
    ["droplet", "Rain amount", formatPrecipitationFromMm(firstHour.precipAmount, unit)],
    ["droplet", "Humidity", firstHour.humidity == null ? "—" : formatPercent(firstHour.humidity)],
    ["wind", "Wind", formatWindFromKmh(firstHour.windSpeedKmh, unit)],
    ["eye", "Visibility", visibility],
    ["cloud", "Cloud cover", formatPercent(current?.cloudCover)],
    ["barometer", "Pressure", pressure],
    ["droplet", "Dew point", current?.dewPoint == null ? "—" : `${convertTemp(current.dewPoint)}°${unit}`],
  ];

  return (
    <section className="hourly-forecast hourly-details-panel forecast-panel" aria-label="Hourly forecast details">
      <div className="section-heading hourly-details-heading">
        <h2>Hourly details</h2>
        <span>Next 12 hours</span>
      </div>

      <div className="hourly-scroll" aria-label="Next 12 hours">
        {data.map((hour, index) => (
          <article key={`${hour.time}-${index}`} className="hourly-card">
            <span className="hourly-time">{index === 0 ? "Now" : hour.time}</span>
            <div className="hourly-card-main">
              <WeatherIcon iconName={hour.icon} size={48} />
              <span className="hourly-temp">{convertTemp(hour.temp)}°</span>
            </div>
            <span className="hourly-card-rain"><Icon name="droplet" size={14} />{formatPercent(hour.precip)}</span>
          </article>
        ))}
      </div>

      <div className="hourly-detail-body">
        <div className="hourly-current-summary">
          <div className="hourly-current-status"><strong>{isStale ? "Cached" : "Current"}</strong><span>{freshnessLabel}</span></div>
          <div className="hourly-current-reading">
            <WeatherIcon iconName={firstHour.icon} size={132} />
            <div><div className="hourly-current-temp">{convertTemp(firstHour.temp)}<sup>°{unit}</sup></div><h3>{firstHour.condition}</h3><p>Feels like {convertTemp(current?.feelsLike)}°{unit}</p></div>
          </div>
          <p className="hourly-condition-copy">{firstHour.condition} conditions now, with a {formatPercent(firstHour.precip)} chance of rain.</p>
          <div className="hourly-sun-times">
            <div><Icon name="sunrise" size={28} /><span><strong>{current?.sunrise || "—"}</strong>Sunrise</span></div>
            <div><Icon name="sunset" size={28} /><span><strong>{current?.sunset || "—"}</strong>Sunset</span></div>
          </div>
        </div>

        <div className="hourly-metric-grid">
          {metricCards.map(([icon, label, value]) => (
            <div className="hourly-metric-card" key={label}><Icon name={icon} size={29} /><span>{label}<strong>{value}</strong></span></div>
          ))}
        </div>

        <div className="hourly-chart-column">
          <div className="hourly-chart-tabs" role="group" aria-label="Chart measurement">
            {["temperature", "rain", "wind"].map((mode) => <button key={mode} type="button" aria-pressed={chartMode === mode} className={chartMode === mode ? "active" : ""} onClick={() => setChartMode(mode)}>{mode[0].toUpperCase() + mode.slice(1)}</button>)}
          </div>
          <HourlyChart data={data} mode={chartMode} unit={unit} convertTemp={convertTemp} />
          <div className="hourly-trend-note"><span><Icon name="barometer" size={23} /></span><p><strong>12-hour temperature trend</strong>{trend}</p></div>
        </div>
      </div>
    </section>
  );
};

export default memo(HourlyForecast);
