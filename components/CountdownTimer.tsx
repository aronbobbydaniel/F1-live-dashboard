'use client';
import { useEffect, useState, useRef, memo } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  sessionName?: string;
  raceName?: string;
  flagCode?: string;
}

const trackThemes: Record<string, { primary: string; secondary: string; tertiary: string }> = {
  "Bahrain Grand Prix": { primary: "rgba(225, 6, 0, 0.25)", secondary: "rgba(255, 255, 255, 0.15)", tertiary: "rgba(225, 6, 0, 0.25)" },
  "Saudi Arabian Grand Prix": { primary: "rgba(0, 108, 53, 0.35)", secondary: "rgba(255, 255, 255, 0.15)", tertiary: "rgba(0, 108, 53, 0.35)" },
  "Australian Grand Prix": { primary: "rgba(0, 0, 128, 0.35)", secondary: "rgba(255, 255, 255, 0.15)", tertiary: "rgba(255, 0, 0, 0.35)" },
  "Japanese Grand Prix": { primary: "rgba(255, 255, 255, 0.25)", secondary: "rgba(188, 0, 45, 0.35)", tertiary: "rgba(255, 255, 255, 0.25)" },
  "Chinese Grand Prix": { primary: "rgba(238, 28, 37, 0.35)", secondary: "rgba(255, 242, 0, 0.25)", tertiary: "rgba(238, 28, 37, 0.35)" },
  "Miami Grand Prix": { primary: "rgba(0, 36, 125, 0.35)", secondary: "rgba(255, 255, 255, 0.15)", tertiary: "rgba(207, 20, 43, 0.35)" },
  "Emilia Romagna Grand Prix": { primary: "rgba(0, 146, 70, 0.35)", secondary: "rgba(255, 255, 255, 0.15)", tertiary: "rgba(205, 33, 42, 0.35)" },
  "Monaco Grand Prix": { primary: "rgba(225, 6, 0, 0.25)", secondary: "rgba(255, 255, 255, 0.15)", tertiary: "rgba(225, 6, 0, 0.25)" },
  "Canadian Grand Prix": { primary: "rgba(255, 0, 0, 0.35)", secondary: "rgba(255, 255, 255, 0.15)", tertiary: "rgba(255, 0, 0, 0.35)" },
  "Spanish Grand Prix": { primary: "rgba(198, 11, 30, 0.35)", secondary: "rgba(255, 196, 0, 0.25)", tertiary: "rgba(198, 11, 30, 0.35)" },
  "Austrian Grand Prix": { primary: "rgba(239, 51, 64, 0.35)", secondary: "rgba(255, 255, 255, 0.15)", tertiary: "rgba(239, 51, 64, 0.35)" },
  "British Grand Prix": { primary: "rgba(0, 36, 125, 0.35)", secondary: "rgba(255, 255, 255, 0.15)", tertiary: "rgba(207, 20, 43, 0.35)" },
  "Hungarian Grand Prix": { primary: "rgba(229, 29, 36, 0.35)", secondary: "rgba(255, 255, 255, 0.15)", tertiary: "rgba(32, 110, 56, 0.35)" },
  "Belgian Grand Prix": { primary: "rgba(225, 6, 0, 0.25)", secondary: "rgba(255, 208, 0, 0.25)", tertiary: "rgba(0, 0, 0, 0.45)" },
  "Dutch Grand Prix": { primary: "rgba(174, 28, 40, 0.35)", secondary: "rgba(255, 255, 255, 0.15)", tertiary: "rgba(33, 70, 139, 0.35)" },
  "Italian Grand Prix": { primary: "rgba(0, 146, 70, 0.35)", secondary: "rgba(255, 255, 255, 0.15)", tertiary: "rgba(205, 33, 42, 0.35)" },
  "Azerbaijan Grand Prix": { primary: "rgba(0, 181, 226, 0.35)", secondary: "rgba(239, 51, 64, 0.35)", tertiary: "rgba(80, 184, 72, 0.35)" },
  "Singapore Grand Prix": { primary: "rgba(237, 27, 36, 0.35)", secondary: "rgba(255, 255, 255, 0.15)", tertiary: "rgba(237, 27, 36, 0.35)" },
  "United States Grand Prix": { primary: "rgba(0, 36, 125, 0.35)", secondary: "rgba(255, 255, 255, 0.15)", tertiary: "rgba(207, 20, 43, 0.35)" },
  "Mexico City Grand Prix": { primary: "rgba(0, 168, 89, 0.35)", secondary: "rgba(255, 255, 255, 0.15)", tertiary: "rgba(225, 6, 0, 0.25)" },
  "São Paulo Grand Prix": { primary: "rgba(0, 151, 57, 0.35)", secondary: "rgba(254, 223, 0, 0.25)", tertiary: "rgba(0, 39, 118, 0.35)" },
  "Las Vegas Grand Prix": { primary: "rgba(0, 36, 125, 0.35)", secondary: "rgba(255, 255, 255, 0.15)", tertiary: "rgba(207, 20, 43, 0.35)" },
  "Qatar Grand Prix": { primary: "rgba(138, 21, 56, 0.35)", secondary: "rgba(255, 255, 255, 0.15)", tertiary: "rgba(138, 21, 56, 0.35)" },
  "Abu Dhabi Grand Prix": { primary: "rgba(255, 0, 0, 0.35)", secondary: "rgba(0, 115, 47, 0.35)", tertiary: "rgba(0, 0, 0, 0.45)" },
};

