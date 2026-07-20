# Weather Radar

A responsive React and Vite weather dashboard with current conditions, an interactive 12-hour dial, planning insights, air quality, historical comparison, and a 10-day forecast.

## Requirements

- Node.js 22 or newer
- npm

## Local development

```bash
npm ci
npm run dev
```

The default dashboard loads San Francisco without requesting browser location permission. Users can opt into device location from the dashboard or Settings.

## Quality checks

```bash
npm run lint
npm test
npm run build
npm audit --omit=dev
```

The same checks run in GitHub Actions for pull requests and pushes to `main`.

## Lighthouse testing

Run Lighthouse against the optimized production build, not the Vite development
server. Development mode includes React diagnostics, source transforms, and
hot-reload code that heavily distort performance results.

```bash
npm run build
npm run preview
```

Then audit the preview URL printed by Vite (normally `http://localhost:4173`).

## Deployment

The project is configured for Vercel. `vercel.json` provides the SPA rewrite required for direct access to `/search`, `/settings`, and `/help`, along with baseline security headers.

Before publishing a deployment:

1. Run all quality checks.
2. Verify every route from a fresh browser session.
3. Test with the weather APIs blocked to confirm cached and unavailable states.
4. Review the Content Security Policy whenever a new external service is added.

## Data and storage

- Forecast, air-quality, geocoding, and historical data come from Open-Meteo.
- Device-location labels use OpenStreetMap Nominatim reverse geocoding.
- Preferences, favorites, the last successful forecast, and location coordinates are stored in browser local storage.
- Vercel Analytics and Speed Insights are loaded only in production.
