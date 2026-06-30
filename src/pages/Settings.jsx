import { useState } from "react";
import Toggle from "../components/Toggle";
import CustomSelect from "../components/CustomSelect";
import { useToast } from "../context/ToastContext";
import "../styles/Settings.css";

const Settings = ({ preferences, setPreferences }) => {
  const [localCity, setLocalCity] = useState(preferences.defaultCity);
  const [loading, setLoading] = useState(false);
  const [clearInput, setClearInput] = useState(false);
  const { addToast } = useToast();

  const unitOptions = [
    { value: "imperial", label: "Fahrenheit (F)" },
    { value: "metric", label: "Celsius (C)" },
  ];

  const themeOptions = [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "auto", label: "Auto (Day/Night)" },
  ];

  const locationOptions = [
    { value: "auto", label: "Auto-detect" },
    { value: "manual", label: "Manual" },
  ];

  const updatePreference = (name, value) => {
    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;
    updatePreference(name, newValue);

    // Toast feedback per setting type
    if (name === "units") {
      const label = value === "metric" ? "Celsius (°C)" : "Fahrenheit (°F)";
      addToast(`Temperature units switched to ${label}`, "info");
    } else if (name === "theme") {
      const label = value.charAt(0).toUpperCase() + value.slice(1);
      addToast(`Theme set to ${label}`, "info");
    } else if (name === "location") {
      const label = value === "auto" ? "Auto-detect" : "Manual";
      addToast(`Location mode: ${label}`, "info");
    }
  };

  const handleSaveCity = () => {
    const trimmed = localCity.trim();
    if (!trimmed) {
      addToast("Please enter a city name", "warning");
      return;
    }

    updatePreference("defaultCity", trimmed);
    setLoading(true);
    addToast(`Default city updated to ${trimmed}`, "success");
    setTimeout(() => {
      setLoading(false);
      setClearInput(true);
    }, 1000);
  };

  const handleToggleNotifications = () => {
    const next = !preferences.notifications;
    updatePreference("notifications", next);
    addToast(
      next ? "Push notifications enabled" : "Push notifications disabled",
      "info"
    );
  };

  return (
    <div className="settings-page page-container">
      <header className="settings-header">
        <span>Preferences</span>
        <h1>Settings</h1>
      </header>

      <div className="settings-container">
        <section className="settings-group">
          <h2>Display</h2>
          <div className="setting-row">
            <div className="setting-info">
              <label htmlFor="units">Temperature units</label>
              <span className="setting-description">Choose the unit used across forecasts.</span>
            </div>
            <div className="setting-control">
              <CustomSelect
                name="units"
                value={preferences.units}
                onChange={handleChange}
                options={unitOptions}
              />
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-info">
              <label htmlFor="theme">Theme</label>
              <span className="setting-description">Use your system theme, set one manually, or follow sunrise/sunset times.</span>
            </div>
            <div className="setting-control">
              <CustomSelect
                name="theme"
                value={preferences.theme}
                onChange={handleChange}
                options={themeOptions}
              />
            </div>
          </div>
        </section>

        <section className="settings-group">
          <h2>Location</h2>
          <div className="setting-row">
            <div className="setting-info">
              <label htmlFor="location">Detection mode</label>
              <span className="setting-description">Let the browser detect your location or use a default city.</span>
            </div>
            <div className="setting-control">
              <CustomSelect
                name="location"
                value={preferences.location}
                onChange={handleChange}
                options={locationOptions}
              />
            </div>
          </div>
          {preferences.location === "manual" && (
            <div className="setting-row">
              <div className="setting-info">
                <label htmlFor="defaultCity">Default city</label>
              </div>
              <div className="setting-control">
                <input
                  id="defaultCity"
                  type="text"
                  value={clearInput ? "" : localCity}
                  onChange={(event) => {
                    setLocalCity(event.target.value);
                    setClearInput(false);
                  }}
                  placeholder="e.g. New York"
                  className="city-input"
                />
                <button
                  type="button"
                  className="city-save-btn"
                  onClick={handleSaveCity}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="settings-group">
          <h2>Alerts</h2>
          <div className="setting-row">
            <div className="setting-info">
              <label>Push notifications</label>
              <span className="setting-description">Receive alerts for major weather changes.</span>
            </div>
            <div className="setting-control">
              <Toggle
                isOn={preferences.notifications}
                onClick={handleToggleNotifications}
              />
            </div>
          </div>
        </section>

        <div className="about-section">
          <img
            src="/WRLogo.png"
            alt="Weather Radar Logo"
            className="about-logo"
          />
          <h3 className="about-title">Weather Radar</h3>
          <p className="about-version">Version 1.0.0</p>
          <p className="about-copyright">Copyright 2026 Weather Radar Inc.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
