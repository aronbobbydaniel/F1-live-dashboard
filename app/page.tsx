import { getRaceSchedule, getDriverStandings, getConstructorStandings, getCountryFlag, getCountryIsoCode } from '@/lib/jolpica';
import CountdownTimer from '@/components/CountdownTimer';
import Link from 'next/link';
import { CIRCUITS, CIRCUIT_ID_MAP } from '@/lib/circuits';
import CircuitMap3DAnimated from '@/components/CircuitMap3DAnimated';
import { HomepageGSAP } from '@/components/HomepageGSAP';
import { VideoBackground } from '@/components/VideoBackground';

export const revalidate = 300;

export const metadata = {
  title: 'F1 Dash — Ultimate Formula 1 Hub',
  description: 'Live F1 timing tower, race countdown, points standings, driver profiles and complete Formula 1 history in one stunning dashboard.',
};

function getNextRace(races: any[]) {
  const now = new Date();
  return races.find(r => {
    const dt = r.time ? new Date(`${r.date}T${r.time}`) : new Date(r.date);
    return dt > now;
  }) ?? null;
}

const TEAM_COLORS: Record<string, string> = {
  'red_bull': '#3671C6', 'ferrari': '#E8002D', 'mercedes': '#27F4D2',
  'mclaren': '#FF8000', 'aston_martin': '#229971', 'alpine': '#FF87BC',
  'williams': '#64C4FF', 'rb': '#6692FF', 'sauber': '#52E252', 'haas': '#B6BABD',
};

function teamColor(constructorId: string) {
  const id = constructorId.toLowerCase();
  const key = Object.keys(TEAM_COLORS).find(k => id.includes(k));
  return key ? TEAM_COLORS[key] : '#888';
}

