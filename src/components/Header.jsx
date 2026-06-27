/* eslint-disable react-hooks/purity */
import { useEffect, useMemo, useState } from "react";
import { FiNavigation } from "react-icons/fi";

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
const Header = ({
  unit,
  setUnit,
  onDetectLocation,
  isDetecting,
  data,
}) => {
  const [tipIndex, setTipIndex] = useState(0);

const tips = useMemo(() => {
  if (!data) return [];

  const condition = data.toLowerCase().trim();

  // Your existing matching logic...
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
}, [data]);

// Rotate every 5 seconds
useEffect(() => {
  if (tips.length <= 1) return;

  const interval = setInterval(() => {
    setTipIndex((prev) => (prev + 1) % tips.length);
  }, 10000);

  return () => clearInterval(interval);
}, [tips]);

const message = tips[tipIndex % tips.length];
  return (
    <header className="weather-header">
      <div className="header-copy">
        <span>Weather Radar</span>
        <strong>Live conditions</strong>
      </div>
      <div className="conditions-message">
          <p className="message"><span className="tips">Tips: </span>{message}</p>
        </div>
      <div className="header-actions">
        <button
          className={`icon-btn ${isDetecting ? "detecting" : ""}`}
          onClick={onDetectLocation}
          title="Detect my location"
          aria-label="Detect my location"
          disabled={isDetecting}
        >
          <FiNavigation size={20} />
        </button>
        <button
          className="unit-toggle"
          onClick={() => setUnit(unit === "F" ? "C" : "F")}
          aria-label={`Switch to ${unit === "F" ? "Celsius" : "Fahrenheit"}`}
        >
          °{unit}
        </button>
      </div>
    </header>
  );
};

export default Header;
