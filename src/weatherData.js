// src/utils/weatherData.js
export const dummyWeatherData = {
  current: {
    city: "San Francisco",
    temperature: {
      imperial: 65,
      metric: 18,
    },
    description: "Partly Cloudy",
    icon: "cloudy", // e.g., "sunny", "cloudy", "rainy", "stormy", "snowy"
    humidity: 70,
    windSpeed: {
      imperial: 10,
      metric: 16,
    },
  },
  forecast: [
    {
      time: "Now",
      temperature: {
        imperial: 65,
        metric: 18,
      },
      icon: "cloudy",
    },
    {
      time: "3 PM",
      temperature: {
        imperial: 68,
        metric: 20,
      },
      icon: "sunny",
    },
    {
      time: "6 PM",
      temperature: {
        imperial: 62,
        metric: 17,
      },
      icon: "partly-cloudy",
    },
    {
      time: "9 PM",
      temperature: {
        imperial: 58,
        metric: 14,
      },
      icon: "moon",
    },
    {
      time: "Tomorrow",
      temperature: {
        imperial: 60,
        metric: 16,
      },
      icon: "rainy",
    },
    {
      time: "Day After",
      temperature: {
        imperial: 70,
        metric: 21,
      },
      icon: "sunny",
    },
  ],
};

export const getWeatherIcon = (iconName) => {
  switch (iconName) {
    case "sunny":
      return "☀️";
    case "cloudy":
      return "☁️";
    case "partly-cloudy":
      return "⛅";
    case "rainy":
      return "🌧️";
    case "stormy":
      return "⛈️";
    case "snowy":
      return "❄️";
    case "moon":
      return "🌙";
    default:
      return "❓";
  }
};
