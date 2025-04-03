/*
 * Helper function used to get threejs-scene-coordinates from mercator coordinates.
 * This is just a quick and dirty solution - it won't work if points are far away from each other
 * because a meter near the north-pole covers more mercator-units
 * than a meter near the equator.
 */
export function calculateDistanceMercatorToMeters(
  from: maplibregl.MercatorCoordinate,
  to: maplibregl.MercatorCoordinate
) {
  const mercatorPerMeter = from.meterInMercatorCoordinateUnits();
  // mercator x: 0=west, 1=east
  const dEast = to.x - from.x;
  const dEastMeter = dEast / mercatorPerMeter;
  // mercator y: 0=north, 1=south
  const dNorth = from.y - to.y;
  const dNorthMeter = dNorth / mercatorPerMeter;
  return { dEastMeter, dNorthMeter };
}
