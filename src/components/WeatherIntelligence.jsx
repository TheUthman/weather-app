import { memo } from "react";
import SevereWeatherAlerts from "./SevereWeatherAlerts";
import WeatherChangeTimeline from "./WeatherChangeTimeline";
import ActivityPlanner from "./ActivityPlanner";
import NextHourRain from "./NextHourRain";
import HistoricalComparison from "./HistoricalComparison";

const WeatherIntelligence = ({
  alerts,
  hourly,
  nextHourRain,
  historicalComparison,
  today,
  unit,
  loading,
  loadingHistorical,
}) => (
  <div className="weather-intelligence">
    <SevereWeatherAlerts alerts={alerts} loading={loading} unit={unit} />
    <section className="weather-intelligence-section" aria-labelledby="weather-intelligence-title">
      <div className="intelligence-section-heading">
        <div>
          <span className="feature-kicker">Decision-ready forecast</span>
          <h2 id="weather-intelligence-title">Plan around the weather</h2>
        </div>
        <span>Next hour to seasonal context</span>
      </div>
      <div className="weather-intelligence-grid">
        <WeatherChangeTimeline hourly={hourly} unit={unit} />
        <NextHourRain data={nextHourRain} />
        <ActivityPlanner hourly={hourly} />
        <HistoricalComparison
          data={historicalComparison}
          today={today}
          unit={unit}
          loading={loadingHistorical}
        />
      </div>
    </section>
  </div>
);

export default memo(WeatherIntelligence);
