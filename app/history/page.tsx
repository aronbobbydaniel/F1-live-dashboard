'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// All-time F1 records (updated for 2025)
const RECORDS = [
  { label: 'Most World Championships', value: '7', holder: 'Lewis Hamilton (7) / Michael Schumacher (7)', icon: '👑', color: '#FFD700', note: 'Tied all-time record' },
  { label: 'Most Race Wins', value: '105', holder: 'Lewis Hamilton', icon: '🏆', color: '#E8002D', note: '+104 over Schumacher' },
  { label: 'Most Pole Positions', value: '104', holder: 'Lewis Hamilton', icon: '⚡', color: '#FF8000', note: 'Active record' },
  { label: 'Most Podiums', value: '197', holder: 'Lewis Hamilton', icon: '🥇', color: '#27F4D2', note: 'Unbroken record' },
  { label: 'Youngest Champion', value: '23', holder: 'Sebastian Vettel (2010)', icon: '🌟', color: '#3671C6', note: 'Age at championship' },
  { label: 'Oldest Champion', value: '46', holder: 'Juan Manuel Fangio (1957)', icon: '🎖', color: '#888', note: 'Age at championship' },
  { label: 'Fastest Lap Record', value: '1:19.119', holder: 'Valtteri Bottas — Monza 2020', icon: '⏱️', color: '#52E252', note: 'Fastest ever F1 lap' },
  { label: "Constructor's Titles", value: '16', holder: 'Ferrari (most in history)', icon: '🏎', color: '#E8002D', note: 'Active record' },
];

const LEGENDARY_CONSTRUCTORS = [
  { name: 'Ferrari', titles: 16, color: '#E8002D', debut: 1950, flag: 'it', wins: 243 },
  { name: 'McLaren', titles: 9, color: '#FF8000', debut: 1966, flag: 'gb', wins: 183 },
  { name: 'Williams', titles: 9, color: '#64C4FF', debut: 1969, flag: 'gb', wins: 114 },
  { name: 'Mercedes', titles: 8, color: '#27F4D2', debut: 1954, flag: 'de', wins: 125 },
  { name: 'Red Bull', titles: 6, color: '#3671C6', debut: 2005, flag: 'at', wins: 123 },
  { name: 'Lotus', titles: 7, color: '#00A550', debut: 1958, flag: 'gb', wins: 79 },
];

const COUNTRY_ISO_CODES: Record<string, string> = {
  'British': 'gb', 'Dutch': 'nl', 'Spanish': 'es', 'Monegasque': 'mc',
  'Mexican': 'mx', 'Australian': 'au', 'German': 'de', 'Finnish': 'fi',
  'French': 'fr', 'Canadian': 'ca', 'Italian': 'it', 'American': 'us',
  'Thai': 'th', 'Japanese': 'jp', 'Chinese': 'cn', 'Brazilian': 'br',
  'Argentine': 'ar', 'Austrian': 'at', 'Danish': 'dk', 'New Zealander': 'nz',
  'South African': 'za', 'Polish': 'pl', 'Swiss': 'ch', 'Hungarian': 'hu',
  'Bahraini': 'bh', 'Saudi Arabian': 'sa', 'Swedish': 'se', 'Belgian': 'be',
};

function getCountryIsoCode(nat: string): string {
  return COUNTRY_ISO_CODES[nat] ?? 'un';
}

// Animated bar stat for constructors
function BarStat({ value, max, color }: { value: number; max: number; color: string }) {
  const [w, setW] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setW((value / max) * 100), 100); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, max]);
  return (
    <div ref={ref} style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
      <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: '2px', transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
    </div>
  );
}

