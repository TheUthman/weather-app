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
  FiCompass,
  FiClock,
  FiZap,
  FiStar,
  FiTrash2,
} from "react-icons/fi";
import {
  fetchGeocodingData,
  fetchGeocodingSuggestions,
} from "../services/geocodingService";
import { useToast } from "../context/ToastContext";

const FAVORITES_STORAGE_KEY = "weatherAppFavoriteLocations";

const getLocationId = (location) =>
  `${location.latitude ?? location.lat}-${location.longitude ?? location.lng}`;

const getLocationLabel = (location) =>
  [location.name, location.admin1, location.country].filter(Boolean).join(", ");

const getLocationMeta = (location) =>
  [location.admin1, location.country].filter(Boolean).join(", ");

const Search = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [isPending, startTransition] = useTransition();

  const controllerRef = useRef(null);
  const searchRef = useRef(null);
  const cacheRef = useRef(new Map());

  const searchHighlights = [
    { icon: FiGlobe, label: "Worldwide", value: "City, region, country" },
    { icon: FiZap, label: "Live", value: "Instant suggestions" },
    { icon: FiClock, label: "Fast", value: "Open forecast directly" },
  ];

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

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
    const searchQuery = getLocationLabel(location);
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

  const handleAddFavorite = (location) => {
    const favorite = {
      id: getLocationId(location),
      name: location.name,
      admin1: location.admin1,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    if (favorites.some((item) => item.id === favorite.id)) {
      addToast(`${location.name} is already in favorites`, "info");
      return;
    }

    setFavorites((current) => [favorite, ...current].slice(0, 8));
    addToast(`${location.name} added to favorites`, "success");
  };

  const handleRemoveFavorite = (event, favorite) => {
    event.stopPropagation();
    setFavorites((current) =>
      current.filter((item) => item.id !== favorite.id),
    );
    addToast(`${favorite.name} removed from favorites`, "info");
  };

  const isFavorite = (location) =>
    favorites.some((item) => item.id === getLocationId(location));

  return (
    <div className="search-page page-container">
      <section className="search-stage">
        <div className="search-topbar">
          <button
            className="search-back-btn"
            onClick={() => navigate("/")}
            aria-label="Go back"
          >
            <FiArrowLeft size={21} />
          </button>

          <div className="search-topbar-copy">
            <span className="page-eyebrow">Weather route</span>
            <strong>Location finder</strong>
          </div>
        </div>

        <div className="search-command-grid">
          <form className="search-command-card" onSubmit={handleSearch}>
            <div className="search-command-copy">
              <span className="page-eyebrow">
                <FiCompass size={13} /> Forecast search
              </span>
              <h1 className="search-page-title">Where should the sky move?</h1>
              <p className="page-description">
                Search any city, region, or country and open its live forecast
                with the same immersive weather view.
              </p>
            </div>

            <div className="search-field-group" ref={searchRef}>
              <div className="search-page-input-wrapper">
                <FiSearch className="search-page-input-icon" size={21} />

                <input
                  type="text"
                  className="search-page-input"
                  placeholder="Try Lagos, Tokyo, or Cape Town"
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

                <button
                  type="submit"
                  className="search-page-submit"
                  disabled={isPending}
                >
                  <span className="submit-span">
                    {isPending ? "Searching" : "Open"}
                  </span>
                  <FiNavigation className="search-submit-icon" />
                </button>
              </div>

              {loading && (
                <div className="search-loading">Searching locations...</div>
              )}

              {!loading && suggestions.length > 0 && (
                <div className="search-suggestions">
                  {suggestions.map((location) => (
                    <div
                      key={`${location.name}-${location.latitude}-${location.longitude}`}
                      className="search-suggestion-row"
                    >
                      <button
                        type="button"
                        className="search-suggestion-item"
                        onClick={() => handleSuggestionClick(location)}
                      >
                        <span className="search-suggestion-icon">
                          <FiMapPin />
                        </span>
                        <div>
                          <strong>{location.name}</strong>
                          <small>{getLocationMeta(location)}</small>
                        </div>
                      </button>

                      <button
                        type="button"
                        className="search-favorite-toggle"
                        onClick={() => handleAddFavorite(location)}
                        aria-label={`Add ${location.name} to favorites`}
                        disabled={isFavorite(location)}
                      >
                        <FiStar />
                      </button>
                    </div>
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

            <div className="search-highlight-grid">
              {searchHighlights.map(({ icon: Icon, label, value }) => (
                <div className="search-highlight" key={label}>
                  <Icon size={16} />
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </form>

          <aside className="search-map-panel">
            <div className="search-map-orbit">
              <div className="search-map-pin">
                <FiMapPin size={26} />
              </div>
            </div>
            <div className="search-map-copy">
              <span className="page-eyebrow">Global coverage</span>
              <h2>Move the forecast anywhere.</h2>
              <p>
                Suggestions resolve coordinates, so each result opens the
                exact location instead of a loose text match.
              </p>
            </div>
          </aside>
        </div>

        <div className="search-featured-section">
          <div className="search-section-head">
            <span className="page-eyebrow">Favorites</span>
            <h2>Saved forecast locations</h2>
          </div>

          {favorites.length > 0 ? (
            <div className="search-quick-grid">
              {favorites.map((favorite) => (
                <div className="search-favorite-card" key={favorite.id}>
                  <button
                    type="button"
                    className="search-quick-pill"
                    onClick={() => handleSuggestionClick(favorite)}
                  >
                    <span>{favorite.country || "Saved"}</span>
                    <strong>{favorite.name}</strong>
                    <small>{getLocationMeta(favorite) || "Saved location"}</small>
                  </button>
                  <button
                    type="button"
                    className="search-favorite-remove"
                    onClick={(event) => handleRemoveFavorite(event, favorite)}
                    aria-label={`Remove ${favorite.name} from favorites`}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="search-empty-favorites">
              <FiStar size={20} />
              <span>Search a location and tap the star to save it here.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Search;
