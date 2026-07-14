import { memo, useMemo, useState } from "react";
import Icon from "./Icon";

const activities = [
  { id: "outdoors", label: "Outdoors", icon: "sun" },
  { id: "run", label: "Run", icon: "heart" },
  { id: "cycle", label: "Cycle", icon: "navigation" },
  { id: "laundry", label: "Laundry", icon: "shirt" },
];

const scoreHour = (hour, activity) => {
  const precipitation = hour.precip || 0;
  const precipitationAmount = hour.precipAmount || 0;
  const gust = hour.windGustKmh || 0;
  const uvIndex = hour.uvIndex || 0;
  const temp = Number.isFinite(hour.rawTempC) ? hour.rawTempC : 21;
  let score = 100 - precipitation * 0.65 - precipitationAmount * 5;
  if (activity === "run") score -= Math.abs(temp - 19) * 3 + Math.max(uvIndex - 6, 0) * 6;
  if (activity === "cycle") score -= Math.max(gust - 20, 0) * 1.7 + Math.abs(temp - 21) * 2;
  if (activity === "laundry") score -= (hour.humidity || 60) * 0.28 + Math.max(gust - 35, 0) * 2;
  if (activity === "outdoors") score -= Math.abs(temp - 23) * 2 + Math.max(uvIndex - 7, 0) * 5;
  return Math.max(0, Math.min(100, Math.round(score)));
};

const ActivityPlanner = ({ hourly = [] }) => {
  const [activity, setActivity] = useState("outdoors");
  const result = useMemo(() => {
    if (!hourly.length) return null;
    return hourly
      .map((hour) => ({ hour, score: scoreHour(hour, activity) }))
      .sort((a, b) => b.score - a.score)[0];
  }, [activity, hourly]);

  const rating = !result ? "Unavailable" : result.score >= 80 ? "Great" : result.score >= 60 ? "Good" : result.score >= 40 ? "Fair" : "Poor";
  const reason = !result
    ? "Forecast data is still loading."
    : result.hour.precip >= 40
      ? "This is the driest available window, but rain remains possible."
      : result.hour.windGustKmh >= 35
        ? "Mostly dry, with some gusty wind to consider."
        : "Low rain risk and comfortable forecast conditions.";

  return (
    <section className="intelligence-card activity-planner-card" aria-labelledby="activity-planner-title">
      <div className="feature-heading">
        <div>
          <span className="feature-kicker">Plan your day</span>
          <h2 id="activity-planner-title">Activity planner</h2>
        </div>
        <Icon name="compass" size={23} />
      </div>
      <div className="activity-tabs" role="group" aria-label="Choose an activity">
        {activities.map((item) => (
          <button key={item.id} type="button" className={activity === item.id ? "active" : ""} onClick={() => setActivity(item.id)} aria-pressed={activity === item.id}>
            <Icon name={item.icon} size={15} />{item.label}
          </button>
        ))}
      </div>
      <div className="activity-result">
        <div><span>Best window</span><strong>{result?.hour.time || "—"}</strong></div>
        <div><span>Score</span><strong>{result ? `${result.score}/100` : "—"}</strong></div>
        <span className={`activity-rating rating-${rating.toLowerCase()}`}>{rating}</span>
      </div>
      <p>{reason}</p>
    </section>
  );
};

export default memo(ActivityPlanner);
