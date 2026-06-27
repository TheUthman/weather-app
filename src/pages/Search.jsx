import { useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiArrowLeft, FiMapPin, FiAlertCircle } from "react-icons/fi";
import { fetchGeocodingData } from "../services/geocodingService";
import { useToast } from "../context/ToastContext";

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Please enter a location");
      addToast("Please enter a location to search", "warning");
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
        addToast("Location not found. Try a different name.", "error");
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
      setError("Failed to search. Please try again.");
      addToast("Search failed. Check your connection.", "error");
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
        <div className="search-field-group">
          <div className="search-page-input-wrapper">
            <FiSearch className="search-page-input-icon" size={20} />
            <input
              type="text"
              className="search-page-input"
              placeholder="Search city, state, or country"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (error) setError("");
              }}
              aria-describedby={error ? "search-error" : undefined}
              autoFocus
            />
          </div>
          {error && (
            <div className="search-callout" id="search-error" role="alert">
              <FiAlertCircle className="search-callout-icon" size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

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
