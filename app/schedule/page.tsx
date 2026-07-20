import { getRaceSchedule } from '@/lib/jolpica';
import Link from 'next/link';
import CountdownTimer from '@/components/CountdownTimer';
import { ScrollReveal, StaggerReveal } from '@/components/GSAPAnimations';
import ScheduleRaceCard from '@/components/ScheduleRaceCard';
import DetailsButton from '@/components/DetailsButton';

export const revalidate = 300;

export const metadata = {
  title: 'Race Schedule — F1 Dash',
  description: '2026 Formula 1 race calendar with dates, circuits, and countdowns.',
};

/* ─────────────────────────────────────────────────────────
   Country code mapping for FlagCDN SVGs
──────────────────────────────────────────────────────────*/
const COUNTRY_CODES: Record<string, string> = {
  'Bahrain':            'bh',
  'Saudi Arabia':       'sa',
  'Australia':          'au',
  'Japan':              'jp',
  'China':              'cn',
  'USA':                'us',
  'United States':      'us',
  'Italy':              'it',
  'Monaco':             'mc',
  'Canada':             'ca',
  'Spain':              'es',
  'Austria':            'at',
  'UK':                 'gb',
  'United Kingdom':     'gb',
  'Hungary':            'hu',
  'Belgium':            'be',
  'Netherlands':        'nl',
  'Azerbaijan':         'az',
  'Singapore':          'sg',
  'Mexico':             'mx',
  'Brazil':             'br',
  'Las Vegas':          'us',
  'Qatar':              'qa',
  'Abu Dhabi':          'ae',
  'UAE':                'ae',
};

function getCountryCode(country: string): string {
  return COUNTRY_CODES[country] ?? 'un';
}

function raceStatus(race: any): 'completed' | 'upcoming' {
  const now = new Date();
  const dt  = race.time ? new Date(`${race.date}T${race.time}`) : new Date(race.date);
  return dt < now ? 'completed' : 'upcoming';
}

function formatDate(dateStr: string, timeStr?: string): string {
  const d = timeStr ? new Date(`${dateStr}T${timeStr}`) : new Date(dateStr);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatYear(dateStr: string): string {
  return new Date(dateStr).getFullYear().toString();
}

function monthLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
}

function dayLabel(dateStr: string) {
  return new Date(dateStr).getDate();
}

