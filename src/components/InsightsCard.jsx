import React, { useRef, useState } from 'react';
import Tips from './Tips';
import { Outfits } from './Outfits';
import AirQualityIndex from './AirQualityIndex';
import UVIndex from './UVIndex';
import HealthWellness from './HealthWellness';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const InsightsCard = ({ 
  weatherCondition = 'Sunny', 
  temperature = 70, 
  humidity = 50,
  uvIndex = 5,
  aqi = 50,
  pm25 = 15,
  pm10 = 25
}) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      const newScrollLeft = 
        direction === 'left' 
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });

      setTimeout(checkScroll, 300);
    }
  };

  React.useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  return (
    <div className="insights-container">
      <div className="insights-header">
        <h2 className="insights-title">Daily Insights</h2>
      </div>
      
      <div className="insights-scroll-wrapper">
        {canScrollLeft && (
          <button 
            className="insights-scroll-btn insights-scroll-btn-left"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <FiChevronLeft size={20} />
          </button>
        )}

        <div 
          className="insights-scroll-container"
          ref={scrollContainerRef}
          onScroll={checkScroll}
        >
          <Tips data={weatherCondition} />
          <Outfits data={temperature} />
          <AirQualityIndex aqi={aqi} pm25={pm25} pm10={pm10} />
          <UVIndex uvIndex={uvIndex} />
          <HealthWellness temperature={temperature} humidity={humidity} />
        </div>

        {canScrollRight && (
          <button 
            className="insights-scroll-btn insights-scroll-btn-right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <FiChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default InsightsCard;
