/**
 * EUIS geolocation GeoJSON, the EUIS standard: FeatureCollection, WGS 84 lon/lat,
 * coordinates cut to 6 decimals, closed polygons, and exactly four properties in a
 * fixed order. Reference: EUIS "GeoJSON File Description" (EUDR Information System –
 * Operator API Reference).
 */

export type EuisPlot = {
  producerName: string;
  /** ISO 3166-1 alpha-2, e.g. "ID". */
  producerCountry: string;
  /** Plot ID. */
  productionPlace: string;
  areaHa: number;
  /** Outer ring as [lon, lat], open or closed. */
  ring: [number, number][];
};

const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

/** Closed ring with 6-decimal coordinates and no repeated consecutive points. */
function euisRing(ring: [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  for (const [lon, lat] of ring) {
    const p: [number, number] = [round6(lon), round6(lat)];
    const last = out[out.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
  }
  if (out.length > 1 && out[0][0] === out[out.length - 1][0] && out[0][1] === out[out.length - 1][1]) out.pop();
  if (out.length < 3) throw new Error("A polygon needs at least three distinct points.");
  return [...out, out[0]];
}

const natural = new Intl.Collator("en", { numeric: true });

/** EUIS geolocation GeoJSON (Type II: every feature carries its producer). */
export function euisGeoJson(plots: EuisPlot[]): string {
  const features = [...plots]
    .sort((a, b) => a.producerName.localeCompare(b.producerName) || natural.compare(a.productionPlace, b.productionPlace))
    .map((p) => ({
      type: "Feature",
      // Exactly these four, in this order; names are case-sensitive and Area must be a number.
      properties: {
        ProducerName: p.producerName,
        ProducerCountry: p.producerCountry,
        ProductionPlace: p.productionPlace,
        Area: Math.round(p.areaHa * 100) / 100,
      },
      geometry: { type: "Polygon", coordinates: [euisRing(p.ring)] },
    }));
  // One feature per line: compact (EUIS caps a DDS at 25 MB of GeoJSON) yet readable.
  return `{"type":"FeatureCollection","features":[\n${features.map((f) => JSON.stringify(f)).join(",\n")}\n]}\n`;
}
