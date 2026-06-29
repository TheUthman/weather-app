import { useEffect, useState } from 'react'
import { MdTipsAndUpdates } from "react-icons/md";

const tipsMap = {
  "freezing drizzle and freezing fog": [
    "🧊 Freezing drizzle & fog create extremely slippery surfaces. Avoid driving if possible, walk carefully on untreated surfaces, and keep a safe distance from other vehicles.",
    "🚗 If you must travel, reduce your speed, avoid sudden braking, and leave plenty of room between you and the vehicle ahead.",
    "🥾 Wear footwear with good grip and watch for black ice on sidewalks, bridges, and parking lots."
  ],
  
  "snow and blowing snow": [
    "❄️ Snow & blowing snow significantly reduce visibility. Stay indoors if possible; if driving, use low beams, reduce speed, and keep an emergency kit in your vehicle.",
    "🧤 Dress in warm layers, cover exposed skin, and limit time outdoors to prevent cold-related illnesses.",
    "🚘 Clear snow from your vehicle before driving and keep extra blankets, water, and a flashlight in your car."
  ],
  
  "heavy rain and strong wind": [
    "🌧️ Heavy rain & strong winds can cause flooding and flying debris. Avoid low-lying areas, secure outdoor objects, and postpone travel until conditions improve.",
    "🌊 Never drive through flooded roads—just a small amount of moving water can sweep a vehicle away.",
    "🌳 Stay away from trees, power lines, and loose structures that could be damaged by strong winds."
  ],
  
  windy: [
    "💨 Strong winds can knock down tree limbs and unsecured objects. Stay away from windows, secure outdoor furniture, and be cautious when driving high-profile vehicles.",
    "🎩 Wear fitted clothing and secure hats or loose accessories before heading outside.",
    "🚴 Be extra cautious when cycling or riding motorcycles, as strong gusts can affect balance."
  ],
  
  foggy: [
    "🌫️ Fog reduces visibility to dangerous levels. Use low-beam headlights, reduce your speed significantly, and increase your following distance.",
    "🚶 Wear bright or reflective clothing if walking near roads so drivers can see you more easily.",
    "🚦 Avoid using high beams—they reflect off the fog and make visibility even worse."
  ],
  
  "mostly cloudy": [
    "☁️ Mostly cloudy skies with no precipitation expected. A good day for outdoor plans, though you might want to keep a light jacket handy.",
    "🧥 Temperatures may feel cooler than expected—dress in layers for comfort.",
    "🌤️ Keep an umbrella nearby just in case conditions change later in the day."
  ],
  
  "partly cloudy": [
    "⛅ Partly cloudy skies—a pleasant day ahead! Perfect for outdoor activities, just keep an eye on the sky for any changes.",
    "🧴 UV rays can still be strong through scattered clouds, so sunscreen is a good idea.",
    "🚶 Great weather for a walk or exercise outdoors without excessive heat."
  ],
  
  cloudy: [
    "☁️ Cloudy conditions but no precipitation expected. Dress in layers and enjoy the mild weather.",
    "🌡️ Cloud cover can keep temperatures comfortable for outdoor activities.",
    "🧥 A light jacket may come in handy, especially during the morning or evening."
  ],
  
  rain: [
    "🌧️ Rain expected today. Carry an umbrella, allow extra travel time, and be cautious of wet roads—braking distances double on slick surfaces.",
    "👟 Wear waterproof shoes or boots to keep your feet dry during outdoor activities.",
    "⚠️ Watch for puddles that may hide potholes or uneven surfaces."
  ],
  
  "partly sunny": [
    "⛅ Partly sunny with a mix of clouds and sun. A good day to get outside—don't forget sunscreen even when it's partly cloudy!",
    "🕶️ Sunglasses can help reduce glare during brighter periods of the day.",
    "🚴 Comfortable weather for outdoor exercise—remember to stay hydrated."
  ],
  
  "mostly sunny": [
    "🌤️ Mostly sunny skies ahead! Great weather for outdoor plans—stay hydrated and wear sun protection.",
    "🧢 Wear a hat and light-colored clothing to stay cool in the sun.",
    "💧 Take regular water breaks if you're spending extended time outdoors."
  ],
  
  sunny: [
    "☀️ Sunny and bright conditions. Protect yourself with SPF 30+ sunscreen, wear sunglasses, stay hydrated, and limit direct sun exposure between 10AM–4PM.",
    "🌡️ Keep a reusable water bottle with you to stay hydrated throughout the day.",
    "😎 Seek shade during the hottest part of the afternoon to avoid overheating."
  ],
  
  clear: [
    "🌙 Clear skies ahead! Perfect weather for stargazing tonight or enjoying outdoor activities. Don't forget sun protection during the day.",
    "🌌 Excellent visibility makes tonight ideal for spotting stars, planets, or the moon.",
    "🌅 Mornings and evenings may be cooler under clear skies, so consider bringing a light jacket."
  ]
};
const colors = {
  hot: {
    background:"#FEF3C7",
    border: "#D97706",
    icon: "#D97706",
    text:"#78350F"
  },
  cold: {
    background:"#E0F2FE",
    border: "#0284C7",
    icon: "#0284C7",
    text:"#1E3A8A"
  },
  night: {
    background:"#E0E7FF",
    border:"#4F46E5",
    icon: "#4F46E5",
    text: "#312E81"
  }
}

