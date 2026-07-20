const BASE_URL = 'https://api.openf1.org/v1';

export interface OpenF1Driver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  first_name: string;
  last_name: string;
  headshot_url: string;
  country_code: string;
  session_key: number;
  meeting_key: number;
}

export interface OpenF1Position {
  driver_number: number;
  position: number;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface OpenF1Lap {
  driver_number: number;
  lap_number: number;
  lap_duration: number | null;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  i1_speed: number | null;
  i2_speed: number | null;
  st_speed: number | null;
  is_pit_out_lap: boolean;
  date_start: string;
  session_key: number;
  meeting_key: number;
}

export interface OpenF1PitStop {
  driver_number: number;
  lap_number: number;
  pit_duration: number | null;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface OpenF1Session {
  session_key: number;
  session_name: string;
  session_type: string;
  status: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  location: string;
  country_name: string;
  country_code: string;
  circuit_key: number;
  circuit_short_name: string;
  meeting_key: number;
  year: number;
}

export interface OpenF1Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  location: string;
  country_name: string;
  country_code: string;
  circuit_key: number;
  circuit_short_name: string;
  date_start: string;
  gmt_offset: string;
  year: number;
}

export interface OpenF1Stint {
  driver_number: number;
  stint_number: number;
  lap_start: number;
  lap_end: number;
  compound: string;
  tyre_age_at_start: number;
  session_key: number;
  meeting_key: number;
}

export interface OpenF1Interval {
  driver_number: number;
  gap_to_leader: number | null;
  interval: number | null;
  date: string;
  session_key: number;
  meeting_key: number;
}

async function fetchOpenF1<T>(endpoint: string, params?: Record<string, string | number>): Promise<T[]> {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }
  const res = await fetch(url.toString(), { next: { revalidate: 10 } });
  if (!res.ok) throw new Error(`OpenF1 API error: ${res.status}`);
  return res.json();
}

export async function getLatestSession(): Promise<OpenF1Session | null> {
  const sessions = await fetchOpenF1<OpenF1Session>('sessions', { session_key: 'latest' });
  return sessions[0] ?? null;
}

export async function getSessionDrivers(sessionKey: number | 'latest'): Promise<OpenF1Driver[]> {
  return fetchOpenF1<OpenF1Driver>('drivers', { session_key: sessionKey });
}

export async function getLatestPositions(sessionKey: number | 'latest'): Promise<OpenF1Position[]> {
  const allPos = await fetchOpenF1<OpenF1Position>('position', { session_key: sessionKey });
  // Keep only the latest position per driver
  const latestByDriver = new Map<number, OpenF1Position>();
  for (const pos of allPos) {
    const existing = latestByDriver.get(pos.driver_number);
    if (!existing || new Date(pos.date) > new Date(existing.date)) {
      latestByDriver.set(pos.driver_number, pos);
    }
  }
  return Array.from(latestByDriver.values()).sort((a, b) => a.position - b.position);
}

export async function getLatestLaps(sessionKey: number | 'latest'): Promise<OpenF1Lap[]> {
  const laps = await fetchOpenF1<OpenF1Lap>('laps', { session_key: sessionKey });
  // Get latest lap per driver
  const latestByDriver = new Map<number, OpenF1Lap>();
  for (const lap of laps) {
    const existing = latestByDriver.get(lap.driver_number);
    if (!existing || lap.lap_number > existing.lap_number) {
      latestByDriver.set(lap.driver_number, lap);
    }
  }
  return Array.from(latestByDriver.values());
}

export async function getStints(sessionKey: number | 'latest'): Promise<OpenF1Stint[]> {
  return fetchOpenF1<OpenF1Stint>('stints', { session_key: sessionKey });
}

export async function getPitStops(sessionKey: number | 'latest'): Promise<OpenF1PitStop[]> {
  return fetchOpenF1<OpenF1PitStop>('pit', { session_key: sessionKey });
}

