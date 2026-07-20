import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('temp-bacinger', 'f1-circuits-master', 'circuits');
const DEST_DIR = path.resolve('public', 'circuits');

const circuitMap = {
  'bahrain': 'bh-2002.geojson',
  'jeddah': 'sa-2021.geojson',
  'albert_park': 'au-1953.geojson',
  'suzuka': 'jp-1962.geojson',
  'shanghai': 'cn-2004.geojson',
  'miami': 'us-2022.geojson',
  'imola': 'it-1953.geojson',
  'monaco': 'mc-1929.geojson',
  'montreal': 'ca-1978.geojson',
  'barcelona': 'es-1991.geojson',
  'red_bull_ring': 'at-1969.geojson',
  'silverstone': 'gb-1948.geojson',
  'hungaroring': 'hu-1986.geojson',
  'spa': 'be-1925.geojson',
  'zandvoort': 'nl-1948.geojson',
  'monza': 'it-1922.geojson',
  'baku': 'az-2016.geojson',
  'singapore': 'sg-2008.geojson',
  'cota': 'us-2012.geojson',
  'mexico_city': 'mx-1962.geojson',
  'interlagos': 'br-1940.geojson',
  'las_vegas': 'us-2023.geojson',
  'lusail': 'qa-2004.geojson',
  'yas_marina': 'ae-2009.geojson'
};

// Make sure dest dir exists
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

console.log('🏎️ Migrating bacinger GeoJSON tracks...');

let successCount = 0;
for (const [circuitId, filename] of Object.entries(circuitMap)) {
  const srcPath = path.join(SRC_DIR, filename);
  const destPath = path.join(DEST_DIR, `${circuitId}.json`);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ ${circuitId.padEnd(15)} -> ${filename}`);
    successCount++;
  } else {
    console.error(`❌ ERROR: Could not find ${filename} for ${circuitId}`);
  }
}

console.log(`\n🎉 Successfully migrated ${successCount}/${Object.keys(circuitMap).length} circuits!`);
