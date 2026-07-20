'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { CircuitData } from '@/lib/circuits';
import dynamic from 'next/dynamic';
import { getCountryIsoCode } from '@/lib/jolpica';

const CircuitMap = dynamic(() => import('./CircuitMap3DAnimated'), { ssr: false });

const ElevationProfile = dynamic(() => import('./ElevationProfile'), { ssr: false });

interface CircuitInfoProps {
  circuit: CircuitData;
}

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: 'easeOut' as const },
  }),
};

export default function CircuitInfo({ circuit }: CircuitInfoProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const accentColor = circuit.color === '#000000' ? '#ffffff' : circuit.color;

  const stats = [
    { label: 'Length',    value: `${circuit.length}km`,       icon: '📏' },
    { label: 'Laps',      value: circuit.laps,                 icon: '🔄' },
    { label: 'Turns',     value: circuit.turns,                icon: '↩️' },
    { label: 'DRS Zones', value: circuit.drsZones,             icon: '⚡' },
    { label: 'Top Speed', value: `${circuit.topSpeed}km/h`,    icon: '💨' },
    { label: 'First GP',  value: circuit.firstGP,              icon: '🏁' },
  ];

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ display: 'flex', alignItems: 'center', gap: '14px' }}
      >
        <div style={{
          width: 64, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', borderRadius: 4, flexShrink: 0,
          boxShadow: '0 2px 10px rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)',
          background: '#141416',
        }}>
          <img
            src={`https://flagcdn.com/${getCountryIsoCode(circuit.country)}.svg`}
            alt={circuit.country}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '2px' }}>
            Circuit · {circuit.city}, {circuit.country}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
            {circuit.name}
          </h3>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Elevation Change
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 900, color: circuit.elevationChange > 50 ? '#ef4444' : circuit.elevationChange > 20 ? '#f97316' : '#22c55e' }}>
            ▲ {circuit.elevationChange}m
          </div>
        </div>
      </motion.div>

      {/* Map + Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Track Map — big and prominent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          style={{
            background: 'var(--bg-elevated)',
            border: `1px solid ${accentColor}33`,
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 0 40px ${accentColor}10`,
          }}
        >
          {/* Glow behind map */}
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, ${accentColor}06, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Track Layout</span>
            <span style={{ color: accentColor }}>{circuit.turns} Turns</span>
          </div>
          <CircuitMap circuitId={circuit.id} height={220} />

        </motion.div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignContent: 'start' }}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={statVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              whileHover={{ scale: 1.04, y: -2 }}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '12px',
                cursor: 'default',
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{stat.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 900, color: accentColor, lineHeight: 1.1 }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '2px' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Elevation Profile — ANIMATED */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
        style={{
          background: 'var(--bg-elevated)',
          border: `1px solid ${accentColor}22`,
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
        }}
      >
        <ElevationProfile circuit={circuit} />
      </motion.div>

      {/* Lap Record */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.5 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'rgba(180,0,255,0.06)',
          border: '1px solid rgba(180,0,255,0.2)',
          borderRadius: 'var(--radius)',
          padding: '14px 18px',
        }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          🏆 Lap Record
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 900, color: '#bf00ff', letterSpacing: '1px' }}>
          {circuit.lapRecord.time}
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>
          {circuit.lapRecord.driver}
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--text-muted)' }}>
          ({circuit.lapRecord.year})
        </span>
      </motion.div>

      {/* Circuit Facts */}
      {circuit.facts && circuit.facts.length > 0 && (
      <div>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
          🎙️ Circuit Facts
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
          {circuit.facts.map((fact, i) => (
            <motion.div
              key={i}
              custom={i + 6}
              variants={statVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              style={{
                background: 'var(--bg-elevated)',
                border: `1px solid ${accentColor}22`,
                borderLeft: `3px solid ${accentColor}`,
                borderRadius: 'var(--radius)',
                padding: '12px 14px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 900, color: accentColor, flexShrink: 0, opacity: 0.6 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {fact}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
      )}


    </div>
  );
}
