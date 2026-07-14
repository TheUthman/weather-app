import Icon from "./Icon";

const UVIndex = ({ uvIndex = 5 }) => {
  const getUVInfo = (value) => {
    if (value < 2) return { 
      level: 'Low', 
      color: '#10B981', 
      bg: '#ECFDF5',
      spf: 'SPF 15+',
      advice: 'No protection required. You can safely stay outdoors.'
    };
    if (value < 5) return { 
      level: 'Moderate', 
      color: '#F59E0B', 
      bg: '#FFFBEB',
      spf: 'SPF 30+',
      advice: 'Wear SPF 30+ sunscreen and reapply every 2 hours.'
    };
    if (value < 7) return { 
      level: 'High', 
      color: '#F97316', 
      bg: '#FFEDD5',
      spf: 'SPF 50+',
      advice: 'Seek shade during peak hours (10am-4pm). Wear protective clothing.'
    };
    if (value < 10) return { 
      level: 'Very High', 
      color: '#EF4444', 
      bg: '#FEE2E2',
      spf: 'SPF 50+',
      advice: 'Limit outdoor time. Use SPF 50+, hat, and sunglasses.'
    };
    return { 
      level: 'Extreme', 
      color: '#7F1D1D', 
      bg: '#FEE2E2',
      spf: 'SPF 70+',
      advice: 'Avoid sun exposure. Stay indoors or fully covered.'
    };
  };

  const uvInfo = getUVInfo(uvIndex);

  return (
    <div className="insight-card-minimalist uv-card" style={{ borderColor: uvInfo.color }}>
      <div className="insight-card-header">
        <Icon name="sun" size={24} style={{ color: uvInfo.color }} />
        <h3 className="insight-card-title">UV Index</h3>
      </div>
      <div className="insight-card-content">
        <div
          className="uv-badge"
          style={{ "--badge-bg": uvInfo.bg, color: uvInfo.color }}
        >
          <div className="uv-number">{uvIndex}</div>
          <div className="uv-label">{uvInfo.level}</div>
        </div>
        <div
          className="uv-spf"
          style={{ "--badge-bg": uvInfo.bg, color: uvInfo.color }}
        >
          Recommended: {uvInfo.spf}
        </div>
      </div>
      <div className="uv-advice" style={{ color: uvInfo.color }}>
        {uvInfo.advice}
      </div>
    </div>
  );
};

export default UVIndex;
