import { useState, useEffect } from "react";
import Weather from "./pages/Weather";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import "./App.css";

const App = () => {
  const [activePage, setActivePage] = useState("weather");
  const [preferences, setPreferences] = useState(() => {
    // Initialize preferences from localStorage or default values
    try {
      const storedPrefs = localStorage.getItem("weatherAppPreferences");
      return storedPrefs
        ? JSON.parse(storedPrefs)
        : {
            units: "imperial",
            theme: "system", // "system", "light", "dark"
            notifications: true,
            location: "auto",
            defaultCity: "San Francisco",
          };
    } catch (error) {
      console.error("Failed to parse preferences from localStorage", error);
      return {
        units: "imperial",
        theme: "system",
        notifications: true,
        location: "auto",
        defaultCity: "San Francisco",
      };
    }
  });

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("weatherAppPreferences", JSON.stringify(preferences));
  }, [preferences]);

  // Apply theme class to body
  useEffect(() => {
    const body = document.body;
    body.classList.remove("light", "dark"); // Remove existing theme classes

    if (preferences.theme !== "system") {
      // Only add class if not system default
      body.classList.add(preferences.theme);
    }
  }, [preferences.theme]);

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="app-content">
        {activePage === "weather" ? (
          <Weather preferences={preferences} setActivePage={setActivePage} />
        ) : (
          <Settings preferences={preferences} setPreferences={setPreferences} />
        )}
      </main>
    </div>
  );
};

export default App;
