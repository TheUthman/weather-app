import { WiDaySunny, WiNightClear, WiDayCloudy, WiNightCloudy, WiCloud, WiRain, WiSnow, WiThunderstorm } from "react-icons/wi";

const WeatherIcon = ({ iconName, size = 48 }) => {
  const icons = {
    "sunny": <WiDaySunny size={size} />,
    "night-clear": <WiNightClear size={size} />,
    "partly-cloudy": <WiDayCloudy size={size} />,
    "night-cloudy": <WiNightCloudy size={size} />,
    "cloudy": <WiCloud size={size} />,
    "rain": <WiRain size={size} />,
    "snow": <WiSnow size={size} />,
    "thunderstorm": <WiThunderstorm size={size} />,
  };
  return icons[iconName] || <WiDaySunny size={size} />;
};

export default WeatherIcon;
