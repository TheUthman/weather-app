import React from 'react';
import { FaWind } from 'react-icons/fa';

const AirQualityIndex = ({ aqi = 50, pm25 = 15, pm10 = 25 }) => {
  const getAQILevel = (value) => {
    if (value <= 50) return { level: 'Good', color: '#10B981', bg: '#ECFDF5', advice: 'Air quality is satisfactory. Enjoy outdoor activities!' };
    if (value <= 100) return { level: 'Moderate', color: '#F59E0B', bg: '#FFFBEB', advice: 'Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exposure.' };
    if (value <= 150) return { level: 'Unhealthy for Sensitive Groups', color: '#F97316', bg: '#FFEDD5', advice: 'Members of sensitive groups should limit prolonged outdoor exposure.' };
    if (value <= 200) return { level: 'Unhealthy', color: '#EF4444', bg: '#FEE2E2', advice: 'Everyone may begin to experience health effects. Limit outdoor activity.' };
    if (value <= 300) return { level: 'Very Unhealthy', color: '#DC2626', bg: '#FEE2E2', advice: 'Health alert: The risk of health effects is increased for everyone.' };
    return { level: 'Hazardous', color: '#7F1D1D', bg: '#FEE2E2', advice: 'Health warning of emergency conditions: Everyone is more likely to be affected.' };
  };

  const aqiInfo = getAQILevel(aqi);

  return (
    <div className="insight-card-minimalist aqi-card" style={{ borderColor: aqiInfo.color }}>
      <div className="insight-card-header">
        <FaWind size={24} color={aqiInfo.color} />
        <h3 className="insight-card-title">Air Quality</h3>
      </div>
      <div className="insight-card-content">
        <div className="aqi-badge" style={{ backgroundColor: aqiInfo.bg, color: aqiInfo.color }}>
          <div className="aqi-number">{aqi}</div>
          <div className="aqi-label">{aqiInfo.level}</div>
        </div>
        <div className="aqi-details">
          <div className="aqi-detail-item">
            <span className="detail-label">PM2.5:</span>
            <span className="detail-value">{pm25} μg/m³</span>
          </div>
          <div className="aqi-detail-item">
            <span className="detail-label">PM10:</span>
            <span className="detail-value">{pm10} μg/m³</span>
          </div>
        </div>
      </div>
      <div className="aqi-advice" style={{ color: aqiInfo.color }}>
        {aqiInfo.advice}
      </div>
    </div>
  );
};

export default AirQualityIndex;
