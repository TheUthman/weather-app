import { useState } from "react";
import Toggle from "../components/Toggle";
import CustomSelect from "../components/CustomSelect";
import "../styles/Settings.css";

const Settings = ({ preferences, setPreferences }) => {
  const [localCity, setLocalCity] = useState(preferences.defaultCity);

  const unitOptions = [
    { value: "imperial", label: "Fahrenheit (F)" },
    { value: "metric", label: "Celsius (C)" },
  ];

  const themeOptions = [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];

  const locationOptions = [
    { value: "auto", label: "Auto-detect" },
    { value: "manual", label: "Manual" },
  ];

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    updatePreference(name, type === "checkbox" ? checked : value);
  };

  const updatePreference = (name, value) => {
    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
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
              <span className="setting-description">Use your system theme or set one manually.</span>
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
                  value={localCity}
                  onChange={(event) => setLocalCity(event.target.value)}
                  onBlur={() => updatePreference("defaultCity", localCity)}
                  placeholder="e.g. New York"
                  className="city-input"
                />
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
                onClick={() =>
                  updatePreference("notifications", !preferences.notifications)
                }
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
