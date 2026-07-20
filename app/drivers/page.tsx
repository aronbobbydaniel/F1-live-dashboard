import { getAllDrivers, getDriverStandings } from '@/lib/jolpica';
import { StaggerReveal, ScrollReveal } from '@/components/GSAPAnimations';
import DriverCard from '@/components/DriverCard';
import { RACE_SEAT_DRIVERS_2026, getTeamColor } from '@/lib/f1-2026';

export const revalidate = 300;

export const metadata = {
  title: 'Drivers — F1 Dash',
  description: '2026 Formula 1 drivers with stats, profiles, team information, and headshots.',
};

export default async function DriversPage() {
  const [drivers, standings] = await Promise.all([
    getAllDrivers('current').catch(() => []),
    getDriverStandings('current').catch(() => []),
  ]);

  // Filter to only confirmed 2026 race-seat holders
  const raceDrivers = drivers.filter(d => RACE_SEAT_DRIVERS_2026.has(d.driverId));

  const standingMap = new Map(standings.map(s => [s.Driver.driverId, s]));

  return (
    <div className="page-wrap">
      <ScrollReveal delay={0}>
        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
            letterSpacing: 4, textTransform: 'uppercase', color: 'var(--text-muted)',
            marginBottom: 8,
          }}>Formula 1 · 2026 Season</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: -1, color: 'var(--text-primary)', margin: 0,
          }}>
            <span style={{ color: 'var(--accent)' }}>2026</span> Drivers
          </h1>
          <div style={{
            height: 3, width: 60, background: 'var(--accent)', borderRadius: 2,
            marginTop: 12, boxShadow: '0 0 12px var(--accent)',
          }} />
          <div style={{
            marginTop: 10, fontFamily: 'var(--font-display)', fontSize: 12,
            color: 'var(--text-muted)', letterSpacing: 1,
          }}>
            {raceDrivers.length} drivers · {standings.length > 0 ? 'Live standings' : 'Loading...'}
          </div>
        </div>
      </ScrollReveal>

      <StaggerReveal
        stagger={0.04}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))',
          gap: 14,
        }}
      >
        {raceDrivers.map(driver => {
          const standing   = standingMap.get(driver.driverId);
          const ctorId     = standing?.Constructors?.[0]?.constructorId ?? '';
          const ctorName   = standing?.Constructors?.[0]?.name ?? '–';
          const tc         = getTeamColor(ctorId);

          return (
            <DriverCard
              key={driver.driverId}
              driverId={driver.driverId}
              givenName={driver.givenName}
              familyName={driver.familyName}
              nationality={driver.nationality}
              permanentNumber={driver.permanentNumber ?? '??'}
              constructorId={ctorId}
              constructorName={ctorName}
              teamColor={tc}
              position={standing?.position}
              points={standing?.points}
              wins={standing?.wins}
            />
          );
        })}
      </StaggerReveal>
    </div>
  );
}
