import Icon from "./Icon";
import { FiStar } from "react-icons/fi";

const Header = ({
  unit,
  data,
  setUnit,
  onDetectLocation,
  isDetecting,
  onToggleFavorite,
  isFavorite,
  canFavorite,
}) => {
  return (
    <header className="weather-header">
      <div className="header-copy">
        <div className="header-kicker-row">
          <span>Weather Radar</span>
          <span className="weather-status-pill">{data || "Live weather"}</span>
        </div>
        <strong>Live conditions</strong>
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
          aria-label={`Switch to ${unit === "F" ? "Celsius" : "Fahrenheit"}`}
        >
          °{unit}
        </button>
      </div>
    </header>
  );
};

export default Header;
