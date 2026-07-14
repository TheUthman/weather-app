import { memo, useMemo } from "react";
import Icon from "./Icon";

const WeatherChangeTimeline = ({ hourly = [] }) => {
  const changes = useMemo(() => {
    if (hourly.length < 2) return [];
    const items = [];
    const used = new Set();
    const add = (type, time, title, detail, icon) => {
      if (used.has(type) || items.length >= 4) return;
      used.add(type);
      items.push({ type, time, title, detail, icon });
    };

    hourly.slice(1).forEach((hour, index) => {
      const previous = hourly[index];
      if (previous.precip < 40 && hour.precip >= 40) {
        add("rain-start", hour.time, "Rain becomes more likely", `${hour.precip}% chance of precipitation.`, "cloudRain");
      }
      if (previous.precip >= 40 && hour.precip < 25) {
        add("rain-stop", hour.time, "Rain risk eases", `Chance falls to ${hour.precip}%.`, "cloud");
      }
      if (hour.windGustKmh >= 45) {
        add("wind", hour.time, "Gusty period", `Gusts may reach ${Math.round(hour.windGustKmh)} km/h.`, "wind");
      }
      const temperatureChange = hour.rawTempC - previous.rawTempC;
      if (Math.abs(temperatureChange) >= 3) {
        add(
          "temperature",
          hour.time,
          temperatureChange > 0 ? "Temperature rises quickly" : "Temperature drops quickly",
          `${Math.abs(Math.round(temperatureChange))}° change within an hour.`,
          "sun",
        );
      }
      if (previous.condition !== hour.condition && hour.condition) {
        add("condition", hour.time, `Turning ${hour.condition.toLowerCase()}`, `Conditions shift from ${previous.condition.toLowerCase()}.`, "time");
      }
    });

    return items;
  }, [hourly]);

  return (
    <section className="intelligence-card weather-change-card" aria-labelledby="weather-change-title">
      <div className="feature-heading">
        <div>
          <span className="feature-kicker">What changes next</span>
          <h2 id="weather-change-title">Weather timeline</h2>
        </div>
        <Icon name="time" size={22} />
      </div>
      {changes.length ? (
        <ol className="change-timeline">
          {changes.map((change) => (
            <li key={change.type}>
              <span className="change-time">{change.time}</span>
              <span className="change-marker"><Icon name={change.icon} size={15} /></span>
              <div><strong>{change.title}</strong><p>{change.detail}</p></div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="feature-empty"><Icon name="check" size={22} /><strong>Conditions stay fairly steady</strong><p>No major shift is expected during the next 12 hours.</p></div>
      )}
    </section>
  );
};

export default memo(WeatherChangeTimeline);
