// src/services/geocodingService.js

export const fetchGeocodingData = async (location) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=jsonv2&limit=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "WeatherRadarApp/1.0",
      },
    });
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }

    throw new Error("Geocoding request failed: No results found");
  } catch (error) {
    console.error("Error fetching geocoding data:", error);
    throw error;
  }
};

export const fetchReverseGeocodingData = async (lat, lng) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "WeatherRadarApp/1.0",
      },
    });
    const data = await response.json();

    if (data && data.address) {
      const a = data.address;
      // Nominatim provides city, town, village, or suburb depending on the area
      const cityName = a.city || a.town || a.village || a.suburb || a.hamlet;
      const state = a.state;

      if (cityName && state) {
        return `${cityName}, ${state}`;
      } else if (cityName) {
        return cityName;
      }

      return data.display_name || "Detected Location";
    }

    return "Detected Location";
  } catch (error) {
    console.error("Network error during reverse geocoding:", error);
    return "Detected Location";
  }
};
