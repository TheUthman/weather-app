import WeatherIcon from "./WeatherIcon";

const HourlyForecast = ({ data, unit }) => {
  const convertTemp = (temp) => {
    if (unit === "C") {
      return Math.round(((temp - 32) * 5) / 9);
    }
    return temp;
  };

  return (
    <section className="hourly-forecast">
      <h2>Hourly Forecast</h2>
      <div className="hourly-scroll">
        {data.map((hour, index) => (
          <div key={index} className="hourly-card">
            <span className="hourly-time">{hour.time}</span>
            <WeatherIcon iconName={hour.icon} size={32} />
            <span className="hourly-temp">{convertTemp(hour.temp)}°</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HourlyForecast;
