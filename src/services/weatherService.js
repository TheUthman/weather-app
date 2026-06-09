const WEATHER_API_KEY = import.meta.env.WEATHER_API_KEY;

export const fetchWeatherData = async (lat, lon) => {
  try {
    const response = await fetch(
         `https://weather.googleapis.com/v1/currentConditions:lookup?key=${WEATHER_API_KEY}&location.latitude=${lat}&location.longitude=${lon}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};