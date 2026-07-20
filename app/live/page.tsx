'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import LiveTimingTower, { DriverTimingData } from '@/components/LiveTimingTower';
import ActiveTrackMap, { DriverTelemetryPosition, TrackStatusType, SectorStatusMap } from '@/components/ActiveTrackMap';
import WeatherStrategyCenter, { TireDegradationInfo, PitStrategyWindow } from '@/components/WeatherStrategyCenter';
import type { OpenF1Session, OpenF1Driver, OpenF1Position, OpenF1Lap, OpenF1Stint, OpenF1Interval, OpenF1Weather, OpenF1TrackStatus, OpenF1Location } from '@/lib/openf1';
import { formatLapTime, parseTeamColor } from '@/lib/openf1';
import { CIRCUITS } from '@/lib/circuits';
import { calculateTireDegradation } from '@/lib/tireDegradation';

const MOCK_DRIVERS_BASE = [
  { driver_number: 12, acronym: 'ANT', full_name: 'Kimi Antonelli', team_name: 'Mercedes', team_colour: '#27F4D2', defaultCompound: 'MEDIUM' },
  { driver_number: 16, acronym: 'LEC', full_name: 'Charles Leclerc', team_name: 'Ferrari', team_colour: '#E8002D', defaultCompound: 'HARD' },
  { driver_number: 1, acronym: 'VER', full_name: 'Max Verstappen', team_name: 'Red Bull Racing', team_colour: '#3671C6', defaultCompound: 'MEDIUM' },
  { driver_number: 4, acronym: 'NOR', full_name: 'Lando Norris', team_name: 'McLaren', team_colour: '#FF8000', defaultCompound: 'MEDIUM' },
  { driver_number: 81, acronym: 'PIA', full_name: 'Oscar Piastri', team_name: 'McLaren', team_colour: '#FF8000', defaultCompound: 'MEDIUM' },
  { driver_number: 44, acronym: 'HAM', full_name: 'Lewis Hamilton', team_name: 'Ferrari', team_colour: '#E8002D', defaultCompound: 'HARD' },
  { driver_number: 63, acronym: 'RUS', full_name: 'George Russell', team_name: 'Mercedes', team_colour: '#27F4D2', defaultCompound: 'MEDIUM' },
  { driver_number: 55, acronym: 'SAI', full_name: 'Carlos Sainz', team_name: 'Williams', team_colour: '#64C4FF', defaultCompound: 'HARD' },
  { driver_number: 14, acronym: 'ALO', full_name: 'Fernando Alonso', team_name: 'Aston Martin', team_colour: '#229971', defaultCompound: 'SOFT' },
  { driver_number: 18, acronym: 'STR', full_name: 'Lance Stroll', team_name: 'Aston Martin', team_colour: '#229971', defaultCompound: 'MEDIUM' },
  { driver_number: 22, acronym: 'TSU', full_name: 'Yuki Tsunoda', team_name: 'RB', team_colour: '#6692FF', defaultCompound: 'SOFT' },
  { driver_number: 10, acronym: 'GAS', full_name: 'Pierre Gasly', team_name: 'Alpine', team_colour: '#FF87BC', defaultCompound: 'MEDIUM' },
  { driver_number: 31, acronym: 'OCO', full_name: 'Esteban Ocon', team_name: 'Haas F1 Team', team_colour: '#B6BABD', defaultCompound: 'HARD' },
  { driver_number: 23, acronym: 'ALB', full_name: 'Alexander Albon', team_name: 'Williams', team_colour: '#64C4FF', defaultCompound: 'MEDIUM' },
  { driver_number: 27, acronym: 'HUL', full_name: 'Nico Hulkenberg', team_name: 'Kick Sauber', team_colour: '#52E252', defaultCompound: 'HARD' },
  { driver_number: 87, acronym: 'BEA', full_name: 'Oliver Bearman', team_name: 'Haas F1 Team', team_colour: '#B6BABD', defaultCompound: 'MEDIUM' },
  { driver_number: 77, acronym: 'BOT', full_name: 'Valtteri Bottas', team_name: 'Kick Sauber', team_colour: '#52E252', defaultCompound: 'HARD' },
  { driver_number: 6, acronym: 'HAD', full_name: 'Isack Hadjar', team_name: 'RB', team_colour: '#6692FF', defaultCompound: 'SOFT' },
];

