/* ─────────────────────────────────────────────────────────
   2026 F1 Season — driver & team data
   Plain TS (no 'use client') so it can be imported anywhere
──────────────────────────────────────────────────────────*/

export const RACE_SEAT_DRIVERS_2026 = new Set([
  'max_verstappen', 'hadjar',          // Red Bull
  'norris',         'piastri',         // McLaren
  'hamilton',       'leclerc',         // Ferrari
  'russell',        'antonelli',       // Mercedes
  'alonso',         'stroll',          // Aston Martin
  'gasly',          'colapinto',       // Alpine
  'sainz',          'albon',           // Williams
  'lawson',         'arvid_lindblad',  // Racing Bulls (RB)
  'hulkenberg',     'bortoleto',       // Audi
  'ocon',           'bearman',         // Haas
  'perez',          'bottas',          // Cadillac
]);

export const TEAM_COLORS: Record<string, string> = {
  red_bull:     '#3671C6',
  ferrari:      '#E8002D',
  mercedes:     '#27F4D2',
  mclaren:      '#FF8000',
  aston_martin: '#229971',
  alpine:       '#FF87BC',
  williams:     '#64C4FF',
  rb:           '#6692FF',
  sauber:       '#52E252',
  audi:         '#F50F28',
  haas:         '#B6BABD',
  cadillac:     '#E5A823',
};

export function getTeamColor(constructorId: string): string {
  const id  = constructorId.toLowerCase();
  const key = Object.keys(TEAM_COLORS).find(k => id.includes(k));
  return key ? TEAM_COLORS[key] : '#888888';
}

export const TEAM_LOGOS: Record<string, { abbr: string; color: string }> = {
  red_bull:     { abbr: 'RBR', color: '#3671C6' },
  ferrari:      { abbr: 'SF',  color: '#E8002D' },
  mercedes:     { abbr: 'AMG', color: '#27F4D2' },
  mclaren:      { abbr: 'MCL', color: '#FF8000' },
  aston_martin: { abbr: 'AMR', color: '#229971' },
  alpine:       { abbr: 'ALP', color: '#FF87BC' },
  williams:     { abbr: 'WLM', color: '#64C4FF' },
  rb:           { abbr: 'RB',  color: '#6692FF' },
  audi:         { abbr: 'AUD', color: '#F50F28' },
  haas:         { abbr: 'HAS', color: '#B6BABD' },
  cadillac:     { abbr: 'CAD', color: '#E5A823' },
};

export function getTeamLogo(constructorId: string): { abbr: string; color: string } {
  const id  = constructorId.toLowerCase();
  const key = Object.keys(TEAM_LOGOS).find(k => id.includes(k));
  return key ? TEAM_LOGOS[key] : { abbr: 'F1', color: '#888' };
}

export const TEAM_LOGO_URLS: Record<string, string> = {
  red_bull:     'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracinglogowhite.webp',
  ferrari:      'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/ferrari/2026ferrarilogowhite.webp',
  mercedes:     'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/mercedes/2026mercedeslogowhite.webp',
  mclaren:      'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarenlogowhite.webp',
  aston_martin: 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartinlogowhite.webp',
  alpine:       'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/alpine/2026alpinelogowhite.webp',
  williams:     'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/williams/2026williamslogowhite.webp',
  rb:           'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullslogowhite.webp',
  audi:         'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp',
  haas:         'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/haas/2026haaslogowhite.webp',
  cadillac:     'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaclogowhite.webp',
};

export function getTeamLogoUrl(constructorId: string): string {
  const id  = constructorId.toLowerCase();
  const key = Object.keys(TEAM_LOGO_URLS).find(k => id.includes(k));
  // Fallback to Wikipedia/standard placeholder logo if not mapped
  return key ? TEAM_LOGO_URLS[key] : 'https://media.formula1.com/image/upload/c_lfill,w_128,h_128/v1740000001/fom-website/2026/F1%20App%20Store%20Logo/f1-app-logo.svg';
}

export const DRIVER_FLAGS: Record<string, string> = {
  'British': '🇬🇧', 'Dutch': '🇳🇱', 'Spanish': '🇪🇸', 'Monegasque': '🇲🇨',
  'Mexican': '🇲🇽', 'Australian': '🇦🇺', 'German': '🇩🇪', 'Finnish': '🇫🇮',
  'French': '🇫🇷', 'Canadian': '🇨🇦', 'Italian': '🇮🇹', 'American': '🇺🇸',
  'Thai': '🇹🇭', 'Japanese': '🇯🇵', 'Chinese': '🇨🇳', 'Brazilian': '🇧🇷',
  'Argentine': '🇦🇷', 'Austrian': '🇦🇹', 'Danish': '🇩🇰', 'New Zealander': '🇳🇿',
  'South African': '🇿🇦', 'Polish': '🇵🇱', 'Swiss': '🇨🇭', 'Hungarian': '🇭🇺',
  'Bahraini': '🇧🇭', 'Saudi Arabian': '🇸🇦', 'Swedish': '🇸🇪',
};
export const getDriverFlag = (nat: string) => DRIVER_FLAGS[nat] ?? '🏁';

export const DRIVER_HEADSHOTS: Record<string, string> = {
  max_verstappen: 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/redbullracing/maxver01/2026redbullracingmaxver01right.webp',
  hadjar:         'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/redbullracing/isahad01/2026redbullracingisahad01right.webp',
  norris:         'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/mclaren/lannor01/2026mclarenlannor01right.webp',
  piastri:        'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/mclaren/oscpia01/2026mclarenoscpia01right.webp',
  leclerc:        'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/ferrari/chalec01/2026ferrarichalec01right.webp',
  hamilton:       'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/ferrari/lewham01/2026ferrarilewham01right.webp',
  russell:        'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/mercedes/georus01/2026mercedesgeorus01right.webp',
  antonelli:      'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/mercedes/andant01/2026mercedesandant01right.webp',
  alonso:         'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/astonmartin/feralo01/2026astonmartinferalo01right.webp',
  stroll:         'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/astonmartin/lanstr01/2026astonmartinlanstr01right.webp',
  gasly:          'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/alpine/piegas01/2026alpinepiegas01right.webp',
  colapinto:      'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/alpine/fracol01/2026alpinefracol01right.webp',
  albon:          'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/williams/alealb01/2026williamsalealb01right.webp',
  sainz:          'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/williams/carsai01/2026williamscarsai01right.webp',
  lawson:         'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/racingbulls/lialaw01/2026racingbullslialaw01right.webp',
  arvid_lindblad: 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/racingbulls/arvlin01/2026racingbullsarvlin01right.webp',
  ocon:           'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/haas/estoco01/2026haasestoco01right.webp',
  bearman:        'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/haas/olibea01/2026haasolibea01right.webp',
  hulkenberg:     'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/audi/nichul01/2026audinichul01right.webp',
  bortoleto:      'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/audi/gabbor01/2026audigabbor01right.webp',
  perez:          'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/cadillac/serper01/2026cadillacserper01right.webp',
  bottas:         'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/cadillac/valbot01/2026cadillacvalbot01right.webp',
};
