import { FiNavigation, FiSearch, FiSettings } from "react-icons/fi";

const Header = ({
  unit,
  setUnit,
  onOpenSearch,
  onOpenSettings,
  onDetectLocation,
  isDetecting,
}) => {
  return (
    <header className="weather-header">
      <div className="header-copy">
        <span>Weather Radar</span>
        <strong>Live conditions</strong>
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
        <button className="search-nav-btn" onClick={onOpenSearch} aria-label="Search location">
          <FiSearch size={21} />
        </button>
        <button className="settings-btn" onClick={onOpenSettings} aria-label="Open settings">
          <FiSettings size={22} />
        </button>
      </div>
    </header>
  );
};

export default Header;