const CALENDAR_CIRCUIT_ORDER: string[] = [
  'bahrain',        // Round 1
  'jeddah',         // Round 2
  'albert_park',    // Round 3
  'suzuka',         // Round 4
  'shanghai',       // Round 5
  'miami',          // Round 6
  'imola',          // Round 7
  'monaco',         // Round 8
  'villeneuve',     // Round 9  — CIRCUITS key for Montreal
  'catalunya',      // Round 10 — CIRCUITS key for Barcelona
  'red_bull_ring',  // Round 11 — CIRCUITS key for Spielberg
  'silverstone',    // Round 12
  'hungaroring',    // Round 13
  'spa',            // Round 14
  'zandvoort',      // Round 15
  'monza',          // Round 16
  'baku',           // Round 17
  'marina_bay',     // Round 18 — CIRCUITS key for Singapore
  'americas',       // Round 19 — CIRCUITS key for COTA
  'rodriguez',      // Round 20 — CIRCUITS key for Mexico City
  'interlagos',     // Round 21
  'las_vegas',      // Round 22
  'losail',         // Round 23 — CIRCUITS key for Lusail
  'yas_marina',     // Round 24
];

const CIRCUIT_COUNTRY_CODES: Record<string, string> = {
  bahrain: 'bh',
  jeddah: 'sa',
  albert_park: 'au',
  suzuka: 'jp',
  shanghai: 'cn',
  miami: 'us',
  imola: 'it',
  monaco: 'mc',
  villeneuve: 'ca',
  catalunya: 'es',
  red_bull_ring: 'at',
  silverstone: 'gb',
  hungaroring: 'hu',
  spa: 'be',
  zandvoort: 'nl',
  monza: 'it',
  baku: 'az',
  marina_bay: 'sg',
  americas: 'us',
  rodriguez: 'mx',
  interlagos: 'br',
  las_vegas: 'us',
  losail: 'qa',
  yas_marina: 'ae',
};

const SESSION_KEYS_BY_CIRCUIT: Record<string, number> = {
  bahrain: 9472,        // Round 1: Bahrain GP
  jeddah: 9480,         // Round 2: Saudi Arabia GP
  albert_park: 9488,    // Round 3: Australia GP
  suzuka: 9496,         // Round 4: Japan GP
  shanghai: 9673,       // Round 5: China GP
  miami: 9507,          // Round 6: Miami GP
  imola: 9515,          // Round 7: Imola GP
  monaco: 9523,         // Round 8: Monaco GP
  villeneuve: 9531,     // Round 9: Canada GP
  catalunya: 9539,      // Round 10: Spain GP
  red_bull_ring: 9550,  // Round 11: Austria GP
  silverstone: 9558,    // Round 12: Silverstone GP
  hungaroring: 9566,    // Round 13: Hungary GP
  spa: 9574,            // Round 14: Belgian GP
  zandvoort: 9582,      // Round 15: Netherlands GP
  monza: 9590,          // Round 16: Italian GP
  baku: 9598,           // Round 17: Azerbaijan GP
  marina_bay: 9606,     // Round 18: Singapore GP
  americas: 9617,       // Round 19: USA Austin GP
  rodriguez: 9625,      // Round 20: Mexico GP
  interlagos: 9636,     // Round 21: Brazil GP
  las_vegas: 9644,      // Round 22: Las Vegas GP
  losail: 9655,         // Round 23: Qatar GP
  yas_marina: 9662,     // Round 24: Abu Dhabi GP
};

