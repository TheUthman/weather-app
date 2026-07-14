import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Weather from "./pages/Weather";
import Sidebar from "./components/Sidebar";
import ToastContainer from "./components/Toast";
import { ToastProvider } from "./context/ToastContext";

// Lazy load non-critical pages to improve LCP of the main dashboard
const Settings = lazy(() => import("./pages/Settings"));
const Search = lazy(() => import("./pages/Search"));
const HelpSupport = lazy(() => import("./pages/HelpSupport"));
const SkyLayer = lazy(() => import("./components/SkyLayer"));
const WeatherVideoBackground = lazy(
  () => import("./components/WeatherVideoBackground"),
);
const SpeedInsights = lazy(() =>
  import("@vercel/speed-insights/react").then((mod) => ({
    default: mod.SpeedInsights,
  })),
);
const Analytics = lazy(() =>
  import("@vercel/analytics/react").then((mod) => ({
    default: mod.Analytics,
  })),
);

const AnalyticsAndInsights = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!import.meta.env.PROD) return;

    const run = () => setReady(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run);
      return () => window.cancelIdleCallback?.(id);
    }

    const id = window.setTimeout(run, 1200);
    return () => window.clearTimeout(id);
  }, []);

  if (!ready) return null;

  return (
    <>
      <Suspense fallback={null}>
        <SpeedInsights />
      </Suspense>
      <Suspense fallback={null}>
        <Analytics />
      </Suspense>
    </>
  );
};

const getInitialBackgroundWeather = () => {
  const fallback = {
    daily: [],
    condition: "Clear",
    icon: "sunny",
    cloudCover: 0,
    windSpeed: 0,
    precipitation: 0,
  };

  try {
    const cached = JSON.parse(localStorage.getItem("last_weather_ui_data") || "null");
    const sunrise = localStorage.getItem("weather_sunrise");
    const sunset = localStorage.getItem("weather_sunset");
    const sunriseTime = sunrise ? new Date(sunrise).getTime() : Number.NaN;
    const solarDays =
      sunrise && sunset && Number.isFinite(sunriseTime)
        ? [
            { sunEvents: { sunriseTime: sunrise, sunsetTime: sunset } },
            {
              sunEvents: {
                sunriseTime: new Date(
                  sunriseTime + 24 * 60 * 60 * 1000,
                ).toISOString(),
              },
            },
          ]
        : [];

    return {
      ...fallback,
      daily: solarDays,
      condition: cached?.current?.condition || fallback.condition,
      icon: cached?.current?.icon || fallback.icon,
      cloudCover: cached?.current?.cloudCover || 0,
      windSpeed: cached?.current?.windSpeed || 0,
      precipitation: cached?.current?.precipitation || 0,
    };
  } catch {
    return fallback;
  }
};