const getTipCategory = (condition) => {
  if (condition.includes("freezing drizzle") || condition.includes("freezing fog")) return "Safety";
  if (condition.includes("snow")) return "Safety";
  if (condition.includes("rain") || condition.includes("drizzle")) return "Safety";
  if (condition.includes("wind")) return "Safety";
  if (condition.includes("fog")) return "Safety";
  if (condition.includes("thunderstorm")) return "Safety";
  if (condition.includes("cloudy") || condition.includes("overcast")) return "Comfort";
  if (condition.includes("sunny") || condition.includes("clear")) return "Health";
  return "General";
};

const getCategoryColor = (category) => {
  const categoryColors = {
    Safety: { 
      bg: "#FEE2E2", 
      text: "#991B1B", 
      icon: "⚠️",
      border: "#DC2626",
      cardIcon: "#DC2626"
    },
    Health: { 
      bg: "#DBEAFE", 
      text: "#1E40AF", 
      icon: "❤️",
      border: "#0284C7",
      cardIcon: "#0284C7"
    },
    Comfort: { 
      bg: "#F3E8FF", 
      text: "#581C87", 
      icon: "😊",
      border: "#9333EA",
      cardIcon: "#9333EA"
    },
    General: { 
      bg: "#F0FDF4", 
      text: "#166534", 
      icon: "💡",
      border: "#16A34A",
      cardIcon: "#16A34A"
    }
  };
  return categoryColors[category] || categoryColors.General;
};

const Tips = ({ data }) => {
  const [tipIndex, setTipIndex] = useState(0);

  const tips = (() => {
    if (!data) return [];

    const condition = data.toLowerCase().trim();

    if (tipsMap[condition]) return tipsMap[condition];

    if (
      condition.includes("freezing drizzle") ||
      condition.includes("freezing fog")
    )
      return tipsMap["freezing drizzle and freezing fog"];

    if (condition.includes("snow"))
      return tipsMap["snow and blowing snow"];

    if (condition.includes("rain") || condition.includes("drizzle"))
      return tipsMap["rain"];

    if (condition.includes("fog"))
      return tipsMap["foggy"];

    if (condition.includes("wind"))
      return tipsMap["windy"];

    if (condition.includes("mostly cloudy"))
      return tipsMap["mostly cloudy"];

    if (condition.includes("partly cloudy"))
      return tipsMap["partly cloudy"];

    if (condition.includes("cloudy") || condition.includes("overcast"))
      return tipsMap["cloudy"];

    if (condition.includes("mostly sunny"))
      return tipsMap["mostly sunny"];

    if (condition.includes("partly sunny"))
      return tipsMap["partly sunny"];

    if (condition.includes("sunny"))
      return tipsMap["sunny"];

    if (condition.includes("clear"))
      return tipsMap["clear"];

    return ["🌤️ Stay prepared for changing weather conditions."];
  })();

  const tipColor = (() => {
    if (!data) return colors.hot;

    const condition = data.toLowerCase();
    
    if (condition.includes("hot")) return colors.hot;
    if (condition.includes("cold")) return colors.cold;
    if (condition.includes("night")) return colors.night;
    if (condition.includes("cloudy")) return colors.hot;
    if (condition.includes("partly cloudy")) return colors.hot;
    if (condition.includes("rain") || condition.includes("drizzle")) return colors.cold;
    if (condition.includes("windy") || condition.includes("wind")) return colors.cold;
    if (condition.includes("foggy") || condition.includes("fog")) return colors.cold;
    if (condition.includes("sunny")) return colors.hot;
    if (condition.includes("clear")) return colors.night;
    if (condition.includes("thunderstorm")) return colors.cold;
    
    return colors.hot;
  })();

  useEffect(() => {
    if (tips.length <= 1) return;

    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [tips]);

  const message = tips[tipIndex % tips.length];
  const category = getTipCategory(data?.toLowerCase() || "");
  const categoryStyle = getCategoryColor(category);

  return (
    <div className="insight-card-minimalist tips-card" style={{ borderColor: categoryStyle.border }}>
      <div className="tips-header-row">
        <div className="insight-card-header">
          <MdTipsAndUpdates size={24} color={categoryStyle.cardIcon} />
          <h3 className="insight-card-title">Tips</h3>
        </div>
        <div className="tip-category-badge" style={{ backgroundColor: categoryStyle.bg, color: categoryStyle.text }}>
          {category}
        </div>
      </div>
      
      <div className="tips-content-wrapper">
        <div className="tips-animated-icon" style={{ animationDelay: `${tipIndex * 0.1}s` }}>
          {categoryStyle.icon}
        </div>
        <p className="insight-card-content" style={{ color: categoryStyle.text }}>
          {message}
        </p>
      </div>

      {tips.length > 1 && (
        <div className="insight-card-indicator">
          <span className="indicator-text">{tipIndex + 1} of {tips.length}</span>
        </div>
      )}
    </div>
  );
}

export default Tips
