const mockWeather = {
  location: "San Francisco, CA",
  current: {
    temp: 72,
    feelsLike: 70,
    condition: "Partly Cloudy",
    icon: "partly-cloudy",
    humidity: 65,
    windSpeed: 12,
    pressure: 30.1,
    uvIndex: 6,
    visibility: 10,
    sunrise: "6:24 AM",
    sunset: "8:05 PM",
  },
  hourly: [
    { time: "Now", temp: 72, icon: "partly-cloudy" },
    { time: "1 PM", temp: 74, icon: "sunny" },
    { time: "2 PM", temp: 76, icon: "sunny" },
    { time: "3 PM", temp: 77, icon: "sunny" },
    { time: "4 PM", temp: 76, icon: "partly-cloudy" },
    { time: "5 PM", temp: 74, icon: "partly-cloudy" },
    { time: "6 PM", temp: 72, icon: "cloudy" },
    { time: "7 PM", temp: 70, icon: "night-cloudy" },
    { time: "8 PM", temp: 68, icon: "night-clear" },
    { time: "9 PM", temp: 66, icon: "night-clear" },
  ],
  daily: [
    { day: "Today", high: 77, low: 58, icon: "partly-cloudy", condition: "Partly Cloudy", precip: 0 },
    { day: "Tue", high: 79, low: 60, icon: "sunny", condition: "Sunny", precip: 0 },
    { day: "Wed", high: 75, low: 57, icon: "cloudy", condition: "Overcast", precip: 10 },
    { day: "Thu", high: 68, low: 55, icon: "rain", condition: "Light Rain", precip: 60 },
    { day: "Fri", high: 65, low: 52, icon: "rain", condition: "Rainy", precip: 80 },
    { day: "Sat", high: 70, low: 54, icon: "partly-cloudy", condition: "Partly Cloudy", precip: 20 },
    { day: "Sun", high: 74, low: 58, icon: "sunny", condition: "Sunny", precip: 0 },
  ],
};

export default mockWeather;