const App = () => {
  const [backgroundWeather, setBackgroundWeather] = useState(
    getInitialBackgroundWeather,
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("weatherAppSidebarCollapsed") ?? "false",
      );
    } catch {
      return false;
    }
  });

  const [preferences, setPreferences] = useState(() => {
    // Initialize preferences from localStorage or default values
    try {
      const storedPrefs = localStorage.getItem("weatherAppPreferences");
      if (storedPrefs) {
        const parsed = JSON.parse(storedPrefs);
        return {
          units: parsed.units || "imperial",
          theme: ["light", "dark", "auto"].includes(parsed.theme)
            ? parsed.theme
            : "auto",
          visualStyle:
            parsed.visualStyle === "minimal" ? "minimal" : "classic",
          componentTransparency: Number.isFinite(
            Number(parsed.componentTransparency),
          )
            ? Math.min(100, Math.max(0, Number(parsed.componentTransparency)))
            : 0,
          notifications:
            parsed.notifications !== undefined ? parsed.notifications : true,
          location: parsed.location || "auto",
          defaultCity: parsed.defaultCity || "San Francisco",
        };
      }

      return {
        units: "imperial",
        theme: "auto",
        visualStyle: "classic",
        componentTransparency: 0,
        notifications: true,
        location: "auto",
        defaultCity: "San Francisco",
      };
    } catch (error) {
      console.error("Failed to parse preferences from localStorage", error);
      return {
        units: "imperial",
        theme: "auto",
        visualStyle: "classic",
        componentTransparency: 0,
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

  useEffect(() => {
    localStorage.setItem(
      "weatherAppSidebarCollapsed",
      JSON.stringify(isSidebarCollapsed),
    );
  }, [isSidebarCollapsed]);

  // Determine if it's currently day or night using cached sunrise/sunset
  const getAutoTheme = useCallback(() => {
    const sunrise = localStorage.getItem("weather_sunrise");
    const sunset = localStorage.getItem("weather_sunset");
    if (!sunrise || !sunset) return "dark"; // Fallback to dark if no data

    const now = new Date();
    const sunriseTime = new Date(sunrise);
    const sunsetTime = new Date(sunset);

    if (isNaN(sunriseTime.getTime()) || isNaN(sunsetTime.getTime()))
      return "dark";

    // Daytime: between sunrise and sunset
    return now >= sunriseTime && now < sunsetTime ? "light" : "dark";
  }, []);

  // Apply the selected visual style and light/dark color mode to the document.
  useEffect(() => {
    const body = document.body;
    const colorMode =
      preferences.theme === "auto" ? getAutoTheme() : preferences.theme;

    body.classList.remove(
      "light",
      "dark",
      "theme-style-classic",
      "theme-style-minimal",
    );
    body.classList.add(colorMode, `theme-style-${preferences.visualStyle}`);

    return () => {
      body.classList.remove(
        "theme-style-classic",
        "theme-style-minimal",
      );
    };
  }, [getAutoTheme, preferences.theme, preferences.visualStyle]);

  // Poll for sunrise/sunset transitions every 60s
  useEffect(() => {
    const checkTheme = () => {
      if (preferences.theme !== "auto") return;
      const body = document.body;
      const newTheme = getAutoTheme();
      body.classList.remove("light", "dark");
      body.classList.add(newTheme);
    };

    const interval = setInterval(checkTheme, 60_000);
    return () => clearInterval(interval);
  }, [getAutoTheme, preferences.theme]);

  const handleBackgroundWeather = useCallback((nextWeather) => {
    setBackgroundWeather(nextWeather);
  }, []);

  return (
    <ToastProvider>
      <div
        className={`app-layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
        style={{
          "--component-opacity":
            1 - (preferences.componentTransparency || 0) / 100,
        }}
      >
        <Suspense
          fallback={
            <div
              className={`weather-background-fallback ${getAutoTheme() === "light" ? "fallback-day" : "fallback-night"}`}
              aria-hidden="true"
            />
          }
        >
          {preferences.visualStyle === "minimal" ? (
            <WeatherVideoBackground
              daily={backgroundWeather.daily}
              condition={backgroundWeather.condition}
              icon={backgroundWeather.icon}
            />
          ) : (
            <SkyLayer
              daily={backgroundWeather.daily}
              condition={backgroundWeather.condition}
              cloudCover={backgroundWeather.cloudCover}
              windSpeed={backgroundWeather.windSpeed}
              precipitation={backgroundWeather.precipitation}
            />
          )}
        </Suspense>
        <Sidebar
          collapsed={isSidebarCollapsed}
          visualStyle={preferences.visualStyle}
          onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
        />
        <main className="app-content">
          <Suspense fallback={<div className="page-loader" />}>
            <Routes>
              <Route
                path="/"
                element={
                  <Weather
                    preferences={preferences}
                    setPreferences={setPreferences}
                    onBackgroundWeather={handleBackgroundWeather}
                  />
                }
              />
              <Route
                path="/settings"
                element={
                  <Settings
                    preferences={preferences}
                    setPreferences={setPreferences}
                  />
                }
              />
              <Route path="/search" element={<Search />} />
              <Route path="/help" element={<HelpSupport />} />
            </Routes>
          </Suspense>
        </main>
        <AnalyticsAndInsights />
      </div>
      <ToastContainer />
    </ToastProvider>
  );
};

export default App;
