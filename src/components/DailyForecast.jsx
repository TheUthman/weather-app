import WeatherIcon from "./WeatherIcon";

const DailyForecast = ({ data, unit }) => {
  const convertTemp = (temp) => {
    if (unit === "C") {
      return Math.round(((temp - 32) * 5) / 9);
    }
    return temp;
  };

  return (
    <section className="daily-forecast">
      <h2>7-Day Forecast</h2>
      <div className="daily-list">
        {data.map((day, index) => (
          <div key={index} className="daily-row">
            <span className="daily-day">{day.day}</span>
            <div className="daily-condition">
              <WeatherIcon iconName={day.icon} size={28} />
              <span className="daily-condition-text">{day.condition}</span>
            </div>
            <div className="daily-precip">
              {day.precip > 0 && (
                <span className="precip-badge">{day.precip}%</span>
              )}
            </div>
            <div className="daily-temps">
              <span className="daily-high">{convertTemp(day.high)}°</span>
              <span className="daily-low">{convertTemp(day.low)}°</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DailyForecast;
