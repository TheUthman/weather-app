// src/services/geocodingService.js

export const fetchGeocodingData = async (location) => {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding request failed: status ${response.status}`);
    }
    const data = await response.json();
    const result = data?.results?.[0];

    if (result) {
      return {
        lat: Number(result.latitude),
        lng: Number(result.longitude),
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
      headers: { "Accept-Language": "en" },
    });
    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: status ${response.status}`);
    }
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
export async function fetchGeocodingSuggestions(query, signal) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query
    )}&count=5&language=en&format=json`,
    { signal }
  );

  if (!res.ok) {
    throw new Error(`Location suggestions failed: status ${res.status}`);
  }

  const data = await res.json();

  return data.results ?? [];
}
