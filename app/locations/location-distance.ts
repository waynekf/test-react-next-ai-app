interface Coordinates {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_KM = 6371;
const KM_PER_MILE = 1.609344;

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

export function convertKmToMiles(distanceInKm: number) {
  return distanceInKm / KM_PER_MILE;
}

export function convertMilesToKm(distanceInMiles: number) {
  return distanceInMiles * KM_PER_MILE;
}

export function createCirclePolygonCoordinates(
  center: Coordinates,
  radiusInMiles: number,
  segments = 64,
) {
  const radiusInKm = convertMilesToKm(radiusInMiles);
  const angularDistance = radiusInKm / EARTH_RADIUS_KM;
  const centerLatitude = degreesToRadians(center.latitude);
  const centerLongitude = degreesToRadians(center.longitude);
  const coordinates: [number, number][] = [];

  for (let index = 0; index <= segments; index += 1) {
    const bearing = (index / segments) * 2 * Math.PI;
    const latitude = Math.asin(
      Math.sin(centerLatitude) * Math.cos(angularDistance) +
        Math.cos(centerLatitude) * Math.sin(angularDistance) * Math.cos(bearing),
    );
    const longitude =
      centerLongitude +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(centerLatitude),
        Math.cos(angularDistance) -
          Math.sin(centerLatitude) * Math.sin(latitude),
      );

    coordinates.push([
      (((longitude * 180) / Math.PI + 540) % 360) - 180,
      (latitude * 180) / Math.PI,
    ]);
  }

  return coordinates;
}

export function isWithinDistanceLimit(
  distanceInKm: number | null,
  maxDistanceMiles: number | null,
) {
  if (maxDistanceMiles === null) {
    return true;
  }

  if (distanceInKm === null) {
    return false;
  }

  return convertKmToMiles(distanceInKm) <= maxDistanceMiles;
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