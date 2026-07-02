import { FiNavigation } from "react-icons/fi";

const Header = ({ unit, setUnit, onDetectLocation, isDetecting }) => {
  return (
    <header className="weather-header">
      <div className="header-copy">
        <span>Weather Radar</span>
        <strong>Atmospheric briefing</strong>
      </div>
      <div className="header-actions">
        <button
          className={`icon-btn ${isDetecting ? "detecting" : ""}`}
          onClick={onDetectLocation}
          title="Detect my location"
          aria-label="Detect my location"
          disabled={isDetecting}
        >
          <FiNavigation size={20} />
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
