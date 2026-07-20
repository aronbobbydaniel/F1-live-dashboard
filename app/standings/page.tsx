'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { StaggerReveal, TiltCard, ScrollReveal, FadeInImage } from '@/components/GSAPAnimations';
import {
  DRIVER_HEADSHOTS,
  getTeamColor,
  getTeamLogo,
  getTeamLogoUrl,
  getDriverFlag,
} from '@/lib/f1-2026';
import { getCountryIsoCode } from '@/lib/jolpica';

// Animated counter hook
function useCounter(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      observer.disconnect();
      const start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / duration, 1);
        setValue(Math.round(p * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return { value, ref };
}

function AnimatedStat({ value, label, icon, color }: { value: string; label: string; icon: string; color?: string }) {
  const numericPart = parseFloat(value.replace(/[^0-9.]/g, ''));
  const suffix = value.replace(/[0-9.]/g, '');
  const { value: count, ref } = useCounter(isNaN(numericPart) ? 0 : numericPart);
  return (
    <div ref={ref} style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      display: 'flex',
      gap: '14px',
      alignItems: 'flex-start',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
    >
      <div style={{ fontSize: '32px', flexShrink: 0, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{icon}</div>
      <div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 900,
          color: color ?? 'var(--text-primary)', lineHeight: 1,
          background: color ? `linear-gradient(135deg, ${color}, ${color}99)` : undefined,
          WebkitBackgroundClip: color ? 'text' : undefined,
          WebkitTextFillColor: color ? 'transparent' : undefined,
        }}>
          {isNaN(numericPart) ? value : `${count}${suffix}`}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', marginTop: '3px' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export default function StandingsPage() {
  const [tab, setTab] = useState<'drivers' | 'constructors'>('drivers');
  const [season, setSeason] = useState('current');
  const [drivers, setDrivers] = useState<any[]>([]);
  const [constructors, setConstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [barsAnimated, setBarsAnimated] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    setBarsAnimated(false);
    Promise.all([
      fetch(`https://api.jolpi.ca/ergast/f1/${season}/driverStandings.json`).then(r => r.json()),
      fetch(`https://api.jolpi.ca/ergast/f1/${season}/constructorStandings.json`).then(r => r.json()),
    ]).then(([dData, cData]) => {
      setDrivers(dData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? []);
      setConstructors(cData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? []);
      setLoading(false);
      setTimeout(() => setBarsAnimated(true), 100);
    }).catch(() => setLoading(false));
  }, [season]);

  const maxDriverPts = drivers[0] ? parseFloat(drivers[0].points) : 1;
  const maxCtorPts = constructors[0] ? parseFloat(constructors[0].points) : 1;
  const seasons = ['current', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'];

  return (
    <div className="page-wrap">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Formula 1 · {season === 'current' ? '2026' : season}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, letterSpacing: '-0.5px', color: 'var(--text-primary)', margin: 0 }}>
            🏆 Championship Standings
          </h1>
        </div>

        <select
          value={season}
          onChange={e => setSeason(e.target.value)}
          style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
            fontSize: '14px', fontWeight: 700, letterSpacing: '1px',
            padding: '10px 20px', borderRadius: 'var(--radius)', cursor: 'pointer',
            outline: 'none',
          }}
        >
          {seasons.map(s => <option key={s} value={s}>{s === 'current' ? '2026 (Live)' : s}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: '4px', width: 'fit-content' }}>
        {(['drivers', 'constructors'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? 'black' : 'var(--text-muted)',
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 800,
              letterSpacing: '1.5px', textTransform: 'uppercase',
              padding: '8px 20px', borderRadius: '6px',
              transition: 'all 0.2s',
            }}
          >
            {t === 'drivers' ? '👤 Drivers' : '🏎 Constructors'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
          <span>Loading {season === 'current' ? 'Live' : season} Standings...</span>
        </div>
      ) : tab === 'drivers' ? (
        <StaggerReveal style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {drivers.map((s, i) => {
            const driverId = s.Driver.driverId;
            const ctorId = s.Constructors?.[0]?.constructorId ?? '';
            const tc = getTeamColor(ctorId);
            const logo = getTeamLogo(ctorId);
            const pts = parseFloat(s.points);
            const barW = barsAnimated ? (pts / maxDriverPts) * 100 : 0;
            const isLeader = i === 0;
            const gapToLeader = i === 0 ? null : (parseFloat(drivers[0].points) - pts).toFixed(0);
            const headshotSrc = DRIVER_HEADSHOTS[driverId];
            const hasImgError = imgErrors[driverId] || !headshotSrc;

            return (
              <Link
                href={`/drivers/${driverId}`}
                key={driverId}
                className="driver-row-link"
                onClick={(e) => e.stopPropagation()}
                style={{ textDecoration: 'none' }}
              >
                <TiltCard maxTilt={3} glare style={{
                  background: isLeader ? `linear-gradient(135deg, ${tc}15, var(--bg-card))` : 'var(--bg-card)',
                  border: `1px solid ${isLeader ? tc + '44' : 'var(--border)'}`,
                  borderLeft: `4px solid ${tc}`,
                  borderRadius: 'var(--radius)',
                  padding: '10px 18px',
                  display: 'grid',
                  gridTemplateColumns: '44px 50px 58px 1fr auto auto',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Position */}
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 900, textAlign: 'center',
                    color: i === 0 ? 'var(--gold)' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--text-muted)',
                  }}>
                    {i === 0 ? '👑' : `P${i + 1}`}
                  </div>

                  {/* Driver Headshot Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', overflow: 'hidden',
                    background: 'var(--bg-elevated)', border: `1.5px solid ${tc}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)', flexShrink: 0,
                  }}>
                    {!hasImgError ? (
                      <FadeInImage
                        src={headshotSrc}
                        alt={`${s.Driver.givenName} ${s.Driver.familyName}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                        onError={() => setImgErrors(prev => ({ ...prev, [driverId]: true }))}
                      />
                    ) : (
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 900,
                        color: tc, letterSpacing: -0.5,
                      }}>
                        {s.Driver.givenName[0]}
                        {s.Driver.familyName[0]}
                      </div>
                    )}
                  </div>

                  {/* Team Logo Image */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 52, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#141416', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6,
                      padding: 4, boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.4)',
                    }}>
                      <img
                        src={getTeamLogoUrl(ctorId)}
                        alt={ctorId}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1) opacity(0.85)' }}
                      />
                    </div>
                  </div>

                  {/* Name + Progress bar + Flag */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <img
                        src={`https://flagcdn.com/${getCountryIsoCode(s.Driver.nationality)}.svg`}
                        alt={s.Driver.nationality}
                        style={{ width: '18px', height: '12px', objectFit: 'cover', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {s.Driver.givenName} <span style={{ color: tc }}>{s.Driver.familyName}</span>
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                        color: 'var(--text-muted)', marginLeft: 'auto', marginRight: 16,
                      }}>
                        #{s.Driver.permanentNumber}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden', maxWidth: '320px' }}>
                        <div style={{ height: '100%', width: `${barW}%`, background: `linear-gradient(90deg, ${tc}, ${tc}aa)`, borderRadius: '2px', transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {s.Constructors?.[0]?.name}
                      </span>
                    </div>
                  </div>

                  {/* Points */}
                  <div style={{ textAlign: 'right', paddingLeft: 12 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 900, color: isLeader ? tc : 'var(--text-primary)' }}>
                      {s.points}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '9px', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted)' }}>
                      PTS
                    </div>
                  </div>

                  {/* Gap / Wins */}
                  <div style={{ textAlign: 'right', minWidth: '60px' }}>
                    {gapToLeader ? (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#ef4444', fontWeight: 700 }}>
                        -{gapToLeader}
                      </div>
                    ) : (
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--gold)', fontWeight: 800 }}>
                        {s.wins} W
                      </div>
                    )}
                  </div>
                </TiltCard>
              </Link>
            );
          })}
        </StaggerReveal>
      ) : (
        <StaggerReveal style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {constructors.map((s, i) => {
            const ctorId = s.Constructor.constructorId;
            const tc = getTeamColor(ctorId);
            const logo = getTeamLogo(ctorId);
            const pts = parseFloat(s.points);
            const barW = barsAnimated ? (pts / maxCtorPts) * 100 : 0;

            return (
              <div key={ctorId} style={{
                background: i === 0 ? `linear-gradient(135deg, ${tc}15, var(--bg-card))` : 'var(--bg-card)',
                border: `1px solid ${i === 0 ? tc + '44' : 'var(--border)'}`,
                borderLeft: `4px solid ${tc}`,
                borderRadius: 'var(--radius)',
                padding: '14px 20px',
                display: 'grid',
                gridTemplateColumns: '44px 58px 1fr auto',
                alignItems: 'center',
                gap: '14px',
                animation: `fadeSlideUp 0.4s ease both`,
                animationDelay: `${i * 0.04}s`,
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 900, textAlign: 'center',
                  color: i === 0 ? 'var(--gold)' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--text-muted)',
                }}>
                  {i === 0 ? '👑' : `P${i + 1}`}
                </div>

                {/* Team Logo Image */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 52, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#141416', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6,
                    padding: 4, boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.4)',
                  }}>
                    <img
                      src={getTeamLogoUrl(ctorId)}
                      alt={ctorId}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1) opacity(0.85)' }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: tc, flexShrink: 0 }} />
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {s.Constructor.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-display)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <img
                        src={`https://flagcdn.com/${getCountryIsoCode(s.Constructor.nationality)}.svg`}
                        alt={s.Constructor.nationality}
                        style={{ width: '15px', height: '10px', objectFit: 'cover', borderRadius: '1.5px', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                      <span>{s.Constructor.nationality}</span>
                    </div>
                  </div>
                  <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden', maxWidth: '400px' }}>
                    <div style={{ height: '100%', width: `${barW}%`, background: `linear-gradient(90deg, ${tc}, ${tc}aa)`, borderRadius: '2px', transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 900, color: i === 0 ? tc : 'var(--text-primary)' }}>
                    {s.points}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '9px', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted)' }}>
                    PTS · {s.wins} WINS
                  </div>
                </div>
              </div>
            );
          })}
        </StaggerReveal>
      )}

      {/* Inline style for animation */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
