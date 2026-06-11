/* eslint-disable no-unused-vars */
// src/pages/Settings.jsx
import React, { useState, useEffect } from "react";
import Toggle from "../components/Toggle";
import "./Settings.css";

const Settings = ({ preferences, setPreferences }) => {
  const [localCity, setLocalCity] = useState(preferences.defaultCity);

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
              <select
                id="units"
                name="units"
                value={preferences.units}
                onChange={handleChange}
              >
                <option value="imperial">Fahrenheit (°F)</option>
                <option value="metric">Celsius (°C)</option>
              </select>
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
              <select
                id="theme"
                name="theme"
                value={preferences.theme}
                onChange={handleChange}
              >
                <option value="system">System Default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
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
              <select
                id="location"
                name="location"
                value={preferences.location}
                onChange={handleChange}
              >
                <option value="auto">Auto-detect</option>
                <option value="manual">Manual</option>
              </select>
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
      </div>
    </div>
  );
};

export default Settings;
