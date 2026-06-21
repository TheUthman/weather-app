import { useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiArrowLeft, FiMapPin } from "react-icons/fi";
import { fetchGeocodingData } from "../services/geocodingService";

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Please enter a location");
      return;
    }

    setError("");
    try {
      const coords = await fetchGeocodingData(trimmed);
      if (coords && coords.lat && coords.lng) {
        startTransition(() => {
          navigate("/", {
            state: {
              searchCoords: { lat: coords.lat, lng: coords.lng },
              searchQuery: trimmed,
            },
          });
        });
      } else {
        setError("Location not found. Please try a different search.");
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
      setError("Failed to search. Please try again.");
    }
  };

  return (
    <div className="search-page page-container">
      <div className="search-page-header">
        <button
          className="search-back-btn"
          onClick={() => navigate("/")}
          aria-label="Go back"
        >
          <FiArrowLeft size={27} />
        </button>
        <h2 className="search-page-title">Search Location</h2>
      </div>

      <form className="search-page-form" onSubmit={handleSearch}>
        <div className="search-page-input-wrapper">
          <FiSearch className="search-page-input-icon" size={20} />
          <input
            type="text"
            className="search-page-input"
            placeholder="Search city, state, or country..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (error) setError("");
            }}
            autoFocus
          />
        </div>
        {error && <p className="search-page-error">{error}</p>}
    
        <button
          type="submit"
          className="search-page-submit"
          disabled={isPending}
        >
          {isPending ? <span className="submit-span">Searching...</span> : <span className="submit-span">Search</span>}
          <FiSearch className="search-submit-icon" />
        </button>
      </form>

      <div className="search-page-hints">
        <FiMapPin size={16} />
        <span>Try "San Francisco", "London", or "Tokyo"</span>
      </div>
    </div>
  );
};

export default Search;