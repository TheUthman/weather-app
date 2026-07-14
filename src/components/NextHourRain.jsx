import { memo, useMemo } from "react";
import Icon from "./Icon";

const NextHourRain = ({ data = [] }) => {
  const summary = useMemo(() => {
    if (!data.length) return "Rain timing is unavailable.";
    const peak = Math.max(...data.map((slot) => slot.probability));
    if (peak < 20) return "Rain is unlikely during the next hour.";
    if (peak < 50) return "A passing shower is possible during the next hour.";
    return "Rain is likely during the next hour.";
  }, [data]);

  return (
    <section className="intelligence-card next-rain-card" aria-labelledby="next-rain-title">
      <div className="feature-heading">
        <div>
          <span className="feature-kicker">15-minute outlook</span>
          <h2 id="next-rain-title">Next-hour rain</h2>
        </div>
        <Icon name="cloudRain" size={23} />
      </div>
      <p className="next-rain-summary">{summary}</p>
      <div className="rain-bars" aria-label="Precipitation chance for the next hour">
        {data.map((slot) => (
          <div key={slot.minutes} className="rain-slot">
            <strong>{slot.probability}%</strong>
            <span className="rain-bar-track"><span style={{ height: `${Math.max(slot.probability, 4)}%` }} /></span>
            <small>{slot.label}</small>
          </div>
        ))}
      </div>
      <span className="feature-note">Estimated from the latest hourly model update.</span>
    </section>
  );
};

export default memo(NextHourRain);
