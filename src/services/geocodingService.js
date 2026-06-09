const WEATHER_API_KEY = import.meta.env.WEATHER_API_KEY;

export const fetchGeocodingData = async (location) => {
  try {
    const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${WEATHER_API_KEY}`
    );
    const data = await response.json();
    if (data.status === 'OK') {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      throw new Error('Geocoding request failed');
    }
  } catch (error) {
    console.error('Error fetching geocoding data:', error);
    throw error;
  }
};