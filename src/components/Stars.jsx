import { useMemo } from "react";

function generateStars(count = 120) {
  return Array.from({ length: count }).map(() => ({
    left: Math.random() * 100,
    top: Math.random() * 60,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 2,
  }));
}

export default function Stars({ opacity }) {
  const stars = useMemo(() => generateStars(), []);

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