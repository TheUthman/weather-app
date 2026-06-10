const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export const fetchWeatherData = async (lat, lng) => {
  try {
    const response = await fetch(
         `/weather-api/v1/currentConditions:lookup?key=${WEATHER_API_KEY}&location.latitude=${lat}&location.longitude=${lng}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

export const fetchDaysWeather = async(lat , lng) => {
  try {
    const response = await fetch(
      `/weather-api/v1/forecast/days:lookup?location.latitude=${lat}&location.longitude=${lng}&days=10&key=${WEATHER_API_KEY}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching days weather data:', error);
    throw error;
  }
};

export const fetchHourlyWeather = async(lat , lng) => {
  try {
    const response = await fetch(
      `/weather-api/v1/forecast/hours:lookup?key=${WEATHER_API_KEY}&location.latitude=${lat}&location.longitude=${lng}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching hourly weather data:', error);
    throw error;
  }
};