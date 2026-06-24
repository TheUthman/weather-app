/* eslint-disable no-unused-vars */
// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import Toggle from "../components/Toggle";
import CustomSelect from "../components/CustomSelect";
import "../styles/Settings.css";

const Settings = ({ preferences, setPreferences }) => {
  const [localCity, setLocalCity] = useState(preferences.defaultCity);

  const unitOptions = [
    { value: "imperial", label: "Fahrenheit (°F)" },
    { value: "metric", label: "Celsius (°C)" },
  ];

  const themeOptions = [
    { value: "system", label: "System Default" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];

  const locationOptions = [
    { value: "auto", label: "Auto-detect" },
    { value: "manual", label: "Manual" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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
        <h1>Settings</h1>
      </header>

      <div className="settings-container">
        <section className="settings-group">
          <h2>Unit Configuration</h2>
          <div className="setting-row">
            <div className="setting-info">
              <label htmlFor="units">Temperature Units</label>
              <span className="setting-description">
                Choose between Celsius and Fahrenheit for global display
              </span>
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
        </section>

        <section className="settings-group">
          <h2>Appearance</h2>
          <div className="setting-row">
            <div className="setting-info">
              <label htmlFor="theme">Application Theme</label>
              <span className="setting-description">
                Personalize your view with Light, Dark, or Adaptive modes
              </span>
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
          <h2>System</h2>
          <div className="setting-row">
            <div className="setting-info">
              <label>Push Notifications</label>
              <span className="setting-description">
                Receive real-time alerts for severe weather changes
              </span>
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

        <section className="settings-group">
          <h2>Location Settings</h2>
          <div className="setting-row">
            <div className="setting-info">
              <label htmlFor="location">Detection Mode</label>
              <span className="setting-description">
                Define how the app identifies your current geographical location
              </span>
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
                <label htmlFor="defaultCity">Default City</label>
              </div>
              <div className="setting-control">
                <input
                  type="text"
                  value={localCity}
                  onChange={(e) => setLocalCity(e.target.value)}
                  onBlur={() => updatePreference("defaultCity", localCity)}
                  placeholder="e.g., New York"
                  className="city-input"
                />
              </div>
            </div>
          )}
        </section>

        <div className="about-section">
          <img
            src="/WRLogo.png"
            alt="Weather Radar Logo"
            className="about-logo"
          />
          <h3 className="about-title">Weather Radar</h3>
          <p className="about-version">Version 1.0.0</p>
          <p className="about-copyright">© 2026 Weather Radar Inc.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
