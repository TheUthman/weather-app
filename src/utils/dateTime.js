export const formatZonedTime = (value, timezone, fallback = "—") => {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  try {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone || undefined,
    });
  } catch {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }
};

export const formatFreshnessLabel = ({
  updatedAt,
  timezone,
  isStale = false,
}) => {
  if (!updatedAt) return isStale ? "Cached forecast" : "Latest forecast";
  const time = formatZonedTime(updatedAt, timezone, "");
  if (!time) return isStale ? "Cached forecast" : "Latest forecast";
  return `${isStale ? "Saved" : "Updated"} ${time}`;
};
