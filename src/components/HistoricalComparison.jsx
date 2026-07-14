import { memo } from "react";
import Icon from "./Icon";

const convertTemp = (value, unit) => {
  if (!Number.isFinite(value)) return null;
  return unit === "F" ? value * 9 / 5 + 32 : value;
};

const convertTemperatureDifference = (value, unit) =>
  unit === "F" ? value * 9 / 5 : value;

const signed = (value) => `${value > 0 ? "+" : ""}${value.toFixed(1)}`;

const HistoricalComparison = ({ data, today, unit, loading }) => {
  if (loading) {
    return <section className="intelligence-card feature-skeleton" aria-label="Historical comparison loading" />;
  }

  const currentMean = today ? (today.highC + today.lowC) / 2 : null;
  const temperatureDifference = Number.isFinite(currentMean) && Number.isFinite(data?.averageTemperature)
    ? convertTemperatureDifference(currentMean - data.averageTemperature, unit)
    : null;
  const precipitationDifference = Number.isFinite(today?.precipitationSum) && Number.isFinite(data?.averagePrecipitation)
    ? today.precipitationSum - data.averagePrecipitation
    : null;

  return (
    <section className="intelligence-card historical-card" aria-labelledby="historical-title">
      <div className="feature-heading">
        <div>
          <span className="feature-kicker">Compared with recent years</span>
          <h2 id="historical-title">Today vs typical</h2>
        </div>
        <Icon name="barometer" size={23} />
      </div>
      {data && temperatureDifference !== null ? (
        <>
          <div className="historical-primary">
            <strong>{signed(temperatureDifference)}°</strong>
            <span>{temperatureDifference >= 0 ? "warmer" : "cooler"} than the seasonal average</span>
          </div>
          <div className="historical-metrics">
            <div><span>Typical high</span><strong>{Math.round(convertTemp(data.averageHigh, unit))}°</strong></div>
            <div><span>Typical low</span><strong>{Math.round(convertTemp(data.averageLow, unit))}°</strong></div>
            <div><span>Rain difference</span><strong>{precipitationDifference === null ? "—" : `${signed(precipitationDifference)} mm`}</strong></div>
          </div>
          <span className="feature-note">Based on a seven-day seasonal window across {data.years} recent years.</span>
        </>
      ) : (
        <div className="feature-empty"><Icon name="info" size={22} /><strong>Historical comparison unavailable</strong><p>The live forecast remains available while the historical service catches up.</p></div>
      )}
    </section>
  );
};

export default memo(HistoricalComparison);
