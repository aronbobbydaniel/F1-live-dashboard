'use client';
import { useEffect, useState, useCallback } from 'react';
import type { OpenF1Driver, OpenF1Position, OpenF1Lap, OpenF1Stint, OpenF1PitStop, OpenF1Interval, OpenF1Session } from '@/lib/openf1';
import { formatLapTime, TYRE_COLORS } from '@/lib/openf1';

interface TimingRow {
  driver: OpenF1Driver;
  position: number;
  lastLap: OpenF1Lap | null;
  currentStint: OpenF1Stint | null;
  pitStops: number;
  gap: string;
  interval: string;
}

interface TimingTowerProps {
  session: OpenF1Session;
  drivers: OpenF1Driver[];
  positions: OpenF1Position[];
  laps: OpenF1Lap[];
  stints: OpenF1Stint[];
  pitStops: OpenF1PitStop[];
  intervals: OpenF1Interval[];
}

export default function TimingTower({
  session, drivers, positions, laps, stints, pitStops, intervals
}: TimingTowerProps) {
  const driverMap = new Map(drivers.map(d => [d.driver_number, d]));
  const lapMap = new Map(laps.map(l => [l.driver_number, l]));
  const intervalMap = new Map(intervals.map(i => [i.driver_number, i]));

  const pitCountMap = new Map<number, number>();
  for (const pit of pitStops) {
    pitCountMap.set(pit.driver_number, (pitCountMap.get(pit.driver_number) ?? 0) + 1);
  }

  const currentStintMap = new Map<number, OpenF1Stint>();
  for (const stint of stints) {
    const existing = currentStintMap.get(stint.driver_number);
    if (!existing || stint.stint_number > existing.stint_number) {
      currentStintMap.set(stint.driver_number, stint);
    }
  }

  const rows: TimingRow[] = positions.map(pos => {
    const driver = driverMap.get(pos.driver_number);
    if (!driver) return null;
    const iv = intervalMap.get(pos.driver_number);
    const gap = iv?.gap_to_leader != null ? (iv.gap_to_leader === 0 ? 'LEADER' : `+${iv.gap_to_leader.toFixed(3)}`) : '–';
    const interval = iv?.interval != null ? (iv.interval === 0 ? '–' : `+${iv.interval.toFixed(3)}`) : '–';
    return {
      driver,
      position: pos.position,
      lastLap: lapMap.get(pos.driver_number) ?? null,
      currentStint: currentStintMap.get(pos.driver_number) ?? null,
      pitStops: pitCountMap.get(pos.driver_number) ?? 0,
      gap,
      interval,
    } as TimingRow;
  }).filter(Boolean) as TimingRow[];

  const fastestLapTime = Math.min(...laps.map(l => l.lap_duration ?? Infinity).filter(t => t < Infinity));
  const fastestLapDriver = laps.find(l => l.lap_duration === fastestLapTime)?.driver_number;

  return (
    <div className="timing-tower">
      {/* Session Header */}
      <div className="timing-header">
        <div className="timing-session-name">
          <span className="timing-dot" />
          {session.session_name} — {session.location}, {session.country_name}
        </div>
        <div className="timing-status" data-status={session.status}>
          {session.status?.toUpperCase() ?? 'FINISHED'}
        </div>
      </div>

      {/* Column Headers */}
      <div className="timing-col-headers">
        <span>POS</span>
        <span>DRIVER</span>
        <span>TYRE</span>
        <span>GAP</span>
        <span>INTERVAL</span>
        <span>LAST LAP</span>
        <span>PITS</span>
      </div>

      {/* Rows */}
      <div className="timing-rows">
        {rows.map((row, idx) => {
          const color = `#${row.driver.team_colour ?? 'FFFFFF'}`;
          const tyre = row.currentStint?.compound ?? 'UNKNOWN';
          const tyreColor = TYRE_COLORS[tyre] ?? '#888';
          const isFastest = row.driver.driver_number === fastestLapDriver;

          return (
            <div
              key={row.driver.driver_number}
              className={`timing-row ${isFastest ? 'timing-row--fastest' : ''}`}
              style={{ '--team-color': color } as React.CSSProperties}
            >
              {/* Position */}
              <div className="timing-pos" style={{ borderLeftColor: color }}>
                {row.position}
              </div>

              {/* Driver */}
              <div className="timing-driver">
                <span className="timing-driver-num" style={{ color }}>{row.driver.driver_number}</span>
                <span className="timing-driver-code">{row.driver.name_acronym}</span>
                <span className="timing-driver-team">{row.driver.team_name}</span>
              </div>

              {/* Tyre */}
              <div className="timing-tyre">
                <span
                  className="tyre-badge"
                  style={{ backgroundColor: tyreColor, color: tyre === 'HARD' ? '#000' : tyre === 'MEDIUM' ? '#000' : '#fff' }}
                >
                  {tyre[0]}
                </span>
                {row.currentStint && (
                  <span className="tyre-laps">{(row.lastLap?.lap_number ?? 0) - (row.currentStint.lap_start ?? 0) + 1}L</span>
                )}
              </div>

              {/* Gap */}
              <div className="timing-gap">
                {row.gap}
              </div>

              {/* Interval */}
              <div className="timing-interval">
                {idx === 0 ? '–' : row.interval}
              </div>

              {/* Last Lap */}
              <div className={`timing-lastlap ${isFastest ? 'fastest-lap' : ''}`}>
                {formatLapTime(row.lastLap?.lap_duration ?? null)}
                {isFastest && <span className="fastest-tag">FL</span>}
              </div>

              {/* Pit Stops */}
              <div className="timing-pits">
                {row.pitStops > 0 ? row.pitStops : '–'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
