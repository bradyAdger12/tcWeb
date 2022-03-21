export function getColor(zone) {
  switch (zone) {
    case "Recovery":
      return "grey";
    case "Endurance":
      return "blue";
    case "Tempo":
      return "green";
    case "Threshold":
      return "orange";
    case "VO2 Max":
      return "red";
    case "Anaerobic":
      return "purple";
    default:
      return "red";
  }
}