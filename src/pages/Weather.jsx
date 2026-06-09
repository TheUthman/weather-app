import React from 'react'

const Weather = () => {
    
  return (
    <div className="weather-app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Weather</h1>
          <div className="search-container">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search city..."
              // value={searchQuery}
              // onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Current Weather Card */}
        <section className="current-weather-card glass-card">
          <div className="location-info">
            <h2 className="city-name">Lagos</h2>
            <span className="country">Nigeria</span>
          </div>

          <div className="current-temp-container">
            <div className="current-icon weather-icon-large">
              
            </div>
            <div className="temp-display">
              <span className="current-temp">30</span>
              <span className="temp-unit">°C</span>
            </div>
          </div>

          <p className="condition-text">cloudy</p>
          <p className="feels-like">Feels like  30°C</p>

          <div className="weather-details-grid">
            <div className="detail-item">
              <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
              <span className="detail-value">72%</span>
              <span className="detail-label">Humidity</span>
            </div>
            <div className="detail-item">
              <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 0 19.5 12H2"/>
              </svg>
              <span className="detail-value">39 km/h</span>
              <span className="detail-label">Wind</span>
            </div>
            <div className="detail-item">
              <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span className="detail-value">55</span>
              <span className="detail-label">Pressure (hPa)</span>
            </div>
            <div className="detail-item">
              <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span className="detail-value">10 km</span>
              <span className="detail-label">Visibility</span>
            </div>
          </div>
        </section>

        {/* Hourly Forecast */}
        <section className="hourly-forecast-card glass-card">
          <h3 className="section-title">Hourly Forecast</h3>
          <div className="hourly-scroll">
            <div className="hourly-item">
                <span className="hourly-time">7:00</span>
                <div className="hourly-icon weather-icon-small">
                  
                </div>
                <span className="hourly-temp">72°</span>
              </div>
            {/* {hourlyForecast.map((hour, index) => (
              
            ))} */}
          </div>
        </section>

        {/* Weekly Forecast */}
        <section className="weekly-forecast-card glass-card">
          <h3 className="section-title">7-Day Forecast</h3>
          <div className="weekly-list">
            {/* {weeklyForecast.map((day, index) => (
              
            ))} */}
            <div className="weekly-item">
                <span className="weekly-day">Today</span>
                <div className="weekly-condition">
                  <div className="weather-icon-small"></div>
                  <span className="weekly-condition-text"></span>
                </div>
                <div className="weekly-temps">
                  <span className="weekly-high">°</span>
                  <span className="weekly-low">°</span>
                </div>
                <div className="precipitation">
                  <svg className="precip-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                  </svg>
                  <span>%</span>
                </div>
              </div>
          </div>
        </section>

        {/* Sun Times */}
        <section className="sun-times-card glass-card">
          <h3 className="section-title">Sun & UV</h3>
          <div className="sun-times-content">
            <div className="sun-time-item">
              <svg className="sun-icon sunrise" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 18a5 5 0 0 0-10 0"/>
                <line x1="12" y1="2" x2="12" y2="9"/>
                <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
                <line x1="1" y1="18" x2="3" y2="18"/>
                <line x1="21" y1="18" x2="23" y2="18"/>
                <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
              </svg>
              <span className="sun-label">Sunrise</span>
              <span className="sun-value"></span>
            </div>
            <div className="sun-time-item">
              <svg className="sun-icon sunset" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 18a5 5 0 0 0-10 0"/>
                <line x1="12" y1="9" x2="12" y2="2"/>
                <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
                <line x1="1" y1="18" x2="3" y2="18"/>
                <line x1="21" y1="18" x2="23" y2="18"/>
                <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
              </svg>
              <span className="sun-label">Sunset</span>
              <span className="sun-value"></span>
            </div>
            <div className="uv-index-item">
              <div className="uv-circle">
                <span className="uv-value"></span>
              </div>
              <span className="uv-label">UV Index</span>
            </div>
          </div>
        </section>

        {/* Air Quality */}
        <section className="air-quality-card glass-card">
          <h3 className="section-title">Air Quality</h3>
          <div className="aq-content">
            <div className="aq-main">
              <div
                className="aq-circle"
              >
                <div className="aq-inner">
                  <span className="aq-number"></span>
                  <span className="aq-level"></span>
                </div>
              </div>
            </div>
            <div className="aq-details">
              <div className="aq-item">
                <span className="aq-item-value"></span>
                <span className="aq-item-label">PM2.5</span>
              </div>
              <div className="aq-item">
                <span className="aq-item-value"></span>
                <span className="aq-item-label">PM10</span>
              </div>
              <div className="aq-item">
                <span className="aq-item-value"></span>
                <span className="aq-item-label">O3</span>
              </div>
              <div className="aq-item">
                <span className="aq-item-value"></span>
                <span className="aq-item-label">NO2</span>
              </div>
            </div>
          </div>
        </section>

        {/* Other Cities */}
        <section className="cities-card glass-card">
          <h3 className="section-title">Other Cities</h3>
          <div className="cities-grid">
            {/* {filteredCities.map((city, index) => (
              
            ))} */}
            <div
                className="city-item"
              >
                <div className="city-info">
                  <span className="city-name-small"></span>
                  <span className="city-country"></span>
                </div>
                <div className="weather-icon-small city-icon">
                </div>
                <span className="city-temp"></span>
              </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Weather
