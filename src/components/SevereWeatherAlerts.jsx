import { memo } from "react";
import Icon from "./Icon";
import {
  celsiusToFahrenheit,
  formatPrecipitationFromMm,
  formatWindFromKmh,
} from "../utils/units";

const formatExpiry = (value) => {
  if (!value) return "Next 12 hours";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Next 12 hours";
  return `Through ${date.toLocaleTimeString([], { hour: "numeric" })}`;
};

const formatSummary = (alert, unit) => {
  if (alert.kind === "wind") {
    return `Wind gusts may reach ${formatWindFromKmh(alert.value, unit)}.`;
  }
  if (alert.kind === "rain") {
    return `Around ${formatPrecipitationFromMm(alert.value, unit)} of rain may fall today.`;
  }
  if (alert.kind === "heat") {
    const value = unit === "C" ? alert.value : celsiusToFahrenheit(alert.value);
    return `Temperatures may reach ${Math.round(value)}°${unit}.`;
  }
  return alert.summary;
};

const SevereWeatherAlerts = ({ alerts = [], loading = false, unit = "C" }) => {
  if (loading) {
    return <section className="severe-alerts-panel forecast-panel feature-skeleton" aria-label="Weather alerts" />;
  }

  if (!alerts.length) {
    return (
      <section className="severe-alerts-panel severe-alerts-clear forecast-panel" aria-label="Weather alerts">
        <span className="feature-icon feature-icon-success"><Icon name="check" size={20} /></span>
        <div>
          <span className="feature-kicker">Severe weather</span>
          <h2>No severe forecast signals</h2>
          <p>No major heat, wind, rain, or thunderstorm hazards are indicated for the next 12 hours.</p>
        </div>
        <span className="feature-status">Forecast-based</span>
      </section>
    );
  }

  return (
    <section className="severe-alerts-panel forecast-panel" aria-labelledby="severe-alert-title">
      <div className="feature-heading">
        <div>
          <span className="feature-kicker">Severe weather</span>
          <h2 id="severe-alert-title">Forecast alerts</h2>
        </div>
        <span className="feature-status">Not an official warning</span>
      </div>
      <div className="severe-alert-list">
        {alerts.map((alert) => (
          <article key={alert.id} className={`severe-alert-item severity-${alert.severity}`}>
            <span className="feature-icon"><Icon name="alertTriangle" size={21} /></span>
            <div className="severe-alert-copy">
              <div className="severe-alert-title-row">
                <h3>{alert.title}</h3>
                <span>{formatExpiry(alert.expiresAt)}</span>
              </div>
              <p>{formatSummary(alert, unit)}</p>
              <small>{alert.guidance}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default memo(SevereWeatherAlerts);
