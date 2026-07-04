import { memo, useMemo } from "react";

function generateStars(count = 72) {
  return Array.from({ length: count }).map(() => ({
    left: Math.random() * 100,
    top: Math.random() * 60,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 2,
  }));
}

function Stars({ opacity, reducedMotion = false, compact = false }) {
  const stars = useMemo(() => {
    const count = reducedMotion ? 18 : compact ? 28 : 40;
    return generateStars(count);
  }, [compact, reducedMotion]);

  return (
    <div className="stars" style={{ opacity }}>
      {stars.map((s, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default memo(Stars);
