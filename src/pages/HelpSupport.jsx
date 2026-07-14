import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { weatherExplanations } from "../data/weatherExplanations";

const HelpSupport = () => (
  <div className="help-page page-container">
    <header className="help-hero glass-page-hero">
      <div>
        <span className="page-eyebrow">Help &amp; support</span>
        <h1>Understand your forecast</h1>
        <p className="page-description">Simple explanations for the weather data shown throughout the app.</p>
      </div>
      <div className="help-hero-icon" aria-hidden="true"><Icon name="info" size={32} /></div>
    </header>

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

    <section className="help-section" aria-labelledby="forecast-guide-title">
      <div className="help-section-heading">
        <span className="settings-group-kicker">Using the forecast</span>
        <h2 id="forecast-guide-title">Hourly and daily views</h2>
      </div>
      <div className="help-guide-grid">
        <article><Icon name="time" size={24} /><h3>Hourly forecast</h3><p>Plan the next few hours and see when conditions may change.</p></article>
        <article><Icon name="sunrise" size={24} /><h3>Daily forecast</h3><p>See the overall outlook, including each day’s low and high temperature.</p></article>
        <article><Icon name="lightbulb" size={24} /><h3>Daily briefing</h3><p>Find quick tips, health guidance, air quality, UV information, and weather explanations.</p></article>
      </div>
    </section>

    <section className="help-support-panel">
      <div>
        <span className="settings-group-kicker">Need a reset?</span>
        <h2>Review your app preferences</h2>
        <p>Change units, location, visual style, color mode, or component opacity at any time.</p>
      </div>
      <Link to="/settings" className="help-primary-link">Open settings <Icon name="chevronRight" size={17} /></Link>
    </section>
  </div>
);

export default HelpSupport;

