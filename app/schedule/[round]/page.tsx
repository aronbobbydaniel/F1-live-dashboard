import { getRaceResults, getRaceSchedule, getCountryFlag, getCircuitFlag, getCountryIsoCode, getCircuitIsoCode } from '@/lib/jolpica';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CIRCUITS, CIRCUIT_ID_MAP } from '@/lib/circuits';
import CountdownTimer from '@/components/CountdownTimer';
import CircuitInfo from '@/components/CircuitInfo';
import CircuitMap3DAnimated from '@/components/CircuitMap3DAnimated';


export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ round: string }> }) {
  const { round } = await params;
  const allRaces = await getRaceSchedule('current').catch(() => []);
  const race = allRaces.find((r: any) => r.round === round);
  return {
    title: race ? `${race.raceName} — F1 Dash` : `Round ${round} — F1 Dash`,
    description: race ? `Full results, circuit layout and facts for the ${race.raceName}.` : '',
  };
}

const TEAM_COLORS: Record<string, string> = {
  'red_bull': '#3671C6', 'ferrari': '#E8002D', 'mercedes': '#27F4D2',
  'mclaren': '#FF8000', 'aston_martin': '#229971', 'alpine': '#FF87BC',
  'williams': '#64C4FF', 'rb': '#6692FF', 'sauber': '#52E252', 'haas': '#B6BABD',
};

function teamColor(id: string) {
  const key = Object.keys(TEAM_COLORS).find(k => id.toLowerCase().includes(k));
  return key ? TEAM_COLORS[key] : '#888888';
}

