import { onCLS, onINP, onLCP } from "web-vitals";

const formatMetric = (metric) => ({
  name: metric.name,
  value: Number(metric.value.toFixed(2)),
  delta: Number(metric.delta.toFixed(2)),
  rating: metric.rating,
  id: metric.id,
});

const publishMetric = (metric) => {
  if (typeof window === "undefined") return;

  const nextMetric = formatMetric(metric);
  const store = (window.__weatherVitals = window.__weatherVitals || {});
  store[nextMetric.name] = nextMetric;

  window.dispatchEvent(
    new CustomEvent("weather-app:web-vital", {
      detail: nextMetric,
    }),
  );

  if (import.meta.env.DEV) {
    console.info(`[Web Vitals] ${nextMetric.name}`, nextMetric);
  }
};

export default function reportWebVitals() {
  // Publish settled values instead of logging every intermediate candidate.
  // The final values remain available at window.__weatherVitals.
  onLCP(publishMetric);
  onCLS(publishMetric);
  onINP(publishMetric);
}
