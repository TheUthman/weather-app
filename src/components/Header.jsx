import { FiSettings, FiNavigation } from "react-icons/fi";

const Header = ({
  unit,
  setUnit,
  onOpenSettings,
  onDetectLocation,
  isDetecting,
}) => {
  return (
    <header className="weather-header">
      <div className="header-actions">
        <button
          className={`icon-btn ${isDetecting ? "detecting" : ""}`}
          onClick={onDetectLocation}
          title="Detect My Location"
          disabled={isDetecting}
        >
          <FiNavigation
            size={20}
            className={isDetecting ? "spin-detect" : ""}
          />
        </button>
        <button
          className="unit-toggle"
          onClick={() => setUnit(unit === "F" ? "C" : "F")}
        >
          °{unit}
        </button>
        <button className="settings-btn" onClick={onOpenSettings}>
          <FiSettings size={22} />
        </button>
      </div>
    </header>
  );
};

export default Header;
