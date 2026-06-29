import React from 'react';
import { MdFavoriteBorder } from 'react-icons/md';

const HealthWellness = ({ temperature = 70, humidity = 50 }) => {
  const getHealthTips = (temp, hum) => {
    const tips = [];
    const color = temp > 80 ? '#F97316' : temp < 32 ? '#0EA5E9' : '#F59E0B';
    const bg = temp > 80 ? '#FFEDD5' : temp < 32 ? '#E0F2FE' : '#FFFBEB';

    if (temp > 85) {
      tips.push({
        icon: '💧',
        text: 'Stay hydrated. Drink 8-10 glasses of water throughout the day.'
      });
      tips.push({
        icon: '🌂',
        text: 'Take regular breaks in shade or indoors to cool down.'
      });
    } else if (temp < 32) {
      tips.push({
        icon: '🧤',
        text: 'Protect extremities with gloves, hat, and scarf to prevent frostbite.'
      });
      tips.push({
        icon: '🔥',
        text: 'Stay warm indoors. Dress in layers when going outside.'
      });
    } else if (temp < 50) {
      tips.push({
        icon: '🧥',
        text: 'Wear layers to maintain body heat in cool weather.'
      });
      tips.push({
        icon: '☕',
        text: 'Stay active to maintain circulation and body warmth.'
      });
    } else {
      tips.push({
        icon: '✨',
        text: 'Comfortable temperature. Great conditions for outdoor activities!'
      });
      tips.push({
        icon: '🚴',
        text: 'Perfect weather for exercise and outdoor sports.'
      });
    }

    if (hum > 70) {
      tips.push({
        icon: '💨',
        text: 'High humidity can make heat feel worse. Ensure good ventilation.'
      });
    } else if (hum < 30) {
      tips.push({
        icon: '🧴',
        text: 'Low humidity can dry skin. Use moisturizer and drink water.'
      });
    }

    return { tips, color, bg };
  };

  const { tips, color, bg } = getHealthTips(temperature, humidity);

  return (
    <div className="insight-card-minimalist wellness-card" style={{ borderColor: color }}>
      <div className="insight-card-header">
        <MdFavoriteBorder size={24} color={color} />
        <h3 className="insight-card-title">Health Tips</h3>
      </div>
      <div className="insight-card-content wellness-tips">
        {tips.map((tip, index) => (
          <div key={index} className="wellness-tip">
            <span className="wellness-icon">{tip.icon}</span>
            <span className="wellness-text">{tip.text}</span>
          </div>
        ))}
      </div>
      <div className="wellness-meter">
        <div className="wellness-label">Temperature:</div>
        <div className="wellness-value" style={{ color: color }}>{temperature}°F</div>
      </div>
    </div>
  );
};

export default HealthWellness;
