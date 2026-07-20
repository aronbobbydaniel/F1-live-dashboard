import { getDriverSeasonResults, getDriverStandings, getCountryFlag, getCountryIsoCode } from '@/lib/jolpica';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `${id.replace(/_/g, ' ')} — F1 Dash` };
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

function positionColor(pos: string): string {
  if (pos === '1') return 'var(--gold)';
  if (pos === '2') return '#C0C0C0';
  if (pos === '3') return '#CD7F32';
  if (parseInt(pos) <= 10) return 'var(--green)';
  return 'var(--text-muted)';
}

export default async function DriverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [races, standings] = await Promise.all([
    getDriverSeasonResults(id, 'current').catch(() => []),
    getDriverStandings('current').catch(() => []),
  ]);

  const standing = standings.find(s => s.Driver.driverId === id);
  const driver = standing?.Driver ?? races[0]?.Results?.[0]?.Driver;

  if (!driver && races.length === 0) notFound();

  const ctor = standing?.Constructors?.[0] ?? races[0]?.Results?.[0]?.Constructor;
  const tc = teamColor(ctor?.constructorId ?? '');

  // Compute stats from race results
  const results = races.map(r => r.Results?.[0]).filter(Boolean);
  const wins = results.filter(r => r?.position === '1').length;
  const podiums = results.filter(r => parseInt(r?.position ?? '99') <= 3).length;
  const points = results.reduce((acc, r) => acc + parseFloat(r?.points ?? '0'), 0);
  const fastestLaps = results.filter(r => r?.FastestLap?.rank === '1').length;
  const dnfs = results.filter(r => !['Finished', '+1 Lap', '+2 Laps', '+3 Laps'].includes(r?.status ?? 'Finished') && !r?.status?.startsWith('+')).length;

  const dob = driver?.dateOfBirth ? new Date(driver.dateOfBirth) : null;
  const age = dob ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000)) : null;

  return (
    <div className="page-wrap">
      {/* Back */}
      <Link href="/drivers" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px' }}>
        ← All Drivers
      </Link>

      {/* Hero Card */}
      <div style={{ background: 'var(--bg-card)', border: `1px solid ${tc}40`, borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '36px' }}>
        <div style={{ height: '6px', background: tc }} />
        <div style={{ padding: '28px 32px', display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(64px,10vw,120px)', fontWeight: 900, color: tc, opacity: 0.2, lineHeight: 1, userSelect: 'none' }}>
            {driver?.permanentNumber ?? '0'}
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <img
                src={`https://flagcdn.com/${getCountryIsoCode(driver?.nationality ?? '')}.svg`}
                alt={driver?.nationality}
                style={{ width: '18px', height: '12px', objectFit: 'cover', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <span>{driver?.nationality}</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'uppercase', lineHeight: 0.95, color: 'var(--text-primary)', marginBottom: '10px' }}>
              {driver?.givenName}<br />
              <span style={{ color: tc }}>{driver?.familyName}</span>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="team-color-dot" style={{ backgroundColor: tc, width: '12px', height: '12px' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)' }}>{ctor?.name}</span>
            </div>
            {dob && (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                🎂 {dob.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} (Age {age})
              </div>
            )}
          </div>

          {/* Championship position */}
          {standing && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 28px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '52px', fontWeight: 900, color: standing.position === '1' ? 'var(--gold)' : 'var(--text-primary)', lineHeight: 1 }}>
                P{standing.position}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--text-muted)', marginTop: '4px' }}>CHAMPIONSHIP</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>{standing.points} PTS</div>
            </div>
          )}
        </div>
      </div>

      {/* Season Stats */}
      <h2 className="section-title"><span className="section-accent">📊</span> 2025 Season Stats</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '36px' }}>
        {[
          { label: 'Races', value: races.length },
          { label: 'Wins', value: wins },
          { label: 'Podiums', value: podiums },
          { label: 'Points', value: points },
          { label: 'Fastest Laps', value: fastestLaps },
          { label: 'DNFs', value: dnfs },
        ].map(({ label, value }) => (
          <div key={label} className="stat-box">
            <div className="stat-box-value" style={{ fontSize: '32px', color: value > 0 && label !== 'DNFs' ? 'var(--text-primary)' : label === 'DNFs' && value > 0 ? '#ff6b6b' : 'var(--text-primary)' }}>
              {value}
            </div>
            <div className="stat-box-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Race-by-Race Results */}
      {races.length > 0 && (
        <>
          <h2 className="section-title"><span className="section-accent">🏁</span> Race Results</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="result-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Rnd</th>
                  <th>Race</th>
                  <th>Grid</th>
                  <th>Finish</th>
                  <th>Status</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {races.map(race => {
                  const r = race.Results?.[0];
                  if (!r) return null;
                  const isFastest = r.FastestLap?.rank === '1';
                  return (
                    <tr key={race.round}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>{race.round}</td>
                      <td>
                        <Link href={`/schedule/${race.round}`}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', color: 'var(--text-primary)' }}>
                            {race.raceName.replace(' Grand Prix', '')}
                          </div>
                        </Link>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>P{r.grid}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: positionColor(r.position) }}>
                          P{r.positionText}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {r.Time?.time ?? r.status}
                        {isFastest && <span className="fastest-tag" style={{ marginLeft: '6px' }}>FL</span>}
                      </td>
                      <td><span className="standings-points" style={{ fontSize: '15px' }}>{r.points}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
