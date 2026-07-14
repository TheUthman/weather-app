import React, { memo, useRef, useState } from "react";
import Tips from "./Tips";
import { Outfits } from "./Outfits";
import AirQualityIndex from "./AirQualityIndex";
import UVIndex from "./UVIndex";
import HealthWellness from "./HealthWellness";
import WeatherExplained from "./WeatherExplained";
import Icon from "./Icon";

const InsightsCard = ({
  weatherCondition = "Sunny",
  temperature = 70,
  humidity = 50,
  uvIndex = 5,
  aqi = 50,
  pm25 = 15,
  pm10 = 25,
}) => {
  const scrollContainerRef = useRef(null);
  const frameRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const nextLeft = scrollLeft > 0;
    const nextRight = scrollLeft < scrollWidth - clientWidth - 10;

    setCanScrollLeft((current) => (current === nextLeft ? current : nextLeft));
    setCanScrollRight((current) =>
      current === nextRight ? current : nextRight,
    );
  }, []);

  const scheduleScrollCheck = React.useCallback(() => {
    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      checkScroll();
    });
  }, [checkScroll]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      const newScrollLeft =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });

      window.setTimeout(scheduleScrollCheck, 320);
    }
  };

  React.useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (!container) return undefined;

    container.addEventListener("scroll", scheduleScrollCheck, {
      passive: true,
    });
    window.addEventListener("resize", scheduleScrollCheck);

    return () => {
      container.removeEventListener("scroll", scheduleScrollCheck);
      window.removeEventListener("resize", scheduleScrollCheck);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [checkScroll, scheduleScrollCheck]);

  return (
    <div className="insights-container">
      <div className="insights-header">
        <h2 className="insights-title">Daily briefing</h2>
        <span className="insights-subtitle">Curated essentials</span>
      </div>

      <div className="insights-scroll-wrapper">
        {canScrollLeft && (
          <button
            className="insights-scroll-btn insights-scroll-btn-left"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <Icon name="chevronLeft" size={20} />
          </button>
        )}

        <div className="insights-scroll-container" ref={scrollContainerRef}>
          <Tips data={weatherCondition} />
          <Outfits data={temperature} />
          <AirQualityIndex aqi={aqi} pm25={pm25} pm10={pm10} />
          <UVIndex uvIndex={uvIndex} />
          <HealthWellness temperature={temperature} humidity={humidity} />
          <WeatherExplained />
        </div>

        {canScrollRight && (
          <button
            className="insights-scroll-btn insights-scroll-btn-right"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <Icon name="chevronRight" size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(InsightsCard);
