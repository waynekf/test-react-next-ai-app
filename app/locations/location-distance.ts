interface Coordinates {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_KM = 6371;

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceInKm(from: Coordinates, to: Coordinates) {
  const latitudeDelta = degreesToRadians(to.latitude - from.latitude);
  const longitudeDelta = degreesToRadians(to.longitude - from.longitude);
  const fromLatitude = degreesToRadians(from.latitude);
  const toLatitude = degreesToRadians(to.latitude);

  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(fromLatitude) *
    Math.cos(toLatitude) *
    Math.sin(longitudeDelta / 2) *
    Math.sin(longitudeDelta / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export function getDistanceFromNearestHome(
  homeLocations: Coordinates[],
  parkrun: Coordinates,
) {
  if (homeLocations.length === 0) {
    return null;
  }

  return homeLocations.reduce<number | null>((shortestDistance, homeLocation) => {
    const distance = calculateDistanceInKm(homeLocation, parkrun);

    if (shortestDistance === null || distance < shortestDistance) {
      return distance;
    }

    return shortestDistance;
  }, null);
}