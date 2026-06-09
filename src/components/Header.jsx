import { FiSearch, FiSettings } from "react-icons/fi";

const Header = ({ searchQuery, setSearchQuery, unit, setUnit, onOpenSettings }) => {
  return (
    <header className="weather-header">
      <div className="search-container">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="header-actions">
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
