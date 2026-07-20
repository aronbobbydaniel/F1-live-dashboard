/**
 * fetch-circuits.mjs
 * Fetches real F1 circuit outlines from OpenStreetMap Overpass API
 * and saves them as GeoJSON files in public/circuits/
 *
 * Run: node scripts/fetch-circuits.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'circuits');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// OSM Relation IDs for each F1 circuit (verified manually)
const CIRCUITS = [
  { id: 'bahrain',       name: 'Bahrain International Circuit',       osmId: 8299905  },
  { id: 'jeddah',        name: 'Jeddah Corniche Circuit',              osmId: 12745655 },
  { id: 'albert_park',   name: 'Albert Park Circuit',                  osmId: 6301741  },
  { id: 'suzuka',        name: 'Suzuka Circuit',                       osmId: 6697800  },
  { id: 'miami',         name: 'Miami International Autodrome',        osmId: 14296765 },
  { id: 'imola',         name: 'Autodromo Enzo e Dino Ferrari',        osmId: 1406998  },
  { id: 'monaco',        name: 'Circuit de Monaco',                    osmId: 10574788 },
  { id: 'montreal',      name: 'Circuit Gilles Villeneuve',            osmId: 4479498  },
  { id: 'barcelona',     name: 'Circuit de Barcelona-Catalunya',       osmId: 1386667  },
  { id: 'silverstone',   name: 'Silverstone Circuit',                  osmId: 2651567  },
  { id: 'red_bull_ring', name: 'Red Bull Ring',                        osmId: 1406849  },
  { id: 'hungaroring',   name: 'Hungaroring',                          osmId: 1386668  },
  { id: 'spa',           name: 'Circuit de Spa-Francorchamps',         osmId: 7417545  },
  { id: 'zandvoort',     name: 'Circuit Zandvoort',                    osmId: 127764   },
  { id: 'monza',         name: 'Autodromo Nazionale Monza',            osmId: 7096748  },
  { id: 'baku',          name: 'Baku City Circuit',                    osmId: 9611699  },
  { id: 'singapore',     name: 'Marina Bay Street Circuit',            osmId: 13662808 },
  { id: 'cota',          name: 'Circuit of the Americas',              osmId: 3374923  },
  { id: 'mexico_city',   name: 'Autodromo Hermanos Rodriguez',         osmId: 4479527  },
  { id: 'interlagos',    name: 'Autodromo Jose Carlos Pace',           osmId: 4481571  },
  { id: 'las_vegas',     name: 'Las Vegas Strip Circuit',              osmId: 17395551 },
  { id: 'lusail',        name: 'Lusail International Circuit',         osmId: 15174832 },
  { id: 'yas_marina',    name: 'Yas Marina Circuit',                   osmId: 2282498  },
  { id: 'shanghai',      name: 'Shanghai International Circuit',       osmId: 4480112  },
];

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Query Overpass API for a relation and return its member ways as GeoJSON
 */
async function fetchCircuitGeoJSON(osmId) {
  // Query to get the relation with full geometry of member ways
  const query = `
[out:json][timeout:60];
relation(${osmId});
way(r);
out geom;
  `.trim();

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'User-Agent': 'F1Dash/1.0 (f1-circuit-map educational project)',
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} for relation ${osmId}`);

  const data = await res.json();
  const elements = data.elements ?? [];

  if (elements.length === 0) {
    throw new Error(`No elements returned for relation ${osmId}`);
  }

  // Build coordinate arrays from each way's geometry
  const features = elements
    .filter(el => el.type === 'way' && el.geometry?.length >= 2)
    .map(el => ({
      type: 'Feature',
      properties: {
        osmId: el.id,
        tags: el.tags ?? {},
      },
      geometry: {
        type: 'LineString',
        coordinates: el.geometry.map(pt => [pt.lon, pt.lat]),
      },
    }));

  if (features.length === 0) {
    throw new Error(`No way geometry for relation ${osmId}`);
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Try fallback: query by way directly if relation gives no results
 */
async function fetchByWayId(osmId) {
  const query = `
[out:json][timeout:60];
way(${osmId});
out geom;
  `.trim();

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  const data = await res.json();
  const el = data.elements?.[0];
  if (!el?.geometry) throw new Error('No way geometry');

  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: { osmId: el.id },
      geometry: {
        type: 'LineString',
        coordinates: el.geometry.map(pt => [pt.lon, pt.lat]),
      },
    }],
  };
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log(`\n🏎  Fetching ${CIRCUITS.length} F1 circuit outlines from OpenStreetMap...\n`);

  const results = { success: [], failed: [] };

  for (const circuit of CIRCUITS) {
    const outFile = path.join(OUT_DIR, `${circuit.id}.json`);

    // Skip if already fetched
    if (fs.existsSync(outFile)) {
      const stat = fs.statSync(outFile);
      const ageDays = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24);
      if (ageDays < 7) {
        console.log(`  ⏭  ${circuit.id} — already cached`);
        results.success.push(circuit.id);
        continue;
      }
    }

    process.stdout.write(`  ⬇  ${circuit.id} (OSM ${circuit.osmId})...`);

    try {
      let geojson = await fetchCircuitGeoJSON(circuit.osmId);

      // Validate we got real data
      if (!geojson.features.length) throw new Error('Empty features');

      // Calculate bounding box for validation
      const allCoords = geojson.features.flatMap(f => f.geometry.coordinates);
      const lons = allCoords.map(c => c[0]);
      const lats = allCoords.map(c => c[1]);
      const bbox = [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)];

      // Add metadata
      geojson.metadata = {
        id: circuit.id,
        name: circuit.name,
        osmRelationId: circuit.osmId,
        fetchedAt: new Date().toISOString(),
        bbox,
        pointCount: allCoords.length,
        wayCount: geojson.features.length,
      };

      fs.writeFileSync(outFile, JSON.stringify(geojson, null, 2));
      console.log(` ✅  ${geojson.features.length} ways, ${allCoords.length} pts`);
      results.success.push(circuit.id);

    } catch (err) {
      console.log(` ❌  ${err.message}`);
      results.failed.push({ id: circuit.id, error: err.message });
    }

    // Be polite to the API — 1.5s between requests
    await sleep(1500);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅  Success: ${results.success.length}/${CIRCUITS.length}`);
  if (results.failed.length) {
    console.log(`❌  Failed:  ${results.failed.length}`);
    results.failed.forEach(f => console.log(`     - ${f.id}: ${f.error}`));
  }
  console.log(`📁  Saved to: ${OUT_DIR}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(console.error);
