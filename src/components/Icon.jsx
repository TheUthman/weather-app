import { memo } from "react";

const paths = {
  alertCircle: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>
  ),
  alertTriangle: (
    <>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  barometer: (
    <>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 13 16 9" />
      <path d="M9 3h6" />
    </>
  ),
  check: (
    <>
      <path d="m20 6-11 11-5-5" />
    </>
  ),
  chevronLeft: <path d="m15 18-6-6 6-6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  cloud: (
    <>
      <path d="M17.5 19H8a6 6 0 1 1 1.7-11.8A7 7 0 0 1 22 12a4 4 0 0 1-4.5 7Z" />
    </>
  ),
  cloudRain: (
    <>
      <path d="M17.5 18H8a6 6 0 1 1 1.7-11.8A7 7 0 0 1 22 11a4 4 0 0 1-4.5 7Z" />
      <path d="M8 21v-1" />
      <path d="M12 21v-2" />
      <path d="M16 21v-1" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m16 8-2.2 5.8L8 16l2.2-5.8Z" />
    </>
  ),
  droplet: <path d="M12 2.5S5 10 5 15a7 7 0 0 0 14 0c0-5-7-12.5-7-12.5Z" />,
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  heart: (
    <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M8.5 14.5A6 6 0 1 1 15.5 14c-.8.6-1.5 1.7-1.5 3h-4c0-1.2-.6-2-1.5-2.5Z" />
    </>
  ),
  mapPin: (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  navigation: <path d="m12 2 7 19-7-4-7 4Z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  settings: (
    <>
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 .9-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6.9h.2a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  shirt: (
    <>
      <path d="M8 4 4 6l-2 5 4 2 1-2v9h10v-9l1 2 4-2-2-5-4-2a4 4 0 0 1-8 0Z" />
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <path d="M9 9h.01" />
      <path d="M15 9h.01" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.9 4.9 1.4 1.4" />
      <path d="m17.7 17.7 1.4 1.4" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m4.9 19.1 1.4-1.4" />
      <path d="m17.7 6.3 1.4-1.4" />
    </>
  ),
  sunrise: (
    <>
      <path d="M12 2v8" />
      <path d="m4.9 10.9 1.4 1.4" />
      <path d="m17.7 12.3 1.4-1.4" />
      <path d="M2 18h20" />
      <path d="M7 18a5 5 0 0 1 10 0" />
      <path d="m8 6 4-4 4 4" />
    </>
  ),
  sunset: (
    <>
      <path d="M12 10V2" />
      <path d="m4.9 10.9 1.4 1.4" />
      <path d="m17.7 12.3 1.4-1.4" />
      <path d="M2 18h20" />
      <path d="M7 18a5 5 0 0 1 10 0" />
      <path d="m16 6-4 4-4-4" />
    </>
  ),
  time: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  wind: (
    <>
      <path d="M3 8h11a3 3 0 1 0-3-3" />
      <path d="M3 12h16" />
      <path d="M3 16h12a3 3 0 1 1-3 3" />
    </>
  ),
  x: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
};

function Icon({ name, size = 20, strokeWidth = 2, ...props }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      focusable="false"
      {...props}
    >
      {paths[name] || paths.info}
    </svg>
  );
}

export default memo(Icon);
