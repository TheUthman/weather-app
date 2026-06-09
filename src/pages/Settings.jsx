import { useState } from "react";
import { FiArrowLeft, FiBell, FiMoon, FiSun, FiGlobe, FiSmartphone, FiCloud } from "react-icons/fi";
import { WiCelsius, WiFahrenheit } from "react-icons/wi";
import Toggle from "../components/Toggle";

const Settings = ({ onClose, preferences, setPreferences }) => {
  const [localPrefs, setLocalPrefs] = useState(preferences || {
    units: "imperial",
    theme: "system",
    notifications: true,
    location: "auto",
    defaultCity: "San Francisco",
  });

  const handleChange = (key, value) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }));
    if (setPreferences) {
      setPreferences(prev => ({ ...prev, [key]: value }));
    }
  };

  const settingSections = [
    {
      title: "Units",
      items: [
        {
          icon: localPrefs.units === "metric" ? <WiCelsius size={24} /> : <WiFahrenheit size={24} />,
          label: "Temperature",
          value: localPrefs.units === "metric" ? "Celsius" : "Fahrenheit",
          action: () => handleChange("units", localPrefs.units === "metric" ? "imperial" : "metric"),
          isToggle: true,
          isOn: localPrefs.units === "metric",
        },
      ],
    },
    {
      title: "Appearance",
      items: [
        {
          icon: localPrefs.theme === "dark" ? <FiMoon size={20} /> : localPrefs.theme === "light" ? <FiSun size={20} /> : <FiSmartphone size={20} />,
          label: "Theme",
          value: localPrefs.theme === "system" ? "System" : localPrefs.theme === "light" ? "Light" : "Dark",
          action: () => {
            const themes = ["system", "light", "dark"];
            const currentIndex = themes.indexOf(localPrefs.theme);
            handleChange("theme", themes[(currentIndex + 1) % 3]);
          },
          isToggle: false,
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          icon: <FiBell size={20} />,
          label: "Weather Alerts",
          value: localPrefs.notifications ? "On" : "Off",
          action: () => handleChange("notifications", !localPrefs.notifications),
          isToggle: true,
          isOn: localPrefs.notifications,
        },
      ],
    },
    {
      title: "Location",
      items: [
        {
          icon: <FiGlobe size={20} />,
          label: "Default City",
          value: localPrefs.defaultCity,
          isInput: true,
          onChange: (e) => handleChange("defaultCity", e.target.value),
        },
        {
          icon: <FiCloud size={20} />,
          label: "Auto-detect Location",
          value: localPrefs.location === "auto" ? "On" : "Off",
          action: () => handleChange("location", localPrefs.location === "auto" ? "manual" : "auto"),
          isToggle: true,
          isOn: localPrefs.location === "auto",
        },
      ],
    },
  ];

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <header className="settings-header">
          <button className="back-btn" onClick={onClose}>
            <FiArrowLeft size={22} />
          </button>
          <h1>Settings</h1>
          <div className="spacer"></div>
        </header>

        <div className="settings-content">
          {settingSections.map((section, idx) => (
            <div key={idx} className="settings-section">
              <h2 className="section-title">{section.title}</h2>
              <div className="settings-list">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="settings-item">
                    <div className="item-icon">{item.icon}</div>
                    <div className="item-content">
                      <span className="item-label">{item.label}</span>
                      {item.isInput ? (
                        <input
                          type="text"
                          value={item.value}
                          onChange={item.onChange}
                          className="item-input"
                        />
                      ) : (
                        <span className="item-value">{item.value}</span>
                      )}
                    </div>
                    {item.isToggle && (
                      <Toggle isOn={item.isOn} onClick={item.action} />
                    )}
                    {item.isInput && (
                      <button className="chevron-btn">
                        <span>›</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="settings-footer">
          <p className="version">Weather App v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