export default function HistoryPage() {
  const useVideoBg = true; // TOGGLE THIS TO FALSE IF THE VIDEO GETS BLOCKED
  const [champions, setChampions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [visibleRange, setVisibleRange] = useState<[number, number]>([1950, 2025]);

  useEffect(() => {
    fetch('https://api.jolpi.ca/ergast/f1/driverStandings/1.json?limit=100')
      .then(r => r.json())
      .then(d => {
        const all = d?.MRData?.StandingsTable?.StandingsLists ?? [];
        setChampions(all.reverse());
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = champions.filter(c => {
    const name = `${c.DriverStandings?.[0]?.Driver?.givenName} ${c.DriverStandings?.[0]?.Driver?.familyName}`.toLowerCase();
    const ctor = c.DriverStandings?.[0]?.Constructors?.[0]?.name?.toLowerCase() ?? '';
    return (name.includes(search.toLowerCase()) || ctor.includes(search.toLowerCase()))
      && parseInt(c.season) >= visibleRange[0]
      && parseInt(c.season) <= visibleRange[1];
  }).reverse();

  return (
    <div className="history-page-container page-wrap">
      {useVideoBg && (
        <div className="history-video-bg">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="native-video-element"
          >
            <source src="/history-bg.mp4" type="video/mp4" />
            <source src="https://assets.mixkit.co/videos/preview/mixkit-tunnel-of-futuristic-lights-41564-large.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      {/* Hero Header */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Since 1950 · 75+ Seasons
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,6vw,64px)', fontWeight: 900, letterSpacing: '-1px', color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
          📖 F1 <span style={{ color: 'var(--accent)' }}>History</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--text-muted)', marginTop: '12px', maxWidth: '600px' }}>
          75+ years of speed, drama, champions, and legendary machines. Every title, every record, every dynasty.
        </p>
      </div>

      {/* Records Grid */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        ⚡ All-Time Records
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '56px' }}>
        {RECORDS.map((rec, i) => (
          <div key={rec.label}
            className="f1-record-card"
            style={{
              background: `linear-gradient(135deg, ${rec.color}0D, var(--bg-card))`,
              border: `1px solid ${rec.color}33`,
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              animation: `fadeSlideUp 0.5s ease both`,
              animationDelay: `${i * 0.05}s`,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 40px ${rec.color}20`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
          >
            <div style={{ fontSize: '32px', flexShrink: 0, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>{rec.icon}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <div className="f1-record-number" style={{ color: rec.color }}>{rec.value}</div>
              <div className="f1-record-title">{rec.label}</div>
              <div className="f1-record-holder">{rec.holder}</div>
              {rec.note && (
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 700, color: rec.color, opacity: 0.7, marginTop: '2px', letterSpacing: '0.5px' }}>{rec.note}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Champions Timeline */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>
          👑 World Champions
        </h2>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search driver or team..."
          style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
            fontSize: '13px', padding: '8px 16px', borderRadius: 'var(--radius)',
            outline: 'none', width: '220px',
          }}
        />
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /><span>Loading Champions...</span></div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '56px' }}>
          {filtered.map((c, i) => {
            const champ = c.DriverStandings?.[0];
            const driver = champ?.Driver;
            const ctor = champ?.Constructors?.[0];
            if (!driver) return null;
            const flagCode = getCountryIsoCode(driver.nationality);
            const isLatest = c.season === filtered[0]?.season;
            const year = parseInt(c.season);
            return (
              <div
                key={c.season}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 48px 1fr auto auto',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  background: isLatest ? 'rgba(255,215,0,0.05)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = isLatest ? 'rgba(255,215,0,0.05)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
              >
                {/* Season */}
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: year >= 2020 ? '20px' : '16px',
                  fontWeight: 900, color: isLatest ? 'var(--gold)' : 'var(--text-primary)',
                  letterSpacing: '-0.5px',
                }}>
                  {isLatest ? '👑 ' : ''}{c.season}
                </div>

                {/* Flag */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={`https://flagcdn.com/${flagCode}.svg`}
                    alt={driver.nationality}
                    style={{ width: '24px', height: '16px', objectFit: 'cover', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>

                {/* Driver + Team */}
                <div>
                  <Link href={`/drivers/${driver.driverId}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800,
                      color: isLatest ? 'var(--gold)' : 'var(--text-primary)',
                    }}>
                      {driver.givenName} {driver.familyName}
                    </div>
                  </Link>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {ctor?.name}
                  </div>
                </div>

                {/* Points */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{champ.points}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '1px', color: 'var(--text-muted)' }}>PTS</div>
                </div>

                {/* Wins */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--gold)' }}>{champ.wins}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '1px', color: 'var(--text-muted)' }}>WINS</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Constructor Dynasties */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        🏎 Constructor Dynasties
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px', marginBottom: '48px' }}>
        {LEGENDARY_CONSTRUCTORS.map((team, i) => (
          <div key={team.name}
            style={{
              background: `linear-gradient(135deg, ${team.color}15, var(--bg-card))`,
              border: `1px solid ${team.color}33`,
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              animation: `fadeSlideUp 0.5s ease both`,
              animationDelay: `${i * 0.07}s`,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 40px ${team.color}30`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <img
                src={`https://flagcdn.com/${team.flag}.svg`}
                alt={team.name}
                style={{ width: '22px', height: '14px', objectFit: 'cover', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{team.name}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 900, color: team.color, lineHeight: 1 }}>{team.titles}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>
              Constructor Titles
            </div>
            <BarStat value={team.titles} max={16} color={team.color} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--text-muted)' }}>Since {team.debut}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, color: team.color }}>{team.wins} Wins</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
