/**
 * fetch-circuits-v2.mjs
 * More robust fetcher using multiple OSM query strategies:
 * 1. Try relation's member ways (with geom)
 * 2. Try named way query with sport=motor_racing
 * 3. Try fetching the way directly by ID
 *
 * Run: node scripts/fetch-circuits-v2.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'circuits');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

// Each circuit has multiple query strategies (ordered by preference)
// wayId: direct way ID to the racing line (most specific)
// relationId: OSM relation for the circuit complex
// searchName: fallback text search
const CIRCUITS = [
  { id: 'bahrain',       name: 'Bahrain International Circuit',         wayId: 197096072,   relationId: 8299905  },
  { id: 'jeddah',        name: 'Jeddah Corniche Circuit',                wayId: 805668641,   relationId: 12745655 },
  { id: 'albert_park',   name: 'Albert Park Circuit',                    wayId: 9929148,     relationId: 6301741  },
  { id: 'suzuka',        name: 'Suzuka International Racing Course',      wayId: 25758634,    relationId: 6697800  },
  { id: 'miami',         name: 'Miami International Autodrome',           wayId: 1064946977,  relationId: 14296765 },
  { id: 'imola',         name: 'Autodromo Enzo e Dino Ferrari',           wayId: 8430538,     relationId: 1406998  },
  { id: 'monaco',        name: 'Circuit de Monaco',                       wayId: 11899027,    relationId: 10574788 },
  { id: 'montreal',      name: 'Circuit Gilles Villeneuve',               wayId: 5756717,     relationId: 4479498  },
  { id: 'barcelona',     name: 'Circuit de Barcelona-Catalunya',          wayId: 8430537,     relationId: 1386667  },
  { id: 'silverstone',   name: 'Silverstone Circuit',                     wayId: 23680770,    relationId: 2651567  },
  { id: 'red_bull_ring', name: 'Red Bull Ring',                           wayId: 8430508,     relationId: 1406849  },
  { id: 'hungaroring',   name: 'Hungaroring',                             wayId: 8430533,     relationId: 1386668  },
  { id: 'spa',           name: 'Circuit de Spa-Francorchamps',            wayId: 7093663,     relationId: 7417545  },
  { id: 'zandvoort',     name: 'Circuit Zandvoort',                       wayId: 4003729,     relationId: 127764   },
  { id: 'monza',         name: 'Autodromo Nazionale Monza',               wayId: 7095424,     relationId: 7096748  },
  { id: 'baku',          name: 'Baku City Circuit',                       wayId: 527218591,   relationId: 9611699  },
  { id: 'singapore',     name: 'Marina Bay Street Circuit',               wayId: 394462478,   relationId: 13662808 },
  { id: 'cota',          name: 'Circuit of the Americas',                 wayId: 252283721,   relationId: 3374923  },
  { id: 'mexico_city',   name: 'Autodromo Hermanos Rodriguez',            wayId: 8584067,     relationId: 4479527  },
  { id: 'interlagos',    name: 'Autodromo Jose Carlos Pace',              wayId: 5659038,     relationId: 4481571  },
  { id: 'las_vegas',     name: 'Las Vegas Street Circuit',                wayId: 1232453789,  relationId: 17395551 },
  { id: 'lusail',        name: 'Lusail International Circuit',            wayId: 1023457891,  relationId: 15174832 },
  { id: 'yas_marina',    name: 'Yas Marina Circuit',                      wayId: 105467823,   relationId: 2282498  },
  { id: 'shanghai',      name: 'Shanghai International Circuit',          wayId: 127045678,   relationId: 4480112  },
];

let endpointIdx = 0;
function getEndpoint() {
  return OVERPASS_ENDPOINTS[endpointIdx % OVERPASS_ENDPOINTS.length];
}

async function overpassQuery(query, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const url = OVERPASS_ENDPOINTS[attempt % OVERPASS_ENDPOINTS.length];
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'F1Dash/1.0 (f1-circuit-map; educational project)',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(45000),
      });
      if (res.status === 504 || res.status === 503 || res.status === 429) {
        await sleep(3000 * (attempt + 1));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(2000 * (attempt + 1));
    }
  }
}

function waysToGeoJSON(elements, circuitMeta) {
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
      ...circuitMeta,
      fetchedAt: new Date().toISOString(),
      bbox: [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)],
      pointCount: allCoords.length,
      wayCount: features.length,
    },
  };
}

async function fetchCircuit(circuit) {
  // Strategy 1: Relation query (gets all member ways with geometry)
  try {
    const q = `[out:json][timeout:50];\nrelation(${circuit.relationId});\nway(r);\nout geom;`;
    const data = await overpassQuery(q);
    const geo = waysToGeoJSON(data?.elements ?? [], { id: circuit.id, name: circuit.name, osmRelationId: circuit.relationId });
    if (geo && geo.metadata.pointCount >= 20) return { geo, strategy: 'relation' };
  } catch (e) {
    // fall through
  }

  await sleep(1000);

  // Strategy 2: Direct way ID query
  try {
    const q = `[out:json][timeout:30];\nway(${circuit.wayId});\nout geom;`;
    const data = await overpassQuery(q);
    const geo = waysToGeoJSON(data?.elements ?? [], { id: circuit.id, name: circuit.name, osmWayId: circuit.wayId });
    if (geo && geo.metadata.pointCount >= 5) return { geo, strategy: 'way' };
  } catch (e) {
    // fall through
  }

  await sleep(1000);

  // Strategy 3: Search by name
  try {
    const safeName = circuit.name.replace(/"/g, '\\"');
    const q = `[out:json][timeout:30];\nway["sport"="motor_racing"]["name"="${safeName}"];\nout geom;`;
    const data = await overpassQuery(q);
    const geo = waysToGeoJSON(data?.elements ?? [], { id: circuit.id, name: circuit.name });
    if (geo) return { geo, strategy: 'name-search' };
  } catch (e) {
    // fall through
  }

  throw new Error('All strategies failed');
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log(`\n🏎  F1 Circuit GeoJSON Fetcher v2`);
  console.log(`   Fetching ${CIRCUITS.length} circuits from OpenStreetMap\n`);

  const results = { success: [], failed: [] };

  for (const circuit of CIRCUITS) {
    const outFile = path.join(OUT_DIR, `${circuit.id}.json`);
    if (fs.existsSync(outFile)) {
      const stat = fs.statSync(outFile);
      const ageDays = (Date.now() - stat.mtimeMs) / 86400000;
      // Check if existing file has enough points
      const existing = JSON.parse(fs.readFileSync(outFile, 'utf-8'));
      if (ageDays < 7 && existing.metadata?.pointCount >= 20) {
        console.log(`  ⏭  ${circuit.id.padEnd(15)} already cached (${existing.metadata.pointCount} pts)`);
        results.success.push(circuit.id);
        continue;
      }
    }

    process.stdout.write(`  ⬇  ${circuit.id.padEnd(15)} `);

    try {
      const { geo, strategy } = await fetchCircuit(circuit);
      fs.writeFileSync(outFile, JSON.stringify(geo, null, 2));
      console.log(`✅  ${geo.metadata.wayCount} ways · ${geo.metadata.pointCount} pts  [${strategy}]`);
      results.success.push(circuit.id);
    } catch (err) {
      console.log(`❌  ${err.message}`);
      results.failed.push({ id: circuit.id, error: err.message });
    }

    // Rate limit: 2 seconds between circuits
    await sleep(2000);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅  Success: ${results.success.length}/${CIRCUITS.length}`);
  if (results.failed.length) {
    console.log(`❌  Failed:  ${results.failed.length}`);
    results.failed.forEach(f => console.log(`    - ${f.id}: ${f.error}`));
  }
  console.log(`📁  Output:  public/circuits/`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(console.error);
