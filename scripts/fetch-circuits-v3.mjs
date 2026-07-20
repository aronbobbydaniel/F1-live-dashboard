/**
 * fetch-circuits-v3.mjs
 * Fetches ACCURATE F1 circuit outlines from OpenStreetMap
 * Uses bounding box constraints to ensure correct geographic location.
 *
 * Run: node scripts/fetch-circuits-v3.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'circuits');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Each circuit has:
//  - bbox: [south, west, north, east] — tight bounding box around the circuit location
//  - wayTag: the OSM tag to filter (sport=motor_racing is standard for F1 tracks)
//  - exactWayId: verified OSM way ID of the RACING LINE itself
const CIRCUITS = [
  {
    id: 'bahrain',
    name: 'Bahrain International Circuit',
    exactWayId: 197096072,
    bbox: [26.02, 50.50, 26.06, 50.55],   // Sakhir, Bahrain
  },
  {
    id: 'jeddah',
    name: 'Jeddah Corniche Circuit',
    exactWayId: 805668641,
    bbox: [21.59, 39.09, 21.65, 39.14],   // Jeddah, Saudi Arabia
  },
  {
    id: 'albert_park',
    name: 'Albert Park Circuit',
    exactWayId: 9929148,
    bbox: [-37.86, 144.96, -37.84, 144.98], // Melbourne, Australia
  },
  {
    id: 'suzuka',
    name: 'Suzuka International Racing Course',
    exactWayId: 25758634,
    bbox: [34.83, 136.52, 34.87, 136.55], // Suzuka, Japan
  },
  {
    id: 'miami',
    name: 'Miami International Autodrome',
    exactWayId: 1064946977,
    bbox: [25.94, -80.24, 25.97, -80.21], // Miami Gardens, FL
  },
  {
    id: 'imola',
    name: 'Autodromo Enzo e Dino Ferrari',
    exactWayId: 8430538,
    bbox: [44.33, 11.70, 44.35, 11.73],   // Imola, Italy
  },
  {
    id: 'monaco',
    name: 'Circuit de Monaco',
    exactWayId: 11899027,
    bbox: [43.72, 7.40, 43.75, 7.44],    // Monte Carlo, Monaco
  },
  {
    id: 'montreal',
    name: 'Circuit Gilles Villeneuve',
    exactWayId: 5756717,
    bbox: [45.49, -73.53, 45.51, -73.51], // Montreal, Canada
  },
  {
    id: 'barcelona',
    name: 'Circuit de Barcelona-Catalunya',
    exactWayId: 8430537,
    bbox: [41.56, 2.25, 41.58, 2.27],    // Montmelo, Spain
  },
  {
    id: 'silverstone',
    name: 'Silverstone Circuit',
    exactWayId: 23680770,
    bbox: [52.06, -1.03, 52.09, -1.00],  // Silverstone, UK
  },
  {
    id: 'red_bull_ring',
    name: 'Red Bull Ring',
    exactWayId: 8430508,
    bbox: [47.21, 14.74, 47.22, 14.77],  // Spielberg, Austria
  },
  {
    id: 'hungaroring',
    name: 'Hungaroring',
    exactWayId: 8430533,
    bbox: [47.57, 19.24, 47.59, 19.26],  // Mogyorod, Hungary
  },
  {
    id: 'spa',
    name: 'Circuit de Spa-Francorchamps',
    exactWayId: 7093663,
    bbox: [50.42, 5.96, 50.45, 5.99],    // Spa, Belgium
  },
  {
    id: 'zandvoort',
    name: 'Circuit Zandvoort',
    exactWayId: 4003729,
    bbox: [52.37, 4.53, 52.39, 4.55],    // Zandvoort, Netherlands
  },
  {
    id: 'monza',
    name: 'Autodromo Nazionale Monza',
    exactWayId: 7095424,
    bbox: [45.61, 9.27, 45.63, 9.30],    // Monza, Italy
  },
  {
    id: 'baku',
    name: 'Baku City Circuit',
    exactWayId: 527218591,
    bbox: [40.36, 49.83, 40.41, 49.87],  // Baku, Azerbaijan
  },
  {
    id: 'singapore',
    name: 'Marina Bay Street Circuit',
    exactWayId: 394462478,
    bbox: [1.28, 103.85, 1.30, 103.87],  // Marina Bay, Singapore
  },
  {
    id: 'cota',
    name: 'Circuit of the Americas',
    exactWayId: 252283721,
    bbox: [30.13, -97.64, 30.16, -97.61], // Austin, Texas
  },
  {
    id: 'mexico_city',
    name: 'Autodromo Hermanos Rodriguez',
    exactWayId: 8584067,
    bbox: [19.39, -99.09, 19.41, -99.07], // Mexico City
  },
  {
    id: 'interlagos',
    name: 'Autodromo Jose Carlos Pace',
    exactWayId: 5659038,
    bbox: [-23.71, -46.70, -23.69, -46.69], // São Paulo, Brazil
  },
  {
    id: 'las_vegas',
    name: 'Las Vegas Street Circuit',
    exactWayId: null,
    bbox: [36.10, -115.17, 36.18, -115.13], // Las Vegas Strip area
  },
  {
    id: 'lusail',
    name: 'Lusail International Circuit',
    exactWayId: null,
    bbox: [25.47, 51.44, 25.50, 51.47],  // Lusail, Qatar
  },
  {
    id: 'yas_marina',
    name: 'Yas Marina Circuit',
    exactWayId: null,
    bbox: [24.46, 54.59, 24.48, 54.61],  // Abu Dhabi, UAE
  },
  {
    id: 'shanghai',
    name: 'Shanghai International Circuit',
    exactWayId: null,
    bbox: [31.33, 121.19, 31.35, 121.22], // Shanghai, China
  },
];

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function overpassQuery(query, endpointIdx = 0) {
  const url = OVERPASS_ENDPOINTS[endpointIdx % OVERPASS_ENDPOINTS.length];
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'User-Agent': 'F1Dash/1.0 (circuit-map; github.com/f1dash)',
    },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(50000),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}`);
  }
  return res.json();
}

function elementsToGeoJSON(elements, meta) {
  const features = elements
    .filter(el => el.type === 'way' && el.geometry?.length >= 2)
    .map(el => ({
      type: 'Feature',
      properties: { osmId: el.id, tags: el.tags ?? {} },
      geometry: {
        type: 'LineString',
        coordinates: el.geometry.map(pt => [pt.lon, pt.lat]),
      },
    }));

  if (!features.length) return null;

  const allCoords = features.flatMap(f => f.geometry.coordinates);
  const lons = allCoords.map(c => c[0]);
  const lats = allCoords.map(c => c[1]);

  return {
    type: 'FeatureCollection',
    features,
    metadata: {
      ...meta,
      fetchedAt: new Date().toISOString(),
      bbox: [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)],
      pointCount: allCoords.length,
      wayCount: features.length,
    },
  };
}

async function fetchCircuit(circuit, attempt = 0) {
  const [s, w, n, e] = circuit.bbox;

  // Strategy 1: Fetch exact way by ID (most reliable — way ID won't change location)
  if (circuit.exactWayId) {
    try {
      const q = `[out:json][timeout:40];\nway(${circuit.exactWayId});\nout geom;`;
      const data = await overpassQuery(q, attempt);
      const geo = elementsToGeoJSON(data?.elements ?? [], { id: circuit.id, name: circuit.name, strategy: 'exactWayId' });
      if (geo && geo.metadata.pointCount >= 10) return geo;
    } catch (e) { /* fall through */ }
    await sleep(1500);
  }

  // Strategy 2: Search within bounding box for sport=motor_racing ways
  try {
    const q = `[out:json][timeout:40][bbox:${s},${w},${n},${e}];\nway["sport"="motor_racing"];\nout geom;`;
    const data = await overpassQuery(q, attempt + 1);
    const geo = elementsToGeoJSON(data?.elements ?? [], { id: circuit.id, name: circuit.name, strategy: 'bbox-motor_racing' });
    if (geo && geo.metadata.pointCount >= 10) return geo;
  } catch (e) { /* fall through */ }

  await sleep(1500);

  // Strategy 3: Search within bbox for highway=raceway
  try {
    const q = `[out:json][timeout:40][bbox:${s},${w},${n},${e}];\n(\n  way["highway"="raceway"];\n  way["leisure"="track"]["sport"="motor_racing"];\n);\nout geom;`;
    const data = await overpassQuery(q, attempt);
    const geo = elementsToGeoJSON(data?.elements ?? [], { id: circuit.id, name: circuit.name, strategy: 'bbox-raceway' });
    if (geo && geo.metadata.pointCount >= 10) return geo;
  } catch (e) { /* fall through */ }

  await sleep(1500);

  // Strategy 4: Any way with sport or leisure tag in bbox
  try {
    const q = `[out:json][timeout:40][bbox:${s},${w},${n},${e}];\nway["sport"];\nout geom;`;
    const data = await overpassQuery(q, attempt);
    // Filter to ways with enough points (likely the track itself, not service roads)
    const elements = (data?.elements ?? []).filter(el => el.type === 'way' && (el.geometry?.length ?? 0) >= 20);
    const geo = elementsToGeoJSON(elements, { id: circuit.id, name: circuit.name, strategy: 'bbox-sport' });
    if (geo) return geo;
  } catch (e) { /* fall through */ }

  throw new Error(`All strategies exhausted for ${circuit.id}`);
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('\n🏎  F1 Circuit GeoJSON Fetcher v3 (Bounding Box Edition)');
  console.log(`   Fetching ${CIRCUITS.length} circuits with geographic bbox constraints\n`);

  const success = [], failed = [];

  for (const circuit of CIRCUITS) {
    const outFile = path.join(OUT_DIR, `${circuit.id}.json`);

    // Check if we have a good cached version already
    if (fs.existsSync(outFile)) {
      const existing = JSON.parse(fs.readFileSync(outFile, 'utf8'));
      const ageDays = (Date.now() - new Date(existing.metadata?.fetchedAt ?? 0).getTime()) / 86400000;
      if (ageDays < 30 && (existing.metadata?.pointCount ?? 0) >= 20) {
        console.log(`  ⏭  ${circuit.id.padEnd(16)} cached  (${existing.metadata.pointCount} pts, ${existing.metadata.strategy ?? 'v1'})`);
        success.push(circuit.id);
        continue;
      }
    }

    process.stdout.write(`  ⬇  ${circuit.id.padEnd(16)} `);
    try {
      const geo = await fetchCircuit(circuit);
      fs.writeFileSync(outFile, JSON.stringify(geo, null, 2));
      const s = geo.metadata;
      console.log(`✅  ${s.wayCount} ways · ${s.pointCount} pts  [${s.strategy}]`);
      success.push(circuit.id);
    } catch (err) {
      console.log(`❌  ${err.message}`);
      failed.push({ id: circuit.id, error: err.message });
    }

    await sleep(2500); // polite rate limit
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅  Success: ${success.length}/${CIRCUITS.length}`);
  if (failed.length) {
    console.log(`❌  Failed:  ${failed.length}`);
    failed.forEach(f => console.log(`    - ${f.id}: ${f.error}`));
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(console.error);