export async function getIntervals(sessionKey: number | 'latest'): Promise<OpenF1Interval[]> {
  const all = await fetchOpenF1<OpenF1Interval>('intervals', { session_key: sessionKey });
  const latestByDriver = new Map<number, OpenF1Interval>();
  for (const item of all) {
    const existing = latestByDriver.get(item.driver_number);
    if (!existing || new Date(item.date) > new Date(existing.date)) {
      latestByDriver.set(item.driver_number, item);
    }
  }
  return Array.from(latestByDriver.values());
}

export async function getMeetings(year: number): Promise<OpenF1Meeting[]> {
  return fetchOpenF1<OpenF1Meeting>('meetings', { year });
}

export async function getSessions(meetingKey: number): Promise<OpenF1Session[]> {
  return fetchOpenF1<OpenF1Session>('sessions', { meeting_key: meetingKey });
}

export interface OpenF1Location {
  driver_number: number;
  x: number;
  y: number;
  z: number;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface OpenF1Weather {
  air_temperature: number;
  track_temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  wind_direction: number;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface OpenF1TrackStatus {
  status: string; // '1' = Green, '2' = Yellow, '4' = SC, '5' = Red, '6' = VSC, '7' = VSC Ending
  message: string;
  date: string;
  session_key: number;
  meeting_key: number;
}

export async function getLatestLocations(sessionKey: number | 'latest'): Promise<OpenF1Location[]> {
  const allLocs = await fetchOpenF1<OpenF1Location>('location', { session_key: sessionKey });
  const latestByDriver = new Map<number, OpenF1Location>();
  for (const loc of allLocs) {
    const existing = latestByDriver.get(loc.driver_number);
    if (!existing || new Date(loc.date) > new Date(existing.date)) {
      latestByDriver.set(loc.driver_number, loc);
    }
  }
  return Array.from(latestByDriver.values());
}

export async function getLatestWeather(sessionKey: number | 'latest'): Promise<OpenF1Weather | null> {
  const records = await fetchOpenF1<OpenF1Weather>('weather', { session_key: sessionKey });
  if (!records || records.length === 0) return null;
  return records[records.length - 1];
}

export async function getLatestTrackStatus(sessionKey: number | 'latest'): Promise<OpenF1TrackStatus | null> {
  const records = await fetchOpenF1<OpenF1TrackStatus>('track_status', { session_key: sessionKey });
  if (!records || records.length === 0) return null;
  return records[records.length - 1];
}

export function formatLapTime(seconds: number | null): string {
  if (!seconds) return '–';
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3).padStart(6, '0');
  return mins > 0 ? `${mins}:${secs}` : `${secs}`;
}

export function getTeamColor(teamName: string = ''): string {
  const normalized = teamName.toLowerCase().trim();
  if (normalized.includes('red bull')) return '#3671C6';
  if (normalized.includes('ferrari')) return '#E8002D';
  if (normalized.includes('mercedes')) return '#27F4D2';
  if (normalized.includes('mclaren')) return '#FF8000';
  if (normalized.includes('aston martin')) return '#229971';
  if (normalized.includes('alpine')) return '#FF87BC';
  if (normalized.includes('williams')) return '#64C4FF';
  if (normalized.includes('rb') || normalized.includes('vcarb') || normalized.includes('racing bulls') || normalized.includes('toro rosso') || normalized.includes('alphatauri')) return '#6692FF';
  if (normalized.includes('sauber') || normalized.includes('kick') || normalized.includes('alfa romeo')) return '#52E252';
  if (normalized.includes('haas')) return '#B6BABD';

  return '#FFFFFF';
}

export function parseTeamColor(rawColour?: string, teamName?: string): string {
  if (rawColour && rawColour.trim().length >= 3) {
    const clean = rawColour.trim().replace(/^#/, '');
    if (/^[0-9A-Fa-f]{6}$/.test(clean)) return `#${clean}`;
  }
  return getTeamColor(teamName);
}

export const TYRE_COLORS: Record<string, string> = {
  SOFT: '#FF3333',
  MEDIUM: '#FFD700',
  HARD: '#FFFFFF',
  INTERMEDIATE: '#39B54A',
  WET: '#0067FF',
  UNKNOWN: '#888888',
};