function getTrackTheme(raceName?: string) {
  if (!raceName) return { primary: "rgba(225, 6, 0, 0.08)", secondary: "rgba(255, 255, 255, 0.05)", tertiary: "rgba(225, 6, 0, 0.08)" };
  const key = Object.keys(trackThemes).find(k => raceName.toLowerCase().includes(k.toLowerCase()));
  return key ? trackThemes[key] : { primary: "rgba(225, 6, 0, 0.08)", secondary: "rgba(255, 255, 255, 0.05)", tertiary: "rgba(225, 6, 0, 0.08)" };
}

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, '0');
}

function getTimeLeft(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const s = Math.floor(diff / 1000);
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

function FlipUnit({ value, label }: { value: string; label: string }) {
  const prevRef = useRef(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (prevRef.current !== value) {
      setFlipping(true);
      const t = setTimeout(() => setFlipping(false), 300);
      prevRef.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div className="flip-unit">
      <div
        className="flip-card"
        style={{
          transform: flipping ? 'rotateX(-8deg) scale(0.97)' : 'rotateX(0deg) scale(1)',
          transition: 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      >
        <span className="flip-number">{value}</span>
      </div>
      <span className="flip-label">{label}</span>
    </div>
  );
}

const CountdownTimer = memo(function CountdownTimer({ targetDate, sessionName = 'Race', raceName, flagCode }: CountdownTimerProps) {
  // Initialize to zero to prevent server/client hydration mismatches.
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => setTime(getTimeLeft(targetDate));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const currentTheme = getTrackTheme(raceName);
  const isOver = mounted && Object.values(time).every(v => v === 0);

  const styleVars = {
    '--track-primary': currentTheme.primary,
    '--track-secondary': currentTheme.secondary,
    '--track-tertiary': currentTheme.tertiary,
  } as React.CSSProperties;

  if (isOver) {
    return (
      <div className="countdown-premium next-race-card" style={styleVars}>
        <div className="countdown-header">
          <span className="live-dot" />
          <span className="countdown-session-name">Live Now</span>
          {raceName && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {flagCode && (
                <img
                  src={`https://flagcdn.com/${flagCode}.svg`}
                  alt="Flag"
                  style={{ width: '20px', height: '14px', objectFit: 'cover', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              )}
              <span className="countdown-race-name">{raceName}</span>
            </div>
          )}
        </div>
        <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '3px', textTransform: 'uppercase' }}>
          🏁 Session In Progress
        </div>
      </div>
    );
  }

  return (
    <div className="countdown-premium next-race-card" style={{ ...styleVars, position: 'relative', overflow: 'hidden' }}>
      <div className="countdown-scan-beam" />
      <div className="countdown-header">
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="countdown-pulse-dot" />
            <span className="countdown-session-name">Next {sessionName}</span>
          </div>
          {raceName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              {flagCode && (
                <img
                  src={`https://flagcdn.com/${flagCode}.svg`}
                  alt="Flag"
                  style={{ width: '20px', height: '14px', objectFit: 'cover', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              )}
              <span className="countdown-race-name" style={{ margin: 0 }}>{raceName}</span>
            </div>
          )}
        </div>
        <span style={{ fontSize: '12px', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {new Date(targetDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
      </div>
      <div className="countdown-body">
        <FlipUnit value={pad(time.days)}    label="Days"    />
        <span className="flip-separator">:</span>
        <FlipUnit value={pad(time.hours)}   label="Hours"   />
        <span className="flip-separator">:</span>
        <FlipUnit value={pad(time.minutes)} label="Mins"    />
        <span className="flip-separator">:</span>
        <FlipUnit value={pad(time.seconds)} label="Secs"    />
      </div>
    </div>
  );
});

export default CountdownTimer;
