import Icon from "./Icon";
import { FiStar } from "react-icons/fi";

const Header = ({
  unit,
  data,
  status = "live",
  setUnit,
  onDetectLocation,
  isDetecting,
  onToggleFavorite,
  isFavorite,
  canFavorite,
}) => {
  const statusCopy = {
    live: { pill: data || "Live weather", heading: "Live conditions" },
    cached: { pill: "Cached forecast", heading: "Saved conditions" },
    loading: { pill: "Updating forecast", heading: "Loading conditions" },
    error: { pill: "Forecast unavailable", heading: "Conditions unavailable" },
  }[status] || { pill: data || "Weather", heading: "Weather conditions" };

  return (
    <header className="weather-header">
      <div className="header-copy">
        <div className="header-kicker-row">
          <span>Weather Radar</span>
        </div>
        <strong>{statusCopy.heading}</strong>
      </div>
      <div className="header-actions">
        <button
          className={`icon-btn favorite-btn ${isFavorite ? "favorite-active" : ""}`}
          onClick={onToggleFavorite}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-label={
            isFavorite ? "Remove current location from favorites" : "Add current location to favorites"
          }
          disabled={!canFavorite}
        >
          <FiStar size={19} />
        </button>
        <button
          className={`icon-btn ${isDetecting ? "detecting" : ""}`}
          onClick={onDetectLocation}
          title="Detect my location"
          aria-label="Detect my location"
          disabled={isDetecting}
        >
          <Icon name="navigation" size={20} />
        </button>
        <button
          className="unit-toggle"
          onClick={() => setUnit(unit === "F" ? "C" : "F")}
          title={`Switch to ${unit === "F" ? "Celsius" : "Fahrenheit"}`}
        >
          °{unit}
        </button>
      </div>
    </header>
  );
};

export default Header;
