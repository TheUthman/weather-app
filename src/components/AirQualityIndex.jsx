import Icon from "./Icon";
import { isFiniteMeasurement } from "../utils/weatherState";

const getAQILevel = (value) => {
  if (value <= 50) return { level: "Good", color: "#10B981", bg: "#ECFDF5", advice: "Air quality is satisfactory. Enjoy outdoor activities!" };
  if (value <= 100) return { level: "Moderate", color: "#F59E0B", bg: "#FFFBEB", advice: "Sensitive individuals may want to reduce prolonged outdoor exposure." };
  if (value <= 150) return { level: "Unhealthy for sensitive groups", color: "#F97316", bg: "#FFEDD5", advice: "Sensitive groups should limit prolonged outdoor exposure." };
  if (value <= 200) return { level: "Unhealthy", color: "#EF4444", bg: "#FEE2E2", advice: "Consider reducing prolonged or strenuous outdoor activity." };
  if (value <= 300) return { level: "Very unhealthy", color: "#DC2626", bg: "#FEE2E2", advice: "Avoid prolonged outdoor activity where possible." };
  return { level: "Hazardous", color: "#7F1D1D", bg: "#FEE2E2", advice: "Avoid outdoor activity and follow local health guidance." };
};

const formatParticle = (value) =>
  isFiniteMeasurement(value) ? `${Number(value).toFixed(1)} μg/m³` : "—";

const AirQualityIndex = ({ data, loading = false }) => {
  if (loading) {
    return <div className="insight-card-minimalist aqi-card feature-skeleton" aria-label="Air quality loading" />;
  }

  if (!data || !isFiniteMeasurement(data.aqi)) {
    return (
      <div className="insight-card-minimalist aqi-card">
        <div className="insight-card-header">
          <Icon name="wind" size={24} />
          <h3 className="insight-card-title">Air Quality</h3>
        </div>
        <div className="feature-empty">
          <Icon name="info" size={22} />
          <strong>Reading unavailable</strong>
          <p>Air-quality data could not be loaded for this location.</p>
        </div>
      </div>
    );
  }

  const aqi = Math.round(Number(data.aqi));
  const aqiInfo = getAQILevel(aqi);

  return (
    <div className="insight-card-minimalist aqi-card" style={{ borderColor: aqiInfo.color }}>
      <div className="insight-card-header">
        <Icon name="wind" size={24} style={{ color: aqiInfo.color }} />
        <h3 className="insight-card-title">Air Quality</h3>
      </div>
      <div className="insight-card-content">
        <div className="aqi-badge" style={{ "--badge-bg": aqiInfo.bg, color: aqiInfo.color }}>
          <div className="aqi-number">{aqi}</div>
          <div className="aqi-label">{aqiInfo.level}</div>
        </div>
        <div className="aqi-details">
          <div className="aqi-detail-item"><span className="detail-label">PM2.5:</span><span className="detail-value">{formatParticle(data.pm25)}</span></div>
          <div className="aqi-detail-item"><span className="detail-label">PM10:</span><span className="detail-value">{formatParticle(data.pm10)}</span></div>
        </div>
      </div>
      <div className="aqi-advice" style={{ color: aqiInfo.color }}>{aqiInfo.advice}</div>
      <span className="feature-note">Forecast data: Open-Meteo / CAMS</span>
    </div>
  );
};

export default AirQualityIndex;
