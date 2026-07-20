'use client';

import React from 'react';
import { TYRE_COLORS } from '@/lib/openf1';

export const DRIVER_COUNTRY_CODES: Record<string, string> = {
  'VER': 'nl', 'NOR': 'gb', 'LEC': 'mc', 'PIA': 'au',
  'SAI': 'es', 'RUS': 'gb', 'HAM': 'gb', 'ALO': 'es',
  'STR': 'ca', 'TSU': 'jp', 'RIC': 'au', 'GAS': 'fr',
  'OCO': 'fr', 'ALB': 'th', 'HUL': 'de', 'MAG': 'dk',
  'BOT': 'fi', 'ZHO': 'cn', 'ANT': 'it', 'BEA': 'gb',
  'HAD': 'fr', 'COL': 'ar', 'LAW': 'nz', 'BOR': 'br',
  'PER': 'mx',
};

export interface DriverTimingData {
  driver_number: number;
  acronym: string;
  full_name: string;
  team_name: string;
  team_colour: string;
  country_flag?: string;
  position: number;
  compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET' | string;
  tyre_age: number;
  interval: string;
  gap_to_leader: string;
  last_lap: string;
  is_fastest_lap?: boolean;
  has_purple_sector?: boolean;
}

interface LiveTimingTowerProps {
  drivers: DriverTimingData[];
  sessionName?: string;
  lapCount?: { current: number; total: number };
}

export default function LiveTimingTower({ drivers, lapCount }: LiveTimingTowerProps) {
  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Tower Header */}
      <div style={{
        padding: '14px 16px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#39B54A',
            boxShadow: '0 0 8px #39B54A'
          }} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '1.5px',
            color: '#FFFFFF',
            textTransform: 'uppercase'
          }}>
            TIMING TOWER
          </span>
        </div>
        {lapCount && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--accent)',
            fontWeight: 700,
            background: 'rgba(225, 6, 0, 0.15)',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(225, 6, 0, 0.3)'
          }}>
            {lapCount.current >= lapCount.total ? `🏁 FINAL (${lapCount.total}/${lapCount.total})` : `LAP ${lapCount.current}/${lapCount.total}`}
          </div>
        )}
      </div>

      {/* Column Headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '6px 24px 1fr 40px 65px',
        gap: '6px',
        padding: '8px 12px',
        fontSize: '10px',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        letterSpacing: '1px',
        color: 'var(--text-muted)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        textTransform: 'uppercase'
      }}>
        <div />
        <div>P</div>
        <div>DRIVER</div>
        <div style={{ textAlign: 'center' }}>TYRE</div>
        <div style={{ textAlign: 'right' }}>GAP</div>
      </div>

      {/* Driver List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '8px',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 220px)'
      }}>
        {[...drivers].sort((a, b) => a.position - b.position).map((d) => {
          const teamColor = d.team_colour.startsWith('#') ? d.team_colour : `#${d.team_colour}`;
          const compoundKey = d.compound.toUpperCase();
          const tyreColor = TYRE_COLORS[compoundKey] ?? '#888888';
          const isPurple = d.is_fastest_lap || d.has_purple_sector;

          return (
            <div
              key={d.driver_number}
              className={`driver-row-link ${isPurple ? 'fastest-lap-flash' : ''}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'grid',
                gridTemplateColumns: '6px 24px 1fr 40px 65px',
                gap: '6px',
                alignItems: 'center',
                padding: '6px 10px',
                borderRadius: '6px',
                background: isPurple
                  ? undefined
                  : 'rgba(255, 255, 255, 0.02)',
                border: isPurple ? '1px solid rgba(210, 255, 0, 0.5)' : '1px solid rgba(255, 255, 255, 0.04)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Dedicated Side Team Color Banner Bar */}
              <div style={{
                width: '5px',
                height: '22px',
                borderRadius: '3px',
                backgroundColor: teamColor,
                boxShadow: `0 0 8px ${teamColor}90`,
                flexShrink: 0
              }} />

              {/* Position */}
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '13px',
                color: d.position <= 3 ? '#FFD700' : 'var(--text-primary)'
              }}>
                {d.position}
              </div>

              {/* Driver acronym & Country Flag */}
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {DRIVER_COUNTRY_CODES[d.acronym] ? (
                    <img
                      src={`https://flagcdn.com/w40/${DRIVER_COUNTRY_CODES[d.acronym]}.png`}
                      alt="flag"
                      style={{ width: '16px', height: '11px', borderRadius: '2px', objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <span style={{ fontSize: '11px' }}>🏁</span>
                  )}
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '13px',
                    letterSpacing: '0.5px',
                    color: '#FFFFFF'
                  }}>
                    {d.acronym}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--text-muted)'
                  }}>
                    #{d.driver_number}
                  </span>
                </div>
              </div>

              {/* Tyre compound badge */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div
                  title={`${d.compound} (${d.tyre_age} laps old)`}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: `2px solid ${tyreColor}`,
                    color: tyreColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: '11px',
                    fontWeight: 900,
                    boxShadow: `0 0 6px ${tyreColor}40`,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                  }}
                >
                  {d.compound[0]}
                </div>
              </div>

              {/* Interval / Gap */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                textAlign: 'right',
                color: d.position === 1 ? 'var(--accent)' : 'var(--text-primary)',
              }}>
                {d.position === 1 ? 'LEADER' : d.interval}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
