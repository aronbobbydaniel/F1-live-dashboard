const JOLPICA_BASE = 'https://api.jolpi.ca/ergast/f1';

export interface JolpicaDriver {
  driverId: string;
  permanentNumber: string;
  code: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

export interface JolpicaConstructor {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
}

export interface JolpicaDriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: JolpicaDriver;
  Constructors: JolpicaConstructor[];
}

export interface JolpicaConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: JolpicaConstructor;
}

export interface JolpicaRace {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    url: string;
    circuitName: string;
    Location: { lat: string; long: string; locality: string; country: string };
  };
  date: string;
  time?: string;
  FirstPractice?: { date: string; time: string };
  SecondPractice?: { date: string; time: string };
  ThirdPractice?: { date: string; time: string };
  Qualifying?: { date: string; time: string };
  Sprint?: { date: string; time: string };
  SprintQualifying?: { date: string; time: string };
  Results?: JolpicaResult[];
}

export interface JolpicaResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: JolpicaDriver;
  Constructor: JolpicaConstructor;
  grid: string;
  laps: string;
  status: string;
  Time?: { millis: string; time: string };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: { time: string };
    AverageSpeed: { units: string; speed: string };
  };
}

export interface JolpicaSeason {
  season: string;
  url: string;
}

export interface JolpicaChampion {
  season: string;
  Driver: JolpicaDriver;
  Constructor: JolpicaConstructor;
  points: string;
  wins: string;
}

