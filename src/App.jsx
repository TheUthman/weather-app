import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Weather from "./pages/Weather";
import Sidebar from "./components/Sidebar";
import ToastContainer from "./components/Toast";
import { ToastProvider } from "./context/ToastContext";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";

// Lazy load non-critical pages to improve LCP of the main dashboard
const Settings = lazy(() => import("./pages/Settings"));
const Search = lazy(() => import("./pages/Search"));

const App = () => {
  const [preferences, setPreferences] = useState(() => {
    // Initialize preferences from localStorage or default values
    try {
      const storedPrefs = localStorage.getItem("weatherAppPreferences");
      return storedPrefs
        ? JSON.parse(storedPrefs)
        : {
            units: "imperial",
            theme: "auto", // "system", "light", "dark", "auto"
            notifications: true,
            location: "auto",
            defaultCity: "San Francisco",
          };
    } catch (error) {
      console.error("Failed to parse preferences from localStorage", error);
      return {
        units: "imperial",
        theme: "auto",
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

  // Determine if it's currently day or night using cached sunrise/sunset
  const getAutoTheme = useCallback(() => {
    const sunrise = localStorage.getItem("weather_sunrise");
    const sunset = localStorage.getItem("weather_sunset");
    if (!sunrise || !sunset) return "dark"; // Fallback to dark if no data

    const now = new Date();
    const sunriseTime = new Date(sunrise);
    const sunsetTime = new Date(sunset);

    if (isNaN(sunriseTime.getTime()) || isNaN(sunsetTime.getTime())) return "dark";

    // Daytime: between sunrise and sunset
    return now >= sunriseTime && now < sunsetTime ? "light" : "dark";
  }, []);

  // Apply theme class to body
  useEffect(() => {
    const body = document.body;
    body.classList.remove("light", "dark");

    let themeClass;

    if (preferences.theme === "auto") {
      themeClass = getAutoTheme();
    } else if (preferences.theme !== "system") {
      themeClass = preferences.theme;
    }

    if (themeClass) {
      body.classList.add(themeClass);
    }
  }, [preferences.theme, getAutoTheme]);

  // Poll for theme changes when in "auto" mode (check every 60s for sunrise/sunset transitions)
  useEffect(() => {
    if (preferences.theme !== "auto") return;

    const checkTheme = () => {
      const body = document.body;
      const newTheme = getAutoTheme();
      body.classList.remove("light", "dark");
      body.classList.add(newTheme);
    };

    const interval = setInterval(checkTheme, 60_000);
    return () => clearInterval(interval);
  }, [preferences.theme, getAutoTheme]);

  return (
    <ToastProvider>
      <div className="app-layout">
        <Sidebar />
        <main className="app-content">
          <Suspense fallback={<div className="page-loader" />}>
            <Routes>
              <Route path="/" element={<Weather preferences={preferences} setPreferences={setPreferences} />} />
              <Route path="/settings" element={<Settings preferences={preferences} setPreferences={setPreferences} />} />
              <Route path="/search" element={<Search />} />
            </Routes>
          </Suspense>
        </main>
        <SpeedInsights />
        <Analytics />
      </div>
      <ToastContainer />
    </ToastProvider>
  );
};

export default App;
