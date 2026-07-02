/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useTransition, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiArrowLeft,
  FiMapPin,
  FiAlertCircle,
  FiGlobe,
  FiNavigation,
} from "react-icons/fi";
import {
  fetchGeocodingData,
  fetchGeocodingSuggestions,
} from "../services/geocodingService";
import { useToast } from "../context/ToastContext";

const Search = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isPending, startTransition] = useTransition();

  const controllerRef = useRef(null);
  const searchRef = useRef(null);
  const cacheRef = useRef(new Map());

  const fetchSuggestions = async (search) => {
    const trimmed = search.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);

    if (cacheRef.current.has(trimmed)) {
      setSuggestions(cacheRef.current.get(trimmed));
      setLoading(false);
      return;
    }

    try {
      const results = await fetchGeocodingSuggestions(
        trimmed,
        controller.signal,
      );
      cacheRef.current.set(trimmed, results);
      setSuggestions(results ?? []);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestions(trimmed);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();

    const trimmed = query.trim();

    if (!trimmed) {
      setError("Please enter a location");
      addToast("Please enter a location to search", "warning");
      return;
    }

    setError("");
    setSuggestions([]);

    try {
      const coords = await fetchGeocodingData(trimmed);

      if (coords?.lat && coords?.lng) {
        startTransition(() => {
          navigate("/", {
            state: {
              searchCoords: {
                lat: coords.lat,
                lng: coords.lng,
              },
              searchQuery: trimmed,
            },
          });
        });
      } else {
        setError("Location not found. Please try a different search.");
        addToast("Location not found. Try a different name.", "error");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to search. Please try again.");
      addToast("Search failed. Check your connection.", "error");
    }
  };

  const handleSuggestionClick = (location) => {
    const searchQuery = `${location.name}, ${location.admin1}, ${location.country}`;
    setQuery(searchQuery);
    setSuggestions([]);

    navigate("/", {
      state: {
        searchCoords: {
          lat: location.latitude,
          lng: location.longitude,
        },
        searchQuery,
      },
    });
  };

  return (
    <div className="search-page page-container">
      <section className="search-hero glass-page-hero">
        <div className="search-hero-head">
          <button
            className="search-back-btn"
            onClick={() => navigate("/")}
            aria-label="Go back"
          >
            <FiArrowLeft size={22} />
          </button>

          <div className="search-hero-copy">
            <span className="page-eyebrow">Find a forecast</span>
            <h1 className="search-page-title">Search any location</h1>
            <p className="page-description">
              Jump anywhere in the world and keep the same immersive sky-driven
              experience.
            </p>
          </div>
        </div>

        <div className="search-hero-meta">
          <span className="hero-chip">
            <FiGlobe size={14} /> Global coverage
          </span>
          <span className="hero-chip">
            <FiNavigation size={14} /> Fast location lookup
          </span>
        </div>
      </section>

      <div className="search-layout">
        <form
          className="search-page-form search-surface-card"
          onSubmit={handleSearch}
        >
          <div className="search-form-header">
            <h2>Location search</h2>
            <span>City, state, or country</span>
          </div>

          <div className="search-field-group" ref={searchRef}>
            <div className="search-page-input-wrapper">
              <FiSearch className="search-page-input-icon" size={20} />

              <input
                type="text"
                className="search-page-input"
                placeholder="Search city, state, or country"
                value={query}
                autoFocus
                aria-describedby={error ? "search-error" : undefined}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuery(value);

                  if (!value.trim()) {
                    setSuggestions([]);
                  }

                  if (error) {
                    setError("");
                  }
                }}
              />
            </div>

            {loading && (
              <div className="search-loading">Searching locations...</div>
            )}

            {!loading && suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.map((location) => (
                  <button
                    key={`${location.name}-${location.latitude}-${location.longitude}`}
                    type="button"
                    className="search-suggestion-item"
                    onClick={() => handleSuggestionClick(location)}
                  >
                    <FiMapPin />
                    <div>
                      <strong>{location.name}</strong>
                      <small>
                        {[location.admin1, location.country]
                          .filter(Boolean)
                          .join(", ")}
                      </small>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="search-callout" id="search-error" role="alert">
                <FiAlertCircle className="search-callout-icon" size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="search-form-actions">
            <button
              type="submit"
              className="search-page-submit"
              disabled={isPending}
            >
              <span className="submit-span">
                {isPending ? "Searching..." : "Open forecast"}
              </span>
              <FiSearch className="search-submit-icon" />
            </button>
          </div>
        </form>

        <aside className="search-guide-card search-surface-card">
          <div className="search-guide-copy">
            <span className="page-eyebrow">Quick ideas</span>
            <h2>Try these locations</h2>
            <p>
              Search for cities, regions, or countries to swap the live weather
              view instantly.
            </p>
          </div>

          <div className="search-quick-grid">
            {["London", "Tokyo", "Cape Town"].map((item) => (
              <button
                key={item}
                type="button"
                className="search-quick-pill"
                onClick={() => setQuery(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="search-page-callout">
            <FiMapPin size={16} />
            <span>
              Tip: choose a suggestion to open the forecast immediately.
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Search;
