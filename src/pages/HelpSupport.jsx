import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { weatherExplanations } from "../data/weatherExplanations";

const featureGuides = [
  { icon: "cloud", title: "Current conditions", detail: "See the live temperature, feels-like temperature, condition, humidity, wind, pressure, visibility, dew point, sunrise, and sunset for the open location." },
  { icon: "time", title: "Interactive weather dial", detail: "Explore the next 12 hours around the dial. Its temperature, rain, and wind summaries make changes through the day easier to spot." },
  { icon: "time", title: "Clickable hourly forecast", detail: "Select any hourly card to open that hour's full forecast. The summary and readings update with temperature, feels like, rain, humidity, wind and gusts, UV, visibility, clouds, pressure, and dew point." },
  { icon: "barometer", title: "Hourly charts", detail: "Switch between Temperature, Rain, and Wind above the hourly chart. The highlighted point follows the hour you selected." },
  { icon: "sunrise", title: "10-day forecast", detail: "Review each day's condition, low and high temperature, rain chance, expected rain, peak wind gust, and maximum UV index." },
  { icon: "alertTriangle", title: "Forecast alerts", detail: "See forecast-based signals for severe heat, rain, wind, or thunderstorms. These are planning aids and are not official emergency warnings." },
  { icon: "time", title: "Weather change timeline", detail: "Scan the most important condition and temperature changes expected during the next 12 hours." },
  { icon: "cloudRain", title: "Next-hour rain", detail: "Check the estimated chance of rain in four 15-minute steps so you can time a short trip or outdoor task." },
  { icon: "compass", title: "Activity planner", detail: "Find the most suitable upcoming hour for outdoor plans, running, cycling, or drying laundry." },
  { icon: "barometer", title: "Historical comparison", detail: "Compare today's forecast with typical conditions for the same time of year across recent years." },
  { icon: "lightbulb", title: "Daily briefing", detail: "Swipe or use the arrow buttons to browse practical weather tips, outfit advice, air quality, UV safety, health guidance, and plain-language weather explanations." },
  { icon: "search", title: "Location search", detail: "Search worldwide by city, region, or country. Live suggestions open the exact forecast location, and up to eight favorites can be saved for quick access." },
  { icon: "navigation", title: "Use my location", detail: "Choose the navigation button in the weather header to request your device location and load the local forecast." },
  { icon: "sun", title: "Units and favorites", detail: "Use the °C/°F control to switch units instantly. Use the star to add or remove the current forecast from saved locations." },
  { icon: "settings", title: "Appearance and location settings", detail: "Choose an animated sky or weather film, automatic/light/dark color mode, card opacity, units, automatic or manual location, and a default city." },
  { icon: "alertCircle", title: "Freshness and offline fallback", detail: "Live, updating, cached, and unavailable labels show the forecast state. If a refresh fails, the last saved forecast remains available with a retry option." },
];

const HelpSupport = () => (
  <div className="help-page page-container">
    <header className="help-hero glass-page-hero">
      <div>
        <span className="page-eyebrow">Help &amp; support</span>
        <h1>Get more from every forecast</h1>
        <p className="page-description">A complete guide to finding locations, reading conditions, planning activities, and personalizing Weather Radar.</p>
      </div>
      <div className="help-hero-icon" aria-hidden="true"><Icon name="info" size={32} /></div>
    </header>

    <section className="help-section" aria-labelledby="quick-start-title">
      <div className="help-section-heading">
        <span className="settings-group-kicker">Quick start</span>
        <h2 id="quick-start-title">Your forecast in three steps</h2>
      </div>
      <ol className="help-step-list">
        <li><strong>Choose a place.</strong><span>Search for a location, use your device location, or open a saved favorite.</span></li>
        <li><strong>Scan what matters.</strong><span>Start with current conditions, alerts, and the planning cards for a quick decision.</span></li>
        <li><strong>Explore an hour.</strong><span>Select any hourly card to replace the detail panel with that hour's complete forecast.</span></li>
      </ol>
    </section>

    <section className="help-section" aria-labelledby="feature-guide-title">
      <div className="help-section-heading">
        <span className="settings-group-kicker">Feature guide</span>
        <h2 id="feature-guide-title">Everything you can do</h2>
      </div>
      <div className="help-guide-grid">
        {featureGuides.map((feature) => (
          <article key={feature.title}><Icon name={feature.icon} size={24} /><h3>{feature.title}</h3><p>{feature.detail}</p></article>
        ))}
      </div>
    </section>

    <section className="help-section" aria-labelledby="weather-data-title">
      <div className="help-section-heading">
        <span className="settings-group-kicker">Weather data</span>
        <h2 id="weather-data-title">What each reading means</h2>
      </div>
      <div className="help-definition-grid">
        {weatherExplanations.map((item) => (
          <article className="help-definition-card" key={item.term}>
            <span className="help-definition-icon"><Icon name={item.icon} size={22} /></span>
            <div><h3>{item.term}</h3><p>{item.detail}</p></div>
          </article>
        ))}
      </div>
    </section>

    <section className="help-section" aria-labelledby="tips-title">
      <div className="help-section-heading">
        <span className="settings-group-kicker">Good to know</span>
        <h2 id="tips-title">Using forecasts responsibly</h2>
      </div>
      <div className="help-guide-grid">
        <article><Icon name="info" size={24} /><h3>Forecasts can change</h3><p>Refresh before time-sensitive plans. Hourly and daily values are estimates and may shift as new observations arrive.</p></article>
        <article><Icon name="alertTriangle" size={24} /><h3>Check official warnings</h3><p>For dangerous weather, follow your national or local weather authority and emergency services.</p></article>
        <article><Icon name="settings" size={24} /><h3>Preferences are remembered</h3><p>Your display choices, default location, sidebar state, and saved favorites are stored on this device.</p></article>
      </div>
    </section>

    <section className="help-support-panel">
      <div>
        <span className="settings-group-kicker">Make it yours</span>
        <h2>Review your app preferences</h2>
        <p>Change units, location, visual style, color mode, notifications, or component opacity at any time.</p>
      </div>
      <Link to="/settings" className="help-primary-link">Open settings <Icon name="chevronRight" size={17} /></Link>
    </section>
  </div>
);

export default HelpSupport;
