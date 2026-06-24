export function getCloudColor(type, progress) {
  if (type === "moon") {
    return "rgba(200, 210, 230, 0.25)";
  }

  if (progress < 0.2) {
    return "rgba(255, 160, 120, 0.35)";
  }

  if (progress < 0.6) {
    return "rgba(255, 255, 255, 0.35)";
  }

  if (progress < 0.9) {
    return "rgba(180, 120, 255, 0.35)";
  }

  return "rgba(180, 190, 210, 0.25)";
}