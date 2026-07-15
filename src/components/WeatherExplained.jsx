import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import { weatherExplanations } from "../data/weatherExplanations";

const WeatherExplained = () => {
  const [explanationIndex, setExplanationIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      setExplanationIndex((current) => (current + 1) % weatherExplanations.length);
    }, 10000);
    return () => window.clearInterval(interval);
  }, []);

  const explanation = weatherExplanations[explanationIndex];

  return (
    <div className="insight-card-minimalist weather-explained-card">
      <div className="insight-card-header">
        <Icon name="info" size={24} />
        <h3 className="insight-card-title">Weather explained</h3>
      </div>
      <div className="weather-explained-content" aria-live="polite">
        <span className="weather-explained-icon">
          <Icon name={explanation.icon} size={38} />
        </span>
        <div>
          <strong>{explanation.term}</strong>
          <p className="insight-card-content">{explanation.short}</p>
        </div>
      </div>
      <div className="weather-explained-footer">
        <span className="indicator-text">{explanationIndex + 1} of {weatherExplanations.length}</span>
        <Link to="/help" className="insight-card-link">
          Learn more <Icon name="chevronRight" size={15} />
        </Link>
      </div>
    </div>
  );
};

export default WeatherExplained;
