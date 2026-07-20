'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { scaleLinear } from 'd3-scale';
import { line as d3Line, curveCatmullRom } from 'd3-shape';

export type TrackStatusType = 'CLEAR' | 'YELLOW' | 'SAFETY_CAR' | 'RED';

export interface SectorStatusMap {
  s1: 'CLEAR' | 'YELLOW';
  s2: 'CLEAR' | 'YELLOW';
  s3: 'CLEAR' | 'YELLOW';
}

export interface DriverTelemetryPosition {
  driver_number: number;
  acronym: string;
  team_colour: string;
  position: number;
  progress: number; // 0 to 1 along track coordinates
  speedKmh?: number;
}

interface ActiveTrackMapProps {
  circuitKey?: string;
  driverPositions?: DriverTelemetryPosition[];
  trackStatus?: TrackStatusType;
  sectorStatus?: SectorStatusMap;
  onStatusChange?: (status: TrackStatusType, sectors?: SectorStatusMap) => void;
}

export default function ActiveTrackMap({
  circuitKey = 'spa',
  driverPositions = [],
  trackStatus = 'CLEAR',
  sectorStatus = { s1: 'CLEAR', s2: 'CLEAR', s3: 'CLEAR' },
  onStatusChange
}: ActiveTrackMapProps) {
  const [coords, setCoords] = useState<[number, number][]>([]);
  const [circuitName, setCircuitName] = useState<string>('Spa-Francorchamps');
  const [activeDriver, setActiveDriver] = useState<DriverTelemetryPosition | null>(null);

  // Load actual telemetry / GeoJSON coordinates for circuit
  useEffect(() => {
    async function loadCircuitCoords() {
      try {
        const fileKey = circuitKey === 'albert_park' ? 'albert_park' : circuitKey;
        const res = await fetch(`/circuits/${fileKey}.json`);
        if (!res.ok) throw new Error('Circuit JSON not found');
        const data = await res.json();

        if (data.features && data.features[0]?.geometry?.coordinates) {
          const rawCoords: [number, number][] = data.features[0].geometry.coordinates;
          setCoords(rawCoords);
          setCircuitName(data.features[0].properties?.Name ?? circuitKey.toUpperCase());
        }
      } catch (e) {
        // Fallback to default Spa coordinates set if fetch fails
        setCoords([
          [5.965, 50.444], [5.963, 50.446], [5.967, 50.445], [5.97, 50.442],
          [5.974, 50.438], [5.977, 50.432], [5.976, 50.429], [5.972, 50.428],
          [5.968, 50.433], [5.962, 50.428], [5.959, 50.43], [5.965, 50.444]
        ]);
      }
    }
    loadCircuitCoords();
  }, [circuitKey]);

  // Compute SVG viewBox and D3 scales
  const viewBoxWidth = 800;
  const viewBoxHeight = 520;
  const padding = 50;

  const { pathD, getScaledPoint } = useMemo(() => {
    if (!coords || coords.length === 0) {
      return { pathD: '', getScaledPoint: () => ({ x: 400, y: 260 }) };
    }

    const xValues = coords.map(c => c[0]);
    const yValues = coords.map(c => c[1]);

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    const xScale = scaleLinear()
      .domain([minX, maxX])
      .range([padding, viewBoxWidth - padding]);

    // Flip Y scale so high latitude/y is rendered at top
    const yScale = scaleLinear()
      .domain([minY, maxY])
      .range([viewBoxHeight - padding, padding]);

    const lineGenerator = d3Line<[number, number]>()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]))
      .curve(curveCatmullRom.alpha(0.5));

    const pathDString = lineGenerator(coords) ?? '';

    const getScaledPoint = (progress: number) => {
      const idx = Math.floor(((progress % 1) + 1) % 1 * (coords.length - 1));
      const pt = coords[idx] ?? coords[0];
      return { x: xScale(pt[0]), y: yScale(pt[1]) };
    };

    return { pathD: pathDString, getScaledPoint };
  }, [coords]);

  // Track Status Banner Color & Message
  const getStatusStyles = (status: TrackStatusType) => {
    switch (status) {
      case 'CLEAR':
        return { bg: '#00A859', text: 'TRACK STATUS: CLEAR', color: '#FFFFFF' };
      case 'YELLOW':
        return { bg: '#FFD000', text: 'TRACK STATUS: YELLOW FLAG', color: '#000000', animate: true };
      case 'SAFETY_CAR':
        return { bg: '#FF9900', text: 'TRACK STATUS: SAFETY CAR / VSC', color: '#000000' };
      case 'RED':
        return { bg: '#E10600', text: 'TRACK STATUS: RED FLAG / SESSION SUSPENDED', color: '#FFFFFF' };
      default:
        return { bg: '#00A859', text: 'TRACK STATUS: CLEAR', color: '#FFFFFF' };
    }
  };

  const statusStyle = getStatusStyles(trackStatus);
  const isAnyYellow = trackStatus === 'YELLOW' || sectorStatus.s1 === 'YELLOW' || sectorStatus.s2 === 'YELLOW' || sectorStatus.s3 === 'YELLOW';

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      border: isAnyYellow ? '1px solid #FFD000' : trackStatus === 'RED' ? '1px solid #E10600' : '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      {/* 1. Dynamic Track Status Banner */}
      <div
        className={statusStyle.animate ? 'flag-banner yellow-sector-glow' : 'flag-banner'}
        style={{
          padding: '12px 18px',
          backgroundColor: statusStyle.bg,
          color: statusStyle.color,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 900,
          fontFamily: 'var(--font-display)',
          fontSize: '13px',
          letterSpacing: '2px',
          boxShadow: `0 4px 20px ${statusStyle.bg}80`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px' }}>
            {trackStatus === 'CLEAR' ? '🟢' : trackStatus === 'YELLOW' ? '⚠️' : trackStatus === 'RED' ? '🚨' : '🚔'}
          </span>
          <span>{statusStyle.text}</span>
        </div>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', opacity: 0.9 }}>
          {circuitName.toUpperCase()}
        </div>
      </div>

      {/* 2. 3-Sector Status Pill UI */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 18px',
        background: 'rgba(0, 0, 0, 0.5)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Sector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' }}>
            SECTOR STATUS:
          </span>
          {(['s1', 's2', 's3'] as (keyof SectorStatusMap)[]).map((secKey, idx) => {
            const isYellow = sectorStatus[secKey] === 'YELLOW';
            return (
              <div
                key={secKey}
                onClick={() => {
                  const nextSectors = { ...sectorStatus, [secKey]: isYellow ? 'CLEAR' : 'YELLOW' };
                  const hasYellow = nextSectors.s1 === 'YELLOW' || nextSectors.s2 === 'YELLOW' || nextSectors.s3 === 'YELLOW';
                  onStatusChange?.(hasYellow ? 'YELLOW' : 'CLEAR', nextSectors);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  background: isYellow ? 'rgba(255, 208, 0, 0.2)' : 'rgba(0, 168, 89, 0.15)',
                  border: isYellow ? '1px solid #FFD000' : '1px solid #00A859',
                  color: isYellow ? '#FFD000' : '#00A859',
                  fontFamily: 'var(--font-display)',
                  fontSize: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isYellow ? '#FFD000' : '#00A859',
                  boxShadow: `0 0 6px ${isYellow ? '#FFD000' : '#00A859'}`
                }} />
                SECTOR {idx + 1}: {isYellow ? 'YELLOW' : 'CLEAR'}
              </div>
            );
          })}
        </div>

        {/* Global Override Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['CLEAR', 'YELLOW', 'SAFETY_CAR', 'RED'] as TrackStatusType[]).map((st) => (
            <button
              key={st}
              onClick={() => {
                const secMap: SectorStatusMap = st === 'YELLOW'
                  ? { s1: 'CLEAR', s2: 'YELLOW', s3: 'CLEAR' }
                  : { s1: 'CLEAR', s2: 'CLEAR', s3: 'CLEAR' };
                onStatusChange?.(st, secMap);
              }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '10px',
                fontWeight: 800,
                padding: '4px 8px',
                borderRadius: '4px',
                border: trackStatus === st ? `1px solid ${getStatusStyles(st).bg}` : '1px solid rgba(255,255,255,0.1)',
                background: trackStatus === st ? getStatusStyles(st).bg : 'rgba(255,255,255,0.05)',
                color: trackStatus === st && (st === 'YELLOW' || st === 'CLEAR') ? '#000' : '#fff',
                cursor: 'pointer'
              }}
            >
              {st === 'SAFETY_CAR' ? 'SC/VSC' : st}
            </button>
          ))}
        </div>
      </div>

      {/* 3. D3 Telemetry Viewport & Drivers Map */}
      <div className=".telemetry-viewport" style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        minHeight: '380px'
      }}>
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          style={{ width: '100%', height: '100%', maxHeight: '460px', filter: 'drop-shadow(0 0 12px rgba(0,0,0,0.9))' }}
        >
          {/* Track Outer Glow Base */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Track Asphalt Surface */}
          <path
            d={pathD}
            fill="none"
            stroke="#161622"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Yellow Sector Overlay */}
          {isAnyYellow && (
            <path
              d={pathD}
              fill="none"
              stroke="#FFD000"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="60 20"
              className="yellow-sector-glow"
              opacity="0.8"
            />
          )}

          {/* D3 Rendered Glowing White Track Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))' }}
          />

          {/* Live Driver Circle Nodes using D3 Scaled Points */}
          {driverPositions.map((dp) => {
            const pt = getScaledPoint(dp.progress);
            const teamColor = dp.team_colour.startsWith('#') ? dp.team_colour : `#${dp.team_colour}`;
            const isHovered = activeDriver?.driver_number === dp.driver_number;

            return (
              <g
                key={dp.driver_number}
                transform={`translate(${pt.x}, ${pt.y})`}
                onMouseEnter={() => setActiveDriver(dp)}
                onMouseLeave={() => setActiveDriver(null)}
                style={{
                  cursor: 'pointer',
                  transition: 'transform 0.5s linear'
                }}
              >
                {/* Glowing Outer Ring */}
                <circle
                  r={dp.position === 1 ? '11' : '8'}
                  fill="none"
                  stroke={teamColor}
                  strokeWidth="2.5"
                  opacity={isHovered || dp.position === 1 ? '0.9' : '0.4'}
                  style={{ filter: `drop-shadow(0 0 6px ${teamColor})` }}
                />

                {/* Driver Core Dot */}
                <circle
                  r={dp.position === 1 ? '6' : '4.5'}
                  fill={teamColor}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />

                {/* Driver Tag */}
                <text
                  x="10"
                  y="4"
                  fill="#FFFFFF"
                  fontSize={isHovered ? '12px' : '9.5px'}
                  fontWeight="900"
                  fontFamily="var(--font-display)"
                  style={{
                    textShadow: '0 0 4px #000000, 0 0 8px #000000',
                    pointerEvents: 'none'
                  }}
                >
                  P{dp.position} {dp.acronym}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {activeDriver && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            background: 'rgba(12, 12, 18, 0.9)',
            border: `1px solid ${activeDriver.team_colour}`,
            padding: '8px 14px',
            borderRadius: '6px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            zIndex: 10
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '13px', color: '#FFF' }}>
              P{activeDriver.position} — {activeDriver.acronym} (#{activeDriver.driver_number})
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              TELEMETRY SPEED: {activeDriver.speedKmh ?? 312} KM/H
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
