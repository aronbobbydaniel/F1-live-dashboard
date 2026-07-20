'use client';

import React from 'react';
import type { OpenF1Weather } from '@/lib/openf1';
import { TYRE_COLORS } from '@/lib/openf1';

export interface TireDegradationInfo {
  compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET' | string;
  wearPercent: number; // 0 to 100
  lapsUsed: number;
}

export interface PitStrategyWindow {
  stintNumber: number;
  fromCompound: string;
  toCompound: string;
  startLap: number;
  endLap: number;
  isCurrent?: boolean;
}

interface WeatherStrategyCenterProps {
  weather?: OpenF1Weather | null;
  tireDegradation?: TireDegradationInfo[];
  predictedStrategies?: PitStrategyWindow[];
}

export default function WeatherStrategyCenter({
  weather,
  tireDegradation = [
    { compound: 'MEDIUM', wearPercent: 42, lapsUsed: 14 },
    { compound: 'HARD', wearPercent: 18, lapsUsed: 6 },
    { compound: 'SOFT', wearPercent: 78, lapsUsed: 9 },
  ],
  predictedStrategies = [
    { stintNumber: 1, fromCompound: 'MEDIUM', toCompound: 'HARD', startLap: 18, endLap: 24, isCurrent: true },
    { stintNumber: 2, fromCompound: 'HARD', toCompound: 'SOFT', startLap: 42, endLap: 46 },
  ]
}: WeatherStrategyCenterProps) {
  const airTemp = weather?.air_temperature ?? 24.5;
  const trackTemp = weather?.track_temperature ?? 38.2;
  const humidity = weather?.humidity ?? 45;
  const rainChance = weather?.rainfall ?? 0;

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', padding: '16px' }}>
      {/* Panel Header */}
      <div style={{
        paddingBottom: '10px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '12px',
          fontWeight: 800,
          letterSpacing: '1.5px',
          color: '#FFFFFF',
          textTransform: 'uppercase'
        }}>
          WEATHER & PIT STRATEGY
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--green)',
          background: 'rgba(57, 181, 74, 0.15)',
          padding: '2px 6px',
          borderRadius: '4px'
        }}>
          LIVE TELEMETRY
        </span>
      </div>

      {/* 1. Track Conditions / Weather Grid */}
      <div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '10px',
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '1px',
          marginBottom: '8px'
        }}>
          TRACK ATMOSPHERICS
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px'
        }}>
          {/* Air Temp */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '10px 12px'
          }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>AIR TEMP</div>
            <div style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#64C4FF', marginTop: '2px' }}>
              {airTemp.toFixed(1)}°C
            </div>
          </div>

          {/* Track Temp */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '10px 12px'
          }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>TRACK TEMP</div>
            <div style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#FF8000', marginTop: '2px' }}>
              {trackTemp.toFixed(1)}°C
            </div>
          </div>

          {/* Humidity */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '10px 12px'
          }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>HUMIDITY</div>
            <div style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>
              {humidity}%
            </div>
          </div>

          {/* Rain Chance */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '10px 12px'
          }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>RAIN CHANCE</div>
            <div style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: 900, color: rainChance > 30 ? '#FF3333' : '#39B54A', marginTop: '2px' }}>
              {rainChance}%
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tire Degradation Module */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '10px',
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '1px'
        }}>
          TIRE DEGRADATION & WEAR
        </div>
        {tireDegradation.map((td) => {
          const compColor = TYRE_COLORS[td.compound.toUpperCase()] ?? '#FFD700';
          const displayWear = td.wearPercent;
          const healthPercent = Math.max(0, parseFloat((100 - displayWear).toFixed(1)));
          const isCliff = displayWear > 70;
          const isModerate = displayWear > 45 && displayWear <= 70;

          const barColor = isCliff ? '#FF3333' : isModerate ? '#FFD700' : compColor;

          return (
            <div key={td.compound} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: isCliff ? '1px solid rgba(255, 51, 51, 0.3)' : '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: '6px',
              padding: '8px 12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                <span style={{ color: compColor }}>
                  {td.compound} ({td.lapsUsed} LAPS)
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                    WEAR: {displayWear}%
                  </span>
                  <span style={{ color: barColor, fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                    HEALTH: {healthPercent}%
                  </span>
                </div>
              </div>
              <div style={{
                height: '6px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${healthPercent}%`,
                  backgroundColor: barColor,
                  boxShadow: `0 0 8px ${barColor}`,
                  borderRadius: '3px',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Predicted Strategy Timeline UI */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '10px',
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '1px'
        }}>
          PREDICTED PIT STRATEGY
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {predictedStrategies.map((ps, idx) => {
            const fromColor = TYRE_COLORS[ps.fromCompound.toUpperCase()] ?? '#FFD700';
            const toColor = TYRE_COLORS[ps.toCompound.toUpperCase()] ?? '#FFFFFF';

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: ps.isCurrent ? 'rgba(225, 6, 0, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: ps.isCurrent ? '1px solid rgba(225, 6, 0, 0.4)' : '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: '8px',
                  padding: '10px 12px'
                }}
              >
                {/* Pit Window Badge */}
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  fontSize: '11px',
                  color: 'var(--accent)',
                  minWidth: '75px'
                }}>
                  L {ps.startLap}-{ps.endLap}
                </div>

                {/* Compound transition arrow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: fromColor
                  }}>
                    {ps.fromCompound}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>➔</span>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: toColor
                  }}>
                    {ps.toCompound}
                  </span>
                </div>

                {ps.isCurrent && (
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '9px',
                    fontWeight: 800,
                    color: '#00FF66',
                    letterSpacing: '1px',
                    background: 'rgba(0, 255, 102, 0.15)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    OPTIMAL WINDOW
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