export default async function HomePage() {
  const [races, driverStandings, ctorStandings] = await Promise.all([
    getRaceSchedule('current').catch(() => []),
    getDriverStandings('current').catch(() => []),
    getConstructorStandings('current').catch(() => []),
  ]);

  const nextRace = getNextRace(races);
  const top5Drivers = driverStandings.slice(0, 5);
  const top5Ctors   = ctorStandings.slice(0, 5);
  const completedRaces = races.filter((r: any) => new Date(r.date) < new Date()).length;

  const raceDateTime = nextRace
    ? (nextRace.time ? `${nextRace.date}T${nextRace.time}` : `${nextRace.date}T14:00:00Z`)
    : null;

  const maxDriverPts = driverStandings[0] ? parseFloat(driverStandings[0].points) : 1;
  const maxCtorPts   = ctorStandings[0]   ? parseFloat(ctorStandings[0].points) : 1;

  // Get circuit for next race
  const nextCircuitId = nextRace?.Circuit?.circuitId;
  const circuitKey = nextCircuitId ? CIRCUIT_ID_MAP[nextCircuitId] : null;
  const circuitData = circuitKey ? CIRCUITS[circuitKey] : null;

  return (
    <HomepageGSAP>
      {true && <VideoBackground />}
      {/* ─── OUTLINED HERO GRID SECTION ───────────────────────────── */}
      <section className="hero-premium-outlined" style={{
        position: 'relative',
        padding: '100px 24px 80px',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        {/* Cinematic Grid and Stripe overlays */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '40px 40px', backgroundPosition: 'center center',
          pointerEvents: 'none', zIndex: 0, maskImage: 'radial-gradient(ellipse at center, black, transparent 70%)',
        }} />
        
        {/* High-Impact Red Ambient Atmosphere Glow */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '1200px',
          height: '550px',
          background: 'radial-gradient(ellipse at top, rgba(225, 6, 0, 0.55) 0%, rgba(225, 6, 0, 0.22) 45%, transparent 80%)',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(25px)',
        }} />

        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '5px',
          background: 'linear-gradient(90deg, #e10600, #ff3333, #bf00ff, #27f4d2)',
          opacity: 0.95, zIndex: 1,
        }} />

        <div className="hero-grid-container" style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
        }}>
          <div className="hero-split-grid">
            
            {/* Left Column: Coordinates, Outlined Header, Flashing live feed tag, Countdown */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
              
              {/* Coordinates Header */}
              {circuitData && (
                <div className="telemetry-mono" style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  color: 'var(--text-muted)',
                  opacity: 0.7,
                  marginBottom: '14px',
                  textTransform: 'uppercase',
                }}>
                  LOC: {circuitData.id === 'spa' ? 'STAVELOT' : circuitData.city.toUpperCase()}, {circuitData.country.toUpperCase()} // LAT: {circuitData.id === 'spa' ? '50.4372° N' : '0.0000° N'} // LON: {circuitData.id === 'spa' ? '5.9714° E' : '0.0000° E'}
                </div>
              )}

              {/* Eyebrow Satellite pulse badge */}
              <div className="live-telemetry-badge" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: '4px 12px', marginBottom: 16,
                fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800,
                letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-secondary)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-dot 1.5s infinite' }} />
                2026 Season Live Telemetry
              </div>

              {/* Outlined text title */}
              <h1 className="hero-title">
                DASHBOARD
              </h1>

              <p className="hero-subtitle-large" style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(14px, 2.2vw, 17px)', fontWeight: 700,
                color: 'var(--text-muted)', letterSpacing: 3, textTransform: 'uppercase',
                marginTop: -8, marginBottom: 32,
              }}>
                Formula 1 Ultimate Timing & Analytics Hub
              </p>

              {/* Centered countdown directly under outlined title */}
              {nextRace && raceDateTime && (
                <div className="hero-countdown-wrap" style={{ width: '100%', maxWidth: '600px' }}>
                  <CountdownTimer
                    targetDate={raceDateTime}
                    sessionName="Race"
                    raceName={nextRace.raceName}
                    flagCode={getCountryIsoCode(nextRace.Circuit?.Location?.country ?? '')}
                  />
                </div>
              )}
            </div>

            {/* Right Column: Telemetry 3D Circuit Canvas and weather specs */}
            <div className="home-stagger-item" style={{ width: '100%' }}>
              <div className="telemetry-viewport" style={{
                background: 'rgba(255, 255, 255, 0.01)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Radar Grid HUD markers */}
                <div style={{ position: 'absolute', top: 8, left: 12, fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }}>
                  + SYS.FEED_ON // GP.{nextRace?.round || '01'}
                </div>
                <div style={{ position: 'absolute', top: 8, right: 12, fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }}>
                  SEC.DEC // TRK.L
                </div>

                <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {circuitData ? (
                    <CircuitMap3DAnimated circuitId={circuitData.id} height={280} />
                  ) : (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-muted)' }}>LOADING 3D CIRCUIT MODEL...</div>
                  )}
                </div>

                {/* Telemetry data info stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '16px',
                  marginTop: '12px',
                }}>
                  {[
                    { label: 'AIR TEMP', value: '21°C' },
                    { label: 'TRACK TEMP', value: '29°C' },
                    { label: 'GRIP LEVEL', value: 'OPTIMAL' },
                  ].map(stat => (
                    <div key={stat.label} style={{ textAlign: 'center' }}>
                      <div className="telemetry-mono" style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                        {stat.label}
                      </div>
                      <div className="telemetry-mono" style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CSS Animation styles for outline fill */}
      <style>{`
        .hero-split-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          align-items: center;
        }
        @media (min-width: 992px) {
          .hero-split-grid {
            grid-template-columns: 1.15fr 0.85fr;
          }
        }
        .hero-title {
          font-family: var(--font-display);
          font-size: 6rem;
          font-weight: 900;
          line-height: 0.85;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 2px #333;
          transition: color 0.4s ease, -webkit-text-stroke-color 0.4s ease;
          cursor: default;
          margin-bottom: 12px;
          text-align: left;
        }
        .hero-title:hover {
          color: #E10600;
          -webkit-text-stroke-color: #E10600;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.9); }
        }
        @keyframes live-feed-flash {
          0%, 100% { opacity: 0.95; }
          50% { opacity: 0.45; }
        }
        .live-telemetry-badge {
          animation: live-feed-flash 2.5s infinite ease-in-out;
        }
      `}</style>

      {/* ─── HOME LAYOUT ────────────────────────────────────────── */}
      <div className="page-wrap" style={{ marginTop: 20 }}>
        
        {/* Row 1: Next Race Info Card + Circuit Preview */}
        {nextRace && (
          <section className="home-stagger-item" style={{ marginBottom: '48px' }}>
            <h2 className="section-title"><span className="section-accent">🏁</span> Grand Prix Details</h2>

            <div style={{ display: 'grid', gridTemplateColumns: circuitData ? '1fr 1fr' : '1fr', gap: '20px' }}>
              
              {/* Info Card */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                  <div style={{
                    width: 52, height: 35, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', borderRadius: 4, flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)',
                    background: '#141416',
                  }}>
                    <img
                      src={`https://flagcdn.com/${getCountryIsoCode(nextRace.Circuit?.Location?.country ?? '')}.svg`}
                      alt={nextRace.Circuit?.Location?.country}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
                      {nextRace.raceName}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Round {nextRace.round} · {nextRace.Circuit?.circuitName}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      📍 {nextRace.Circuit?.Location?.locality}, {nextRace.Circuit?.Location?.country}
                    </div>
                  </div>
                  <Link
                    href={`/schedule/${nextRace.round}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(225,6,0,0.1)',
                      border: '1px solid rgba(225,6,0,0.25)',
                      borderRadius: 'var(--radius)',
                      padding: '8px 14px',
                      fontFamily: 'var(--font-display)',
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      color: 'var(--accent)',
                      flexShrink: 0,
                    }}
                  >
                    Details →
                  </Link>
                </div>
              </div>

              {/* Circuit Preview */}
              {circuitData && (
                <div
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    background: 'var(--bg-card)',
                    borderColor: circuitData.color === '#000000' ? 'rgba(255,255,255,0.06)' : circuitData.color + '33',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Circuit Preview
                  </div>
                  
                  {/* Styled 3D map container */}
                  <div style={{ height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', borderRadius: 8, padding: 8, border: '1px solid rgba(255,255,255,0.02)' }}>
                    <CircuitMap3DAnimated circuitId={circuitData.id} height={170} />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '4px' }}>
                    {[
                      { label: 'Length', value: `${circuitData.length}km` },
                      { label: 'Laps', value: circuitData.laps },
                      { label: 'Turns', value: circuitData.turns },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: '8px' }}>
                        <div className="telemetry-mono" style={{ fontSize: '16px', fontWeight: 900, color: circuitData.color === '#000000' ? '#fff' : circuitData.color }}>
                          {s.value}
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Row 2: Driver Standings */}
        <section className="home-stagger-item" style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 className="section-title" style={{ margin: 0 }}><span className="section-accent">👤</span> Driver Standings</h2>
            <Link href="/standings" style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)' }}>
              View All →
            </Link>
          </div>
          
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {top5Drivers.map((d: any, i: number) => {
              const pct = (parseFloat(d.points) / maxDriverPts) * 100;
              const color = teamColor(d.Constructors?.[0]?.constructorId ?? '');
              return (
                <Link
                  key={d.Driver.driverId}
                  href={`/drivers/${d.Driver.driverId}`}
                  style={{ display: 'block', borderBottom: i < top5Drivers.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <div
                    className="timing-row-animated"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '48px 1fr auto',
                      alignItems: 'center',
                      padding: '14px 20px',
                      gap: '16px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 0,
                    }}
                  >
                    {/* Pos */}
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '22px',
                      fontWeight: 900,
                      color: i === 0 ? 'var(--gold)' : 'var(--text-secondary)',
                      textAlign: 'center',
                    }}>
                      {i === 0 ? '👑' : `P${d.position}`}
                    </div>

                    {/* Driver */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ width: '3px', height: '16px', background: color, borderRadius: '2px', flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
                          {d.Driver.givenName} {d.Driver.familyName}
                        </span>
                      </div>
                      <div className="points-bar-animated" style={{ maxWidth: '220px' }}>
                        <div
                          className="points-bar-fill"
                          style={{
                            width: `${pct}%`,
                            background: color,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Points */}
                    <div style={{ textAlign: 'right' }}>
                      <div className="telemetry-mono" style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>
                        {d.points}
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        {d.wins} wins
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Row 3: Constructor Standings */}
        <section className="home-stagger-item" style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 className="section-title" style={{ margin: 0 }}><span className="section-accent">🏎</span> Constructor Standings</h2>
            <Link href="/standings?tab=constructors" style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)' }}>
              View All →
            </Link>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {top5Ctors.map((c: any, i: number) => {
              const color = teamColor(c.Constructor.constructorId);
              const pct = (parseFloat(c.points) / maxCtorPts) * 100;
              return (
                <div
                  key={c.Constructor.constructorId}
                  className="card"
                  style={{ borderLeft: `4px solid ${color}`, padding: '16px', position: 'relative', overflow: 'hidden' }}
                >
                  <div style={{ position: 'absolute', top: 0, right: 0, fontFamily: 'var(--font-display)', fontSize: '64px', fontWeight: 900, color: color, opacity: 0.05, lineHeight: 1 }}>
                    P{c.position}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    P{c.position}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                    {c.Constructor.name}
                  </div>
                  <div className="points-bar-animated">
                    <div className="points-bar-fill" style={{ width: `${pct}%`, background: color, animationDelay: `${i * 0.08}s` }} />
                  </div>
                  <div className="telemetry-mono" style={{ fontSize: '22px', fontWeight: 900, color, marginTop: '8px' }}>
                    {c.points} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Row 4: Explore Grid */}
        <section className="home-stagger-item" style={{ marginBottom: '48px' }}>
          <h2 className="section-title"><span className="section-accent">🔗</span> Explore</h2>
          <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
            {[
              { href: '/live',      icon: '⏱️', label: 'Live Timing',   desc: 'Real-time F1 Dash tower',     color: '#e10600' },
              { href: '/schedule',  icon: '📅', label: 'Race Calendar', desc: '2026 full schedule',           color: '#3671C6' },
              { href: '/standings', icon: '🏆', label: 'Standings',     desc: 'Driver & constructor',        color: '#ffd700' },
              { href: '/drivers',   icon: '👤', label: 'Drivers',       desc: 'Full 2026 grid profiles',     color: '#27F4D2' },
              { href: '/history',   icon: '📖', label: 'History',       desc: 'Champions & records',         color: '#bf00ff' },
            ].map(nav => (
              <Link key={nav.href} href={nav.href}>
                <div
                  className="card"
                  style={{
                    padding: '20px',
                    cursor: 'pointer',
                    borderLeft: `3px solid ${nav.color}`,
                    height: '100%',
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>{nav.icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 800, color: nav.color, marginBottom: '4px', letterSpacing: '1px' }}>
                    {nav.label}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{nav.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </HomepageGSAP>
  );
}