async function fetchJolpica<T>(path: string): Promise<T> {
  const url = `${JOLPICA_BASE}/${path}.json`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Jolpica API error: ${res.status} for ${url}`);
  return res.json();
}

export async function getDriverStandings(season: string | number = 'current'): Promise<JolpicaDriverStanding[]> {
  const data = await fetchJolpica<any>(`${season}/driverStandings`);
  return data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
}

export async function getConstructorStandings(season: string | number = 'current'): Promise<JolpicaConstructorStanding[]> {
  const data = await fetchJolpica<any>(`${season}/constructorStandings`);
  return data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
}

export async function getRaceSchedule(season: string | number = 'current'): Promise<JolpicaRace[]> {
  const data = await fetchJolpica<any>(`${season}`);
  return data?.MRData?.RaceTable?.Races ?? [];
}

export async function getRaceResults(season: string | number, round: string | number): Promise<JolpicaRace | null> {
  const data = await fetchJolpica<any>(`${season}/${round}/results`);
  return data?.MRData?.RaceTable?.Races?.[0] ?? null;
}

export async function getDriverInfo(driverId: string): Promise<JolpicaDriver | null> {
  const data = await fetchJolpica<any>(`drivers/${driverId}`);
  return data?.MRData?.DriverTable?.Drivers?.[0] ?? null;
}

export async function getDriverSeasonResults(driverId: string, season: string | number = 'current'): Promise<JolpicaRace[]> {
  const data = await fetchJolpica<any>(`${season}/drivers/${driverId}/results`);
  return data?.MRData?.RaceTable?.Races ?? [];
}

export async function getSeasons(): Promise<JolpicaSeason[]> {
  const data = await fetchJolpica<any>('seasons?limit=100');
  return (data?.MRData?.SeasonTable?.Seasons ?? []).reverse();
}

export async function getAllChampions(): Promise<JolpicaChampion[]> {
  const data = await fetchJolpica<any>('driverStandings/1?limit=100');
  const lists = data?.MRData?.StandingsTable?.StandingsLists ?? [];
  return lists.map((list: any) => ({
    season: list.season,
    Driver: list.DriverStandings[0].Driver,
    Constructor: list.DriverStandings[0].Constructors[0],
    points: list.DriverStandings[0].points,
    wins: list.DriverStandings[0].wins,
  })).reverse();
}

export async function getAllDrivers(season: string | number = 'current'): Promise<JolpicaDriver[]> {
  const data = await fetchJolpica<any>(`${season}/drivers`);
  return data?.MRData?.DriverTable?.Drivers ?? [];
}

export const COUNTRY_ISO_CODES: Record<string, string> = {
  // Nationalities
  'British': 'gb', 'Dutch': 'nl', 'Spanish': 'es', 'Monegasque': 'mc',
  'Mexican': 'mx', 'Australian': 'au', 'German': 'de', 'Finnish': 'fi',
  'French': 'fr', 'Canadian': 'ca', 'Italian': 'it', 'American': 'us',
  'Thai': 'th', 'Japanese': 'jp', 'Chinese': 'cn', 'Brazilian': 'br',
  'Argentine': 'ar', 'Austrian': 'at', 'Danish': 'dk', 'New Zealander': 'nz',
  'South African': 'za', 'Polish': 'pl', 'Swiss': 'ch', 'Hungarian': 'hu',
  'Bahraini': 'bh', 'Saudi Arabian': 'sa', 'Swedish': 'se', 'Belgian': 'be',

  // Countries
  'UK': 'gb', 'Great Britain': 'gb', 'United Kingdom': 'gb', 'Netherlands': 'nl',
  'Spain': 'es', 'Monaco': 'mc', 'Mexico': 'mx', 'Australia': 'au',
  'Germany': 'de', 'Finland': 'fi', 'France': 'fr', 'Canada': 'ca',
  'Italy': 'it', 'USA': 'us', 'United States': 'us', 'Thailand': 'th',
  'Japan': 'jp', 'China': 'cn', 'Brazil': 'br', 'Argentina': 'ar',
  'Austria': 'at', 'Denmark': 'dk', 'New Zealand': 'nz', 'South Africa': 'za',
  'Poland': 'pl', 'Switzerland': 'ch', 'Hungary': 'hu', 'Bahrain': 'bh',
  'Saudi Arabia': 'sa', 'Belgium': 'be', 'Azerbaijan': 'az', 'Singapore': 'sg',
  'Qatar': 'qa', 'UAE': 'ae', 'United Arab Emirates': 'ae',
};

export function getCountryIsoCode(name: string): string {
  if (!name) return 'un';
  const trimmed = name.trim();
  return COUNTRY_ISO_CODES[trimmed] || COUNTRY_ISO_CODES[trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()] || 'un';
}

export function getCircuitIsoCode(circuitId: string): string {
  const codes: Record<string, string> = {
    'bahrain': 'bh', 'saudi_arabia': 'sa', 'australia': 'au', 'japan': 'jp',
    'china': 'cn', 'miami': 'us', 'imola': 'it', 'monaco': 'mc',
    'canada': 'ca', 'spain': 'es', 'austria': 'at', 'silverstone': 'gb',
    'hungary': 'hu', 'spa': 'be', 'zandvoort': 'nl', 'monza': 'it',
    'baku': 'az', 'singapore': 'sg', 'texas': 'us', 'mexico': 'mx',
    'interlagos': 'br', 'las_vegas': 'us', 'losail': 'qa', 'yas_marina': 'ae',
  };
  return codes[circuitId.toLowerCase()] ?? 'un';
}

export function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    'British': '🇬🇧', 'Dutch': '🇳🇱', 'Spanish': '🇪🇸', 'Monegasque': '🇲🇨',
    'Mexican': '🇲🇽', 'Australian': '🇦🇺', 'German': '🇩🇪', 'Finnish': '🇫🇮',
    'French': '🇫🇷', 'Canadian': '🇨🇦', 'Italian': '🇮🇹', 'American': '🇺🇸',
    'Thai': '🇹🇭', 'Japanese': '🇯🇵', 'Chinese': '🇨🇳', 'Brazilian': '🇧🇷',
    'Argentine': '🇦🇷', 'Austrian': '🇦🇹', 'Danish': '🇩🇰', 'New Zealander': '🇳🇿',
    'South African': '🇿🇦', 'Polish': '🇵🇱', 'Swiss': '🇨🇭', 'Hungarian': '🇭🇺',
    'Bahraini': '🇧🇭', 'Saudi Arabian': '🇸🇦',
  };
  return flags[countryCode] ?? '🏁';
}

export const CIRCUIT_FLAGS: Record<string, string> = {
  'bahrain': '🇧🇭', 'saudi_arabia': '🇸🇦', 'australia': '🇦🇺', 'japan': '🇯🇵',
  'china': '🇨🇳', 'miami': '🇺🇸', 'imola': '🇮🇹', 'monaco': '🇲🇨',
  'canada': '🇨🇦', 'spain': '🇪🇸', 'austria': '🇦🇹', 'silverstone': '🇬🇧',
  'hungary': '🇭🇺', 'spa': '🇧🇪', 'zandvoort': '🇳🇱', 'monza': '🇮🇹',
  'baku': '🇦🇿', 'singapore': '🇸🇬', 'texas': '🇺🇸', 'mexico': '🇲🇽',
  'interlagos': '🇧🇷', 'las_vegas': '🇺🇸', 'losail': '🇶🇦', 'yas_marina': '🇦🇪',
};

export function getCircuitFlag(circuitId: string): string {
  return CIRCUIT_FLAGS[circuitId] ?? '🏁';
}