export default function LivePage() {
  const [session, setSession] = useState<OpenF1Session | null>(null);
  const [useRealData, setUseRealData] = useState<boolean>(true);
  const [loadingRealData, setLoadingRealData] = useState<boolean>(false);
  const [trackStatus, setTrackStatus] = useState<TrackStatusType>('CLEAR');
  const [sectorStatus, setSectorStatus] = useState<SectorStatusMap>({ s1: 'CLEAR', s2: 'CLEAR', s3: 'CLEAR' });
  const [weather, setWeather] = useState<OpenF1Weather | null>(null);
  const [selectedCircuitKey, setSelectedCircuitKey] = useState<string>('spa');
  const [isCircuitDropdownOpen, setIsCircuitDropdownOpen] = useState<boolean>(false);

  // Dashboard Data States
  const [timingDrivers, setTimingDrivers] = useState<DriverTimingData[]>([]);
  const [telemetryPositions, setTelemetryPositions] = useState<DriverTelemetryPosition[]>([]);
  const [tireDegradation, setTireDegradation] = useState<TireDegradationInfo[]>([]);
  const [lapCount, setLapCount] = useState({ current: 44, total: 44 });

  // 60fps simulation state ref
  const simProgressRef = useRef<Record<number, number>>({});
  const animFrameRef = useRef<number | null>(null);

  // Initialize simulation drivers
  const initSimulation = useCallback(() => {
    const initialProgress: Record<number, number> = {};

    const timingData: DriverTimingData[] = MOCK_DRIVERS_BASE.map((d, index) => {
      const prog = (1 - index * 0.045 + 1) % 1;
      initialProgress[d.driver_number] = prog;
      const gapToLeader = index === 0 ? 'LEADER' : `+${(index * 1.4 + Math.random() * 0.3).toFixed(3)}s`;

      return {
        driver_number: d.driver_number,
        acronym: d.acronym,
        full_name: d.full_name,
        team_name: d.team_name,
        team_colour: d.team_colour,
        position: index + 1,
        compound: d.defaultCompound,
        tyre_age: 10 + Math.floor(Math.random() * 8),
        interval: gapToLeader,
        gap_to_leader: gapToLeader,
        last_lap: `1:47.${Math.floor(100 + Math.random() * 800)}`,
        is_fastest_lap: index === 0,
      };
    });

    simProgressRef.current = initialProgress;
    setTimingDrivers(timingData);

    const totalCircuitLaps = CIRCUITS[selectedCircuitKey]?.laps || 44;
    setLapCount({ current: totalCircuitLaps, total: totalCircuitLaps });

    setTireDegradation([
      { compound: 'MEDIUM', wearPercent: calculateTireDegradation(selectedCircuitKey, 'MEDIUM', 14), lapsUsed: 14 },
      { compound: 'HARD', wearPercent: calculateTireDegradation(selectedCircuitKey, 'HARD', 18), lapsUsed: 18 },
      { compound: 'SOFT', wearPercent: calculateTireDegradation(selectedCircuitKey, 'SOFT', 11), lapsUsed: 11 },
    ]);

    setWeather({
      air_temperature: 23.4,
      track_temperature: 36.8,
      humidity: 48,
      rainfall: 0,
      wind_speed: 12,
      wind_direction: 180,
      date: new Date().toISOString(),
      session_key: 0,
      meeting_key: 0,
    });
  }, [selectedCircuitKey]);

  // Fetch real OpenF1 session telemetry & timing tower data
  const fetchRealOpenF1Data = useCallback(async () => {
    setLoadingRealData(true);

    // Clear stale data immediately so old race info doesn't linger
    setTimingDrivers([]);
    setTelemetryPositions([]);
    setSession(null);

    try {
      const BASE = 'https://api.openf1.org/v1';
      const targetSessionKey = SESSION_KEYS_BY_CIRCUIT[selectedCircuitKey] || 9574;

      const [sessionRes, driversRes, posRes, lapsRes, stintsRes, intervalsRes, weatherRes, trackRes, locRes] = await Promise.all([
        fetch(`${BASE}/sessions?session_key=${targetSessionKey}`).catch(() => null),
        fetch(`${BASE}/drivers?session_key=${targetSessionKey}`).catch(() => null),
        fetch(`${BASE}/position?session_key=${targetSessionKey}`).catch(() => null),
        fetch(`${BASE}/laps?session_key=${targetSessionKey}`).catch(() => null),
        fetch(`${BASE}/stints?session_key=${targetSessionKey}`).catch(() => null),
        fetch(`${BASE}/intervals?session_key=${targetSessionKey}`).catch(() => null),
        fetch(`${BASE}/weather?session_key=${targetSessionKey}`).catch(() => null),
        fetch(`${BASE}/track_status?session_key=${targetSessionKey}`).catch(() => null),
        fetch(`${BASE}/location?session_key=${targetSessionKey}`).catch(() => null),
      ]);

      const sessions: OpenF1Session[] = sessionRes ? await sessionRes.json() : [];
      const drivers: OpenF1Driver[] = driversRes ? await driversRes.json() : [];
      const allPositions: OpenF1Position[] = posRes ? await posRes.json() : [];
      const allLaps: OpenF1Lap[] = lapsRes ? await lapsRes.json() : [];
      const stints: OpenF1Stint[] = stintsRes ? await stintsRes.json() : [];
      const allIntervals: OpenF1Interval[] = intervalsRes ? await intervalsRes.json() : [];
      const weatherRecords: OpenF1Weather[] = weatherRes ? await weatherRes.json() : [];
      const trackRecords: OpenF1TrackStatus[] = trackRes ? await trackRes.json() : [];
      const locations: OpenF1Location[] = locRes ? await locRes.json() : [];

      if (sessions && sessions.length > 0) {
        setSession(sessions[0]);
      }

      // 1. Process Timing Tower Rows
      if (drivers && drivers.length > 0) {
        // Latest position per driver
        const posMap = new Map<number, OpenF1Position>();
        allPositions.forEach(p => {
          const ex = posMap.get(p.driver_number);
          if (!ex || new Date(p.date) > new Date(ex.date)) posMap.set(p.driver_number, p);
        });

        // Latest stint per driver
        const stintMap = new Map<number, OpenF1Stint>();
        stints.forEach(s => {
          const ex = stintMap.get(s.driver_number);
          if (!ex || s.stint_number > ex.stint_number) stintMap.set(s.driver_number, s);
        });

        // Latest interval per driver
        const intervalMap = new Map<number, OpenF1Interval>();
        allIntervals.forEach(i => {
          const ex = intervalMap.get(i.driver_number);
          if (!ex || new Date(i.date) > new Date(ex.date)) intervalMap.set(i.driver_number, i);
        });

        // Latest lap per driver
        const lapMap = new Map<number, OpenF1Lap>();
        allLaps.forEach(l => {
          const ex = lapMap.get(l.driver_number);
          if (!ex || l.lap_number > ex.lap_number) lapMap.set(l.driver_number, l);
        });

        // Calculate real live current lap number and session status
        const totalCircuitLaps = CIRCUITS[selectedCircuitKey]?.laps || 44;
        const maxRealLap = allLaps.length > 0 ? Math.max(1, ...allLaps.map(l => l.lap_number)) : 1;
        const isSessionFinished = sessions[0]?.status === 'Finished' || maxRealLap >= totalCircuitLaps;

        const currentLapNumber = isSessionFinished ? totalCircuitLaps : Math.min(maxRealLap, totalCircuitLaps);
        setLapCount({
          current: currentLapNumber,
          total: totalCircuitLaps,
        });

        // Calculate dynamic tire degradation from stint data
        if (stints && stints.length > 0) {
          const compUsage = new Map<string, { totalLaps: number; count: number }>();
          stints.forEach(s => {
            const comp = (s.compound || 'MEDIUM').toUpperCase();
            const lapObj = lapMap.get(s.driver_number);
            const lapsOnStint = Math.max(1, (lapObj?.lap_number ?? currentLapNumber) - s.lap_start + 1 + (s.tyre_age_at_start || 0));
            const curr = compUsage.get(comp) || { totalLaps: 0, count: 0 };
            compUsage.set(comp, { totalLaps: curr.totalLaps + lapsOnStint, count: curr.count + 1 });
          });

          const degList: TireDegradationInfo[] = Array.from(compUsage.entries()).map(([comp, val]) => {
            const avgLaps = Math.round(val.totalLaps / val.count);
            const wearPercent = calculateTireDegradation(selectedCircuitKey, comp, avgLaps);
            return { compound: comp, wearPercent, lapsUsed: avgLaps };
          });

          if (degList.length > 0) setTireDegradation(degList);
        }

        // Fastest overall lap duration
        const fastestDuration = Math.min(...allLaps.map(l => l.lap_duration ?? Infinity).filter(t => t < Infinity));

        const parsedTiming: DriverTimingData[] = drivers.map(d => {
          const posObj = posMap.get(d.driver_number);
          const stObj = stintMap.get(d.driver_number);
          const intObj = intervalMap.get(d.driver_number);
          const lapObj = lapMap.get(d.driver_number);

          const position = posObj?.position ?? 99;
          const compound = stObj?.compound ?? 'MEDIUM';
          const tyreAge = stObj ? (lapObj?.lap_number ?? currentLapNumber) - stObj.lap_start + 1 : 10;
          const interval = intObj?.interval != null ? (intObj.interval === 0 ? 'LEADER' : `+${intObj.interval.toFixed(3)}s`) : '–';
          const gapToLeader = intObj?.gap_to_leader != null ? (intObj.gap_to_leader === 0 ? 'LEADER' : `+${intObj.gap_to_leader.toFixed(3)}s`) : '–';
          const lastLapStr = formatLapTime(lapObj?.lap_duration ?? null);
          const isFastest = lapObj?.lap_duration === fastestDuration && fastestDuration < Infinity;

          return {
            driver_number: d.driver_number,
            acronym: d.name_acronym ?? d.last_name.slice(0, 3).toUpperCase(),
            full_name: d.full_name,
            team_name: d.team_name,
            team_colour: parseTeamColor(d.team_colour, d.team_name),
            position,
            compound,
            tyre_age: Math.max(1, tyreAge),
            interval: position === 1 ? 'LEADER' : interval,
            gap_to_leader: gapToLeader,
            last_lap: lastLapStr,
            is_fastest_lap: isFastest,
          };
        }).sort((a, b) => a.position - b.position);

        if (parsedTiming.length > 0) {
          setTimingDrivers(parsedTiming);
        } else {
          initSimulation();
        }
      } else {
        initSimulation();
      }

      // 2. Process Weather
      if (weatherRecords && weatherRecords.length > 0) {
        setWeather(weatherRecords[weatherRecords.length - 1]);
      }

      // 3. Process Track Status Flags
      if (trackRecords && trackRecords.length > 0) {
        const latestStatus = trackRecords[trackRecords.length - 1].status;
        if (latestStatus === '1') setTrackStatus('CLEAR');
        else if (latestStatus === '2' || latestStatus === '3') setTrackStatus('YELLOW');
        else if (latestStatus === '4' || latestStatus === '6') setTrackStatus('SAFETY_CAR');
        else if (latestStatus === '5') setTrackStatus('RED');
      }

      // 4. Process Driver Coordinates for Track Map
      if (locations && locations.length > 0) {
        const latestLocMap = new Map<number, OpenF1Location>();
        locations.forEach(l => {
          const ex = latestLocMap.get(l.driver_number);
          if (!ex || new Date(l.date) > new Date(ex.date)) latestLocMap.set(l.driver_number, l);
        });

        const realPositions: DriverTelemetryPosition[] = Array.from(latestLocMap.values()).map((loc, idx) => {
          const driverInfo = drivers.find(d => d.driver_number === loc.driver_number);
          return {
            driver_number: loc.driver_number,
            acronym: driverInfo?.name_acronym ?? `D${loc.driver_number}`,
            team_colour: parseTeamColor(driverInfo?.team_colour, driverInfo?.team_name),
            position: idx + 1,
            progress: ((loc.x + loc.y) % 1000) / 1000,
            speedKmh: 310,
          };
        });

        if (realPositions.length > 0) setTelemetryPositions(realPositions);
      }
    } catch (e) {
      initSimulation();
    } finally {
      setLoadingRealData(false);
    }
  }, [selectedCircuitKey, initSimulation]);

  // Initial load and periodic polling for real OpenF1 data
  useEffect(() => {
    if (useRealData) {
      fetchRealOpenF1Data();
      const timer = setInterval(fetchRealOpenF1Data, 10000);
      return () => clearInterval(timer);
    } else {
      initSimulation();
    }
  }, [useRealData, fetchRealOpenF1Data, initSimulation]);

  // 60fps Telemetry Simulation Loop (when running simulation or smooth interpolation)
  useEffect(() => {
    if (useRealData) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const speedFactor = trackStatus === 'RED' ? 0 : trackStatus === 'SAFETY_CAR' ? 0.005 : trackStatus === 'YELLOW' ? 0.012 : 0.025;
      const newPositions: DriverTelemetryPosition[] = [];

      MOCK_DRIVERS_BASE.forEach((d, index) => {
        const currentProg = simProgressRef.current[d.driver_number] ?? (1 - index * 0.045);
        const driverSpeed = speedFactor * (1 + (18 - index) * 0.002);
        const nextProg = (currentProg + dt * driverSpeed) % 1;

        simProgressRef.current[d.driver_number] = nextProg;

        newPositions.push({
          driver_number: d.driver_number,
          acronym: d.acronym,
          team_colour: d.team_colour,
          position: index + 1,
          progress: nextProg,
          speedKmh: Math.round(trackStatus === 'RED' ? 0 : 280 + Math.sin(nextProg * Math.PI * 4) * 45),
        });
      });

      setTelemetryPositions(newPositions);

      if (Math.random() < 0.005) {
        setWeather(prev => prev ? {
          ...prev,
          track_temperature: +(36 + Math.sin(currentTime / 5000) * 2.5).toFixed(1),
          air_temperature: +(23 + Math.cos(currentTime / 8000) * 1.2).toFixed(1),
        } : null);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [useRealData, trackStatus]);

  const handleStatusChange = (status: TrackStatusType, sectors?: SectorStatusMap) => {
    setTrackStatus(status);
    if (sectors) setSectorStatus(sectors);
  };

  return (
    <div className="page-wrap" style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 20px' }}>
      {/* HUD Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'rgba(18, 18, 26, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '14px 20px',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: 900,
            letterSpacing: '2px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ color: 'var(--accent)' }}>🏎️</span> LIVE RACE CONTROL
          </div>

          {/* Mode Switcher Toggle */}
          <button
            onClick={() => setUseRealData(!useRealData)}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '1px',
              padding: '4px 10px',
              borderRadius: '4px',
              background: useRealData ? 'rgba(0, 255, 102, 0.15)' : 'rgba(255, 128, 0, 0.15)',
              color: useRealData ? '#00FF66' : '#FF8000',
              border: useRealData ? '1px solid rgba(0, 255, 102, 0.3)' : '1px solid rgba(255, 128, 0, 0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: useRealData ? '#00FF66' : '#FF8000',
              boxShadow: `0 0 6px ${useRealData ? '#00FF66' : '#FF8000'}`
            }} />
            {useRealData ? (loadingRealData ? 'FETCHING OPENF1 API DATA...' : 'OPENF1 REAL DATA FEED') : 'INTERACTIVE SIMULATION HUD'}
          </button>
        </div>

        {/* Circuit Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
            CIRCUIT HUD:
          </span>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsCircuitDropdownOpen(!isCircuitDropdownOpen)}
              style={{
                background: 'rgba(0, 0, 0, 0.75)',
                color: '#FFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                padding: '6px 14px',
                fontFamily: 'var(--font-display)',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
            >
              <span style={{ color: '#FFD700', fontSize: '10px', fontWeight: 900 }}>
                R{CALENDAR_CIRCUIT_ORDER.indexOf(selectedCircuitKey) + 1}
              </span>
              <img
                src={`https://flagcdn.com/w40/${CIRCUIT_COUNTRY_CODES[selectedCircuitKey] || 'be'}.png`}
                alt="flag"
                style={{ width: '18px', height: '12px', borderRadius: '2px', objectFit: 'cover' }}
              />
              <span>{CIRCUITS[selectedCircuitKey]?.name}</span>
              <span style={{ fontSize: '9px', opacity: 0.6, marginLeft: '4px' }}>▼</span>
            </button>

            {isCircuitDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  zIndex: 1000,
                  background: '#0D0E12',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '6px',
                  width: '340px',
                  maxHeight: '380px',
                  overflowY: 'auto',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.85)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                {CALENDAR_CIRCUIT_ORDER.map((circuitKey, idx) => {
                  const c = CIRCUITS[circuitKey];
                  if (!c) return null;
                  const isSelected = selectedCircuitKey === circuitKey;
                  const code = CIRCUIT_COUNTRY_CODES[circuitKey] || 'be';

                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCircuitKey(c.id);
                        const totalLaps = c.laps || 44;
                        setLapCount(prev => ({ current: Math.min(prev.current, totalLaps), total: totalLaps }));
                        setIsCircuitDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: isSelected ? 'rgba(225, 6, 0, 0.25)' : 'transparent',
                        border: isSelected ? '1px solid rgba(225, 6, 0, 0.5)' : '1px solid transparent',
                        color: isSelected ? '#FFF' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'var(--font-display)',
                        fontSize: '11px',
                        fontWeight: isSelected ? 800 : 600,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span style={{ fontSize: '10px', color: '#FFD700', width: '26px', fontWeight: 900 }}>
                        R{idx + 1}
                      </span>
                      <img
                        src={`https://flagcdn.com/w40/${code}.png`}
                        alt={c.country}
                        style={{ width: '20px', height: '14px', borderRadius: '2px', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.name} <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>({c.country})</span>
                      </div>
                      {isSelected && <span style={{ color: '#E10600', fontSize: '12px', fontWeight: 900 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3-Column Grid HUD */}
      <div className="race-control-grid" style={{ position: 'relative' }}>
        {/* Loading Overlay */}
        {loadingRealData && timingDrivers.length === 0 && (
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(5, 5, 7, 0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius-lg)',
            gap: '16px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(225, 6, 0, 0.2)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '2px',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}>
              Loading {CIRCUITS[selectedCircuitKey]?.name ?? 'Circuit'} Data…
            </div>
          </div>
        )}

        {/* Column 1: Live Timing Tower */}
        <LiveTimingTower
          drivers={timingDrivers}
          sessionName={session?.session_name ?? 'GRAND PRIX'}
          lapCount={lapCount}
        />

        {/* Column 2: Active Track Map & Flag Warnings */}
        <ActiveTrackMap
          circuitKey={selectedCircuitKey}
          driverPositions={telemetryPositions}
          trackStatus={trackStatus}
          sectorStatus={sectorStatus}
          onStatusChange={handleStatusChange}
        />

        {/* Column 3: Weather & Pit Strategy Center */}
        <WeatherStrategyCenter
          weather={weather}
          tireDegradation={tireDegradation}
        />
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
