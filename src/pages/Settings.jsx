import { useMemo, useState } from "react";
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

  const locationOptions = [
    { value: "auto", label: "Auto-detect" },
    { value: "manual", label: "Manual" },
  ];

  const summaryChips = useMemo(
    () => [
      {
        label: "Theme",
        value: "Auto day/night",
      },
      {
        label: "Units",
        value: preferences.units === "metric" ? "Celsius" : "Fahrenheit",
      },
      {
        label: "Location",
        value: preferences.location === "auto" ? "Auto-detect" : "Manual city",
      },
    ],
    [preferences],
  );

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

    if (name === "units") {
      const label = value === "metric" ? "Celsius (°C)" : "Fahrenheit (°F)";
      addToast(`Temperature units switched to ${label}`, "info");
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
      "info",
    );
  };

  return (
    <div className="settings-page page-container">
      <header className="settings-hero glass-page-hero">
        <div className="settings-hero-copy">
          <span className="page-eyebrow">Preferences</span>
          <h1>Shape your weather experience</h1>
          <p className="page-description">
            Tune the app’s look, units, alerts, and default location without
            changing any of the forecasting functionality.
          </p>
        </div>

        <div className="settings-chip-grid">
          {summaryChips.map((chip) => (
            <div key={chip.label} className="settings-summary-chip">
              <span>{chip.label}</span>
              <strong>{chip.value}</strong>
            </div>
          ))}
        </div>
      </header>

      <div className="settings-container">
        <section className="settings-group">
          <div className="settings-group-head">
            <span className="settings-group-kicker">Display</span>
            <h2>Visual preferences</h2>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <label htmlFor="units">Temperature units</label>
              <span className="setting-description">
                Choose the unit used across current conditions and forecasts.
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

          <div className="setting-row">
            <div className="setting-info">
              <label>Sky theme</label>
              <span className="setting-description">
                The app now follows local sunrise and sunset automatically for a
                continuous day-to-night experience.
              </span>
            </div>
            <div className="setting-control">
              <div className="settings-static-value">Auto day/night</div>
            </div>
          </div>
        </section>

        <section className="settings-group">
          <div className="settings-group-head">
            <span className="settings-group-kicker">Location</span>
            <h2>Forecast source</h2>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <label htmlFor="location">Detection mode</label>
              <span className="setting-description">
                Let the browser detect your location or pin the app to one city.
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
            <div className="setting-row setting-row-manual">
              <div className="setting-info">
                <label htmlFor="defaultCity">Default city</label>
                <span className="setting-description">
                  This city will load whenever manual location mode is active.
                </span>
              </div>
              <div className="setting-control setting-control-manual">
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
                  {loading ? "Saving..." : "Save city"}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="settings-group">
          <div className="settings-group-head">
            <span className="settings-group-kicker">Alerts</span>
            <h2>Notifications</h2>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <label>Push notifications</label>
              <span className="setting-description">
                Receive alerts for major weather changes and forecast shifts.
              </span>
            </div>
            <div className="setting-control">
              <Toggle
                isOn={preferences.notifications}
                onClick={handleToggleNotifications}
              />
            </div>
          </div>
        </section>

        <section className="about-section">
          <img
            src="/favicon.svg"
            alt="Weather Radar Logo"
            className="about-logo"
            width="72"
            height="72"
            decoding="async"
            loading="lazy"
          />
          <div className="about-copy">
            <span className="page-eyebrow">About</span>
            <h3 className="about-title">Weather Radar</h3>
            <p className="about-version">Version 1.0.0</p>
            <p className="about-copyright">Copyright 2026 Weather Radar Inc.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