export default async function RaceDetailPage({ params }: { params: Promise<{ round: string }> }) {
  const { round } = await params;
  const [race, allRaces] = await Promise.all([
    getRaceResults('current', round).catch(() => null),
    getRaceSchedule('current').catch(() => []),
  ]);

  const scheduleRace = allRaces.find((r: any) => r.round === round);
  if (!race && !scheduleRace) notFound();

  const displayRace = race ?? scheduleRace!;
  const results = race?.Results ?? [];
  const circuitFlag = getCircuitFlag(displayRace.Circuit?.circuitId ?? '');
  const hasResults = results.length > 0;
  const raceDate = new Date(displayRace.date);
  const isPast = raceDate < new Date();
  const isUpcoming = !isPast;

  // Get circuit data
  const circuitId = displayRace.Circuit?.circuitId;
  const circuitKey = circuitId ? CIRCUIT_ID_MAP[circuitId] : null;
  const circuitData = circuitKey ? CIRCUITS[circuitKey] : null;

  const raceDateTime = displayRace.time
    ? `${displayRace.date}T${displayRace.time}`
    : `${displayRace.date}T14:00:00Z`;

  return (
    <div className="page-wrap" style={{ animation: 'fadeSlideUp 0.5s both' }}>
      {/* Back */}
      <Link
        href="/schedule"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px', transition: 'color 0.2s' }}
      >
        ← Back to Schedule
      </Link>

      {/* ─── Race Header ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '36px',
          padding: '28px', background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Background watermark round number */}
        <div style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-display)', fontSize: '120px', fontWeight: 900, color: 'rgba(255,255,255,0.03)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>
          R{displayRace.round}
        </div>

        {/* Status bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: isPast ? 'linear-gradient(90deg, var(--accent), #ff6644)' : 'linear-gradient(90deg, #3671C6, #27F4D2)' }} />

        <div style={{
          width: 80, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', borderRadius: 6, flexShrink: 0,
          boxShadow: '0 4px 14px rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)',
          background: '#141416',
        }}>
          <img
            src={`https://flagcdn.com/${getCircuitIsoCode(displayRace.Circuit?.circuitId ?? '')}.svg`}
            alt={displayRace.Circuit?.Location?.country}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
            {displayRace.season} · Round {displayRace.round}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,5vw,52px)', fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'uppercase', lineHeight: 0.95, color: 'var(--text-primary)', marginBottom: '10px' }}>
            {displayRace.raceName}
          </h1>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            📍 {displayRace.Circuit?.circuitName} · {displayRace.Circuit?.Location?.locality}, {displayRace.Circuit?.Location?.country}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            📅 {raceDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: isPast ? 'rgba(57,181,74,0.1)' : 'rgba(54,113,198,0.1)',
            border: `1px solid ${isPast ? 'rgba(57,181,74,0.3)' : 'rgba(54,113,198,0.3)'}`,
            borderRadius: '999px', padding: '4px 14px',
            fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
            color: isPast ? 'var(--green)' : '#64a8ff',
          }}>
            {isPast ? '✅ Completed' : '🔜 Upcoming'}
          </span>
        </div>
      </div>

      {/* ─── Countdown (if upcoming) ─────────────────────────────── */}
      {isUpcoming && (
        <div style={{ marginBottom: '32px', animation: 'fadeSlideUp 0.5s 0.1s both' }}>
          <CountdownTimer targetDate={raceDateTime} sessionName="Race" raceName={displayRace.raceName} />
        </div>
      )}

      {/* ─── Weekend Schedule ────────────────────────────────────── */}
      <h2 className="section-title" style={{ animation: 'fadeSlideUp 0.5s 0.1s both' }}>
        <span className="section-accent">📅</span> Weekend Schedule
      </h2>
      <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '40px' }}>
        {[
          { label: 'Practice 1',       icon: '🟡', data: displayRace.FirstPractice },
          { label: 'Practice 2',       icon: '🟡', data: displayRace.SecondPractice },
          { label: 'Practice 3',       icon: '🟡', data: displayRace.ThirdPractice },
          { label: 'Sprint Qualifying',icon: '⚡', data: displayRace.SprintQualifying },
          { label: 'Sprint',           icon: '⚡', data: displayRace.Sprint },
          { label: 'Qualifying',       icon: '🔴', data: displayRace.Qualifying },
          { label: 'Race',             icon: '🏁', data: { date: displayRace.date, time: displayRace.time } },
        ].filter(s => s.data).map(({ label, icon, data }) => {
          const dt = data?.date ? new Date(`${data.date}T${data.time ?? '12:00:00Z'}`) : null;
          const isFuture = dt ? dt > new Date() : false;
          return (
            <div
              key={label}
              className="stat-box hover-lift"
              style={{
                borderColor: label === 'Race' ? 'rgba(225,6,0,0.3)' : undefined,
                background: label === 'Race' ? 'rgba(225,6,0,0.05)' : undefined,
              }}
            >
              <div className="stat-box-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{icon}</span>{label}
                {isFuture && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', background: 'var(--green)', borderRadius: '50%' }} />}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {dt ? dt.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'} UTC
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Circuit Layout (3D) ────────────────────────────────── */}
      {displayRace.Circuit?.circuitId && (
        <section style={{ marginBottom: '40px', animation: 'fadeSlideUp 0.5s 0.15s both' }}>
          <div className="bg-zinc-950/60 rounded-xl p-6 border border-white/5">
            <h2 className="font-display font-bold text-xl uppercase tracking-wider text-white mb-6 flex items-center">
              <span className="w-1.5 h-6 bg-f1-red mr-3 rounded-full"></span>
              Circuit Layout (3D)
            </h2>
            <div className="w-full h-[400px]">
              <CircuitMap3DAnimated circuitId={displayRace.Circuit.circuitId} height={400} />
            </div>
          </div>
        </section>
      )}

      {/* ─── Circuit Info Section ────────────────────────────────── */}
      {circuitData ? (
        <section style={{ marginBottom: '40px', animation: 'fadeSlideUp 0.5s 0.2s both' }}>
          <div className="circuit-section-title">Circuit Info</div>
          <CircuitInfo circuit={circuitData} />
        </section>
      ) : (
        <section style={{ marginBottom: '40px' }}>
          <div className="circuit-section-title">Circuit Info</div>
          <div className="card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            📍 {displayRace.Circuit?.circuitName} · {displayRace.Circuit?.Location?.locality}, {displayRace.Circuit?.Location?.country}
          </div>
        </section>
      )}

      {/* ─── Race Results ────────────────────────────────────────── */}
      {hasResults ? (
        <>
          <h2 className="section-title" style={{ animation: 'fadeSlideUp 0.5s 0.3s both' }}>
            <span className="section-accent">🏁</span> Race Results
          </h2>

          {/* Podium */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '28px', animation: 'fadeSlideUp 0.5s 0.35s both' }}>
            {[results[1], results[0], results[2]].filter(Boolean).map((r, idx) => {
              const podiumPos = idx === 0 ? 2 : idx === 1 ? 1 : 3;
              const colors = { 1: 'var(--gold)', 2: '#C0C0C0', 3: '#CD7F32' } as Record<number, string>;
              const color = colors[podiumPos];
              const tc = teamColor(r.Constructor.constructorId);
              return (
                <div
                  key={r.Driver.driverId}
                  className="card hover-lift"
                  style={{
                    textAlign: 'center',
                    borderColor: color + '55',
                    background: `linear-gradient(135deg, ${color}08, var(--bg-card))`,
                    order: podiumPos === 1 ? 0 : podiumPos === 2 ? -1 : 1,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color }} />
                  <div style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 900, color, marginBottom: '4px' }}>P{podiumPos}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px,3vw,22px)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                    {r.Driver.familyName}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: tc, display: 'inline-block' }} />
                    {r.Constructor.name}
                  </div>
                  {r.Time && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>{r.Time.time}</div>}
                </div>
              );
            })}
          </div>

          {/* Full Results Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', animation: 'fadeSlideUp 0.5s 0.4s both' }}>
            <table className="result-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Driver</th>
                  <th>Team</th>
                  <th>Laps</th>
                  <th>Time / Status</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r: any, i: number) => {
                  const tc = teamColor(r.Constructor.constructorId);
                  const isFastest = r.FastestLap?.rank === '1';
                  return (
                    <tr
                      key={r.Driver.driverId}
                      className="timing-row-animated"
                      style={{
                        background: isFastest ? 'rgba(191,0,255,0.04)' : undefined,
                        animation: `fadeSlideUp 0.4s ${0.4 + i * 0.02}s both`,
                      }}
                    >
                      <td>
                        <span className={`standings-pos ${r.position === '1' ? 'standings-pos--gold' : r.position === '2' ? 'standings-pos--silver' : r.position === '3' ? 'standings-pos--bronze' : ''}`}>
                          {r.positionText}
                        </span>
                      </td>
                      <td>
                        <Link href={`/drivers/${r.Driver.driverId}`}>
                          <div className="standings-driver-name" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <img
                              src={`https://flagcdn.com/${getCountryIsoCode(r.Driver.nationality)}.svg`}
                              alt={r.Driver.nationality}
                              style={{ width: '16px', height: '11px', objectFit: 'cover', borderRadius: '1.5px', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                            <span>{r.Driver.givenName} {r.Driver.familyName}</span>
                          </div>
                          {isFastest && <span className="fastest-tag" style={{ marginTop: '2px', display: 'inline-block' }}>FL</span>}
                        </Link>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: tc, display: 'inline-block', flexShrink: 0 }} />
                          {r.Constructor.name}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)' }}>{r.laps}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {r.Time?.time ?? r.status}
                      </td>
                      <td><span className="standings-points" style={{ fontSize: '16px' }}>{r.points}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="empty-state" style={{ animation: 'fadeSlideUp 0.5s 0.3s both' }}>
          <div className="icon">{isPast ? '🏁' : '⏳'}</div>
          {isPast ? 'Results not yet available.' : 'Race has not started yet. Check back after the race!'}
        </div>
      )}
    </div>
  );
}
