import { memo, useMemo } from "react";

const weatherPalettes = {
  sunny: {
    primary: "255, 183, 0",
    secondary: "0, 212, 255",
    accent: "255, 213, 0",
    mode: "sunny",
  },
  "partly-cloudy": {
    primary: "255, 183, 0",
    secondary: "0, 136, 255",
    accent: "255, 213, 0",
    mode: "partly-cloudy",
  },
  cloudy: {
    primary: "170, 181, 194",
    secondary: "0, 136, 255",
    accent: "124, 92, 255",
    mode: "cloudy",
  },
  rain: {
    primary: "0, 136, 255",
    secondary: "0, 212, 255",
    accent: "124, 92, 255",
    mode: "rain",
  },
  snow: {
    primary: "235, 245, 255",
    secondary: "170, 225, 255",
    accent: "255, 255, 255",
    mode: "snow",
  },
  thunderstorm: {
    primary: "124, 92, 255",
    secondary: "0, 136, 255",
    accent: "255, 213, 0",
    mode: "thunderstorm",
  },
  "night-clear": {
    primary: "90, 107, 255",
    secondary: "0, 212, 255",
    accent: "255, 183, 0",
    mode: "night-clear",
  },
  "night-cloudy": {
    primary: "80, 96, 170",
    secondary: "124, 92, 255",
    accent: "0, 212, 255",
    mode: "night-cloudy",
  },
};

const createParticleSet = (count, paletteKey) => {
  const paletteSeed = paletteKey
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return Array.from({ length: count }, (_, index) => {
    const left = ((paletteSeed * (index + 3) * 17) % 1000) / 10;
    const top = ((paletteSeed * (index + 5) * 11) % 1000) / 10;
    const duration = 5 + ((index + paletteSeed) % 7);
    const delay = (index % 6) * -0.7;
    const drift = ((index + paletteSeed) % 8) - 4;
    const size = 2 + ((index + paletteSeed) % 4);

    return {
      left: `${left}%`,
      top: `${top}%`,
      duration: `${duration}s`,
      delay: `${delay}s`,
      drift: `${drift * 4}px`,
      size: `${size}px`,
    };
  });
};

const WeatherBackdrop = ({ weatherType, pointer }) => {
  const palette = weatherPalettes[weatherType] || weatherPalettes.cloudy;

  const particles = useMemo(() => {
    if (palette.mode === "rain" || palette.mode === "thunderstorm") {
      return createParticleSet(18, palette.mode);
    }
    if (palette.mode === "snow") {
      return createParticleSet(22, palette.mode);
    }
    return [];
  }, [palette.mode]);

  const orbStyle = (xFactor, yFactor, blur) => ({
    transform: `translate3d(${(pointer.x - 50) * xFactor}px, ${(pointer.y - 50) * yFactor}px, 0)`,
    filter: `blur(${blur}px)`,
  });

  return (
    <div
      className={`weather-backdrop weather-backdrop--${palette.mode}`}
      aria-hidden="true"
      style={{
        "--weather-primary": palette.primary,
        "--weather-secondary": palette.secondary,
        "--weather-accent": palette.accent,
      }}
    >
      <div className="weather-backdrop__sky" />
      <div className="weather-backdrop__mesh" />
      <div className="weather-backdrop__glow weather-backdrop__glow--one" style={orbStyle(0.28, 0.18, 38)} />
      <div className="weather-backdrop__glow weather-backdrop__glow--two" style={orbStyle(-0.16, 0.22, 48)} />
      <div className="weather-backdrop__glow weather-backdrop__glow--three" style={orbStyle(0.12, -0.14, 52)} />
      <div className="weather-backdrop__horizon" />
      <div className="weather-backdrop__cloud weather-backdrop__cloud--one" style={orbStyle(0.16, 0.06, 18)} />
      <div className="weather-backdrop__cloud weather-backdrop__cloud--two" style={orbStyle(-0.12, 0.04, 20)} />
      <div className="weather-backdrop__cloud weather-backdrop__cloud--three" style={orbStyle(0.06, -0.08, 16)} />

      {palette.mode === "sunny" || palette.mode === "partly-cloudy" ? (
        <div className="weather-backdrop__sun" style={orbStyle(0.08, 0.05, 12)} />
      ) : null}
      {palette.mode === "night-clear" || palette.mode === "night-cloudy" ? (
        <div className="weather-backdrop__moon" style={orbStyle(0.06, 0.04, 10)} />
      ) : null}

      {particles.length > 0 ? (
        <div className="weather-backdrop__precipitation">
          {particles.map((particle, index) => (
            <span
              key={`${palette.mode}-${index}`}
              className={`weather-backdrop__particle weather-backdrop__particle--${palette.mode}`}
              style={{
                left: particle.left,
                top: particle.top,
                "--particle-duration": particle.duration,
                "--particle-delay": particle.delay,
                "--particle-drift": particle.drift,
                "--particle-size": particle.size,
              }}
            />
          ))}
        </div>
      ) : null}

      {palette.mode === "thunderstorm" ? (
        <div className="weather-backdrop__lightning">
          <span className="weather-backdrop__bolt weather-backdrop__bolt--one" />
          <span className="weather-backdrop__bolt weather-backdrop__bolt--two" />
        </div>
      ) : null}
    </div>
  );
};

export default memo(WeatherBackdrop);