export default async function SchedulePage() {
  const races = await getRaceSchedule('current').catch(() => []);
  const now = new Date();

  let nextIdx = -1;
  for (let i = 0; i < races.length; i++) {
    const dt = races[i].time ? new Date(`${races[i].date}T${races[i].time}`) : new Date(races[i].date);
    if (dt > now) { nextIdx = i; break; }
  }

  const completedCount = races.filter(r => raceStatus(r) === 'completed').length;

  return (
    <div className="page-wrap">

      {/* Header */}
      <ScrollReveal>
        <div style={{ marginBottom: 36 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
            letterSpacing: 4, textTransform: 'uppercase', color: 'var(--text-muted)',
            marginBottom: 8,
          }}>Formula 1 · {formatYear(races[0]?.date ?? new Date().toISOString())}</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 6vw, 54px)',
            fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: -1, color: 'var(--text-primary)', margin: 0,
          }}>
            🗓️ Race Calendar
          </h1>
          <div style={{
            height: 3, width: 60, background: 'var(--accent)', borderRadius: 2,
            marginTop: 12, boxShadow: '0 0 12px var(--accent)',
          }} />
          <div style={{
            marginTop: 10, fontFamily: 'var(--font-display)', fontSize: 12,
            color: 'var(--text-muted)', letterSpacing: 1,
          }}>
            {completedCount} races completed · {races.length - completedCount} remaining
          </div>
        </div>
      </ScrollReveal>

      {/* Next race countdown */}
      {nextIdx >= 0 && (
        <ScrollReveal delay={0.1} style={{ marginBottom: 36 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
            letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12,
          }}>⏱ Next Race</div>
          <CountdownTimer
            targetDate={races[nextIdx].time ? `${races[nextIdx].date}T${races[nextIdx].time}` : `${races[nextIdx].date}T13:00:00Z`}
            sessionName="RACE"
            raceName={races[nextIdx].raceName}
            flagCode={getCountryCode(races[nextIdx].Circuit?.Location?.country)}
          />
        </ScrollReveal>
      )}

      {/* Race grid */}
      <StaggerReveal
        stagger={0.04}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: 14,
        }}
      >
        {races.map((race, i) => {
          const status  = raceStatus(race);
          const isNext  = i === nextIdx;
          const country = race.Circuit?.Location?.country ?? '';
          const code    = getCountryCode(country);
          const hasSprint = !!race.Sprint;

          return (
            <ScheduleRaceCard
              key={race.round}
              race={race}
              isNext={isNext}
              status={status}
              flag={code}
              hasSprint={hasSprint}
            >
              {/* Card top — FlagCDN SVG + Country + Round */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px 10px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                {/* Left: SVG flag + Country info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', borderRadius: 4, flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)',
                    background: '#141416',
                  }}>
                    <img
                      src={`https://flagcdn.com/${code}.svg`}
                      alt={country}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 900,
                      textTransform: 'uppercase', letterSpacing: 0.5,
                      color: status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)',
                      lineHeight: 1.1,
                    }}>
                      {race.raceName.replace(' Grand Prix', '').replace('Grand Prix', '')}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600,
                      letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase',
                      marginTop: 2,
                    }}>
                      {country}
                    </div>
                  </div>
                </div>

                {/* Right: Round & Date block */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 800,
                    letterSpacing: 2, textTransform: 'uppercase',
                    color: isNext ? '#ffd700' : 'var(--text-muted)',
                  }}>RD {race.round}</div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900,
                    color: 'var(--text-primary)', lineHeight: 1,
                  }}>{dayLabel(race.date)}</div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700,
                    letterSpacing: 2, color: 'var(--text-muted)',
                  }}>{monthLabel(race.date)}</div>
                </div>
              </div>

              {/* Card body — sessions */}
              <div style={{ padding: '10px 16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Circuit name */}
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600,
                  letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase',
                  marginBottom: 6,
                }}>
                  📍 {race.Circuit?.circuitName}
                </div>

                {/* Session rows */}
                {[
                  race.FirstPractice  && { label: 'FP1',         date: race.FirstPractice.date,  time: race.FirstPractice.time },
                  race.SecondPractice && { label: 'FP2',         date: race.SecondPractice.date, time: race.SecondPractice.time },
                  race.ThirdPractice  && { label: 'FP3',         date: race.ThirdPractice.date,  time: race.ThirdPractice.time },
                  race.Sprint         && { label: '🔥 Sprint',   date: race.Sprint.date,         time: race.Sprint.time },
                  race.Qualifying     && { label: 'Qualifying',  date: race.Qualifying.date,     time: race.Qualifying.time },
                  { label: '🏁 Race',                            date: race.date,                time: race.time },
                ].filter(Boolean).map((s: any) => (
                  <div key={s.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700,
                      letterSpacing: 1, textTransform: 'uppercase',
                      color: s.label.includes('Race') ? 'var(--accent)' : 'var(--text-muted)',
                    }}>{s.label}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      color: s.label.includes('Race') ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontWeight: s.label.includes('Race') ? 700 : 400,
                    }}>{formatDate(s.date, s.time)}</span>
                  </div>
                ))}

                {/* Status badge row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {hasSprint && (
                      <span style={{
                        fontFamily: 'var(--font-display)', fontSize: 8, fontWeight: 800,
                        letterSpacing: 2, color: '#ff8c00', textTransform: 'uppercase',
                        background: 'rgba(255,140,0,0.12)', border: '1px solid rgba(255,140,0,0.3)',
                        borderRadius: 4, padding: '2px 6px',
                      }}>Sprint</span>
                    )}
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: 8, fontWeight: 800,
                      letterSpacing: 2, textTransform: 'uppercase',
                      color: isNext ? '#ffd700' : status === 'completed' ? '#555' : 'var(--accent)',
                      background: isNext ? 'rgba(255,215,0,0.1)' : status === 'completed' ? 'rgba(255,255,255,0.04)' : 'rgba(225,6,0,0.1)',
                      border: `1px solid ${isNext ? 'rgba(255,215,0,0.3)' : status === 'completed' ? 'rgba(255,255,255,0.08)' : 'rgba(225,6,0,0.25)'}`,
                      borderRadius: 4, padding: '2px 6px',
                    }}>
                      {isNext ? '⭐ Next' : status === 'completed' ? '✓ Done' : '📅 Upcoming'}
                    </span>
                  </div>
                  <DetailsButton round={race.round} />
                </div>
              </div>
            </ScheduleRaceCard>
          );
        })}
      </StaggerReveal>
    </div>
  );
}
