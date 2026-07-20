'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TiltCard, FadeInImage } from './GSAPAnimations';
import {
  DRIVER_HEADSHOTS,
  DRIVER_FLAGS,
  getDriverFlag as getFlag,
  getTeamLogo,
} from '@/lib/f1-2026';

/* ─────────────────────────────────────────────────────────
   DriverCard
──────────────────────────────────────────────────────────*/
interface DriverCardProps {
  driverId: string;
  givenName: string;
  familyName: string;
  nationality: string;
  permanentNumber: string;
  constructorId: string;
  constructorName: string;
  teamColor: string;
  position?: string;
  points?: string;
  wins?: string;
}

export default function DriverCard({
  driverId, givenName, familyName, nationality,
  permanentNumber, constructorId, constructorName,
  teamColor: tc, position, points, wins,
}: DriverCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const headshot = DRIVER_HEADSHOTS[driverId];
  const flag     = getFlag(nationality);
  const logo     = getTeamLogo(constructorId);

  return (
    <Link href={`/drivers/${driverId}`} style={{ textDecoration: 'none', display: 'block' }}>
      <TiltCard maxTilt={8} glare style={{
        background: `linear-gradient(160deg, ${tc}18 0%, #0d0d12 65%)`,
        border: `1px solid ${tc}30`,
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        height: '100%',
      }}>
        {/* Team color top bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${tc}, ${tc}44)` }} />

        <div style={{ padding: '18px 18px 14px', position: 'relative' }}>

          {/* Driver number watermark */}
          <div style={{
            position: 'absolute', top: 4, right: 10,
            fontFamily: 'var(--font-display)', fontSize: 68, fontWeight: 900,
            color: tc, opacity: 0.08, lineHeight: 1, userSelect: 'none',
            pointerEvents: 'none', letterSpacing: -2,
          }}>{permanentNumber}</div>

          {/* Team logo badge */}
          <div style={{
            position: 'absolute', top: 14, left: 14,
            background: `${tc}22`, border: `1px solid ${tc}44`,
            borderRadius: 6, padding: '2px 8px',
            fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 900,
            letterSpacing: 2, color: tc, textTransform: 'uppercase',
          }}>
            {logo.abbr}
          </div>

          {/* Headshot */}
          <div style={{
            width: '100%', height: 155,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            marginTop: 20, marginBottom: 10, position: 'relative', overflow: 'hidden',
          }}>
            {/* Glow */}
            <div style={{
              position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: 110, height: 55,
              background: `radial-gradient(ellipse, ${tc}55 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />
            {headshot && !imgErr ? (
              <FadeInImage
                src={headshot}
                alt={`${givenName} ${familyName}`}
                style={{
                  height: '100%', width: 'auto', objectFit: 'contain',
                  objectPosition: 'bottom', maxWidth: '100%',
                  filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.6))',
                }}
                onError={() => setImgErr(true)}
              />
            ) : (
              /* Initials avatar fallback */
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: `linear-gradient(135deg, ${tc}55, ${tc}11)`,
                border: `2px solid ${tc}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, color: tc,
              }}>{givenName[0]}{familyName[0]}</div>
            )}
          </div>

          {/* Name + flag */}
          <div style={{ marginBottom: 6 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
              letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 2,
            }}>{flag} #{permanentNumber}</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 18, textTransform: 'uppercase', lineHeight: 1.1,
              color: 'var(--text-primary)',
            }}>
              {givenName}<br />
              <span style={{ color: tc }}>{familyName}</span>
            </div>
          </div>

          {/* Constructor */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: tc }} />
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700,
              letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase',
            }}>{constructorName}</span>
          </div>

          {/* Stats */}
          {position && (
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              gap: 4, borderTop: `1px solid ${tc}22`, paddingTop: 10,
            }}>
              {[
                { label: 'POS',  value: `P${position}` },
                { label: 'PTS',  value: points ?? '0' },
                { label: 'WINS', value: wins ?? '0' },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 900,
                    color: 'var(--text-primary)', lineHeight: 1,
                  }}>{value}</div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 8, fontWeight: 700,
                    letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase',
                    marginTop: 2,
                  }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </TiltCard>
    </Link>
  );
}
