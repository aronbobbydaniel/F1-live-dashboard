'use client';
import { useEffect, useRef, useState } from 'react';
import type { CircuitData } from '@/lib/circuits';

interface ElevationProfileProps {
  circuit: CircuitData;
}

export default function ElevationProfile({ circuit }: ElevationProfileProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [progress, setProgress] = useState(0);
  const [carX, setCarX] = useState(0);

  const W = 600, H = 100;
  const pts = circuit.elevation;
  const minE = Math.min(...pts);
  const maxE = Math.max(...pts);
  const range = maxE - minE || 1;

  // Build SVG path for elevation
  const xStep = W / (pts.length - 1);
  const toY = (v: number) => H - 12 - ((v - minE) / range) * (H - 24);
  const toX = (i: number) => i * xStep;

  const linePath = pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)},${toY(v)}`).join(' ');
  const fillPath = `${linePath} L ${W},${H} L 0,${H} Z`;

  // Gradient stops based on gradient (positive = uphill = red, negative = downhill = blue)
  const gradientStops = pts.slice(0, -1).map((v, i) => {
    const diff = pts[i + 1] - v;
    const color = diff > 2 ? '#ef4444' : diff < -2 ? '#3b82f6' : '#22c55e';
    return { x: (i / (pts.length - 1)) * 100, color };
  });

  // Animate fill and car
  useEffect(() => {
    let p = 0;
    let raf: number;
    const tick = () => {
      p = Math.min(p + 0.008, 1);
      setProgress(p);
      setCarX(p * W);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    const t = setTimeout(() => { raf = requestAnimationFrame(tick); }, 400);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, []);

  // Car elevation Y at current position
  const carIdx = Math.min(Math.round(carX / xStep), pts.length - 1);
  const carY = toY(pts[carIdx] ?? minE);

  // Sector split lines
  const [s1, s2] = circuit.sectorBoundaries;
  const s1x = (s1 / 100) * W;
  const s2x = (s2 / 100) * W;

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Elevation Profile
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 800, color: '#ef4444' }}>
          ▲ {circuit.elevationChange}m
        </span>
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' }}>
          {[
            { color: '#ef4444', label: 'Uphill' },
            { color: '#22c55e', label: 'Flat' },
            { color: '#3b82f6', label: 'Downhill' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: 10, height: 10, background: l.color, borderRadius: '50%' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Profile */}
      <div style={{ position: 'relative', background: 'var(--bg-elevated)', borderRadius: '8px', overflow: 'hidden' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          style={{ width: '100%', height: '90px', display: 'block' }}
        >
          <defs>
            <linearGradient id={`elevGrad-${circuit.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              {gradientStops.map((s, i) => (
                <stop key={i} offset={`${s.x}%`} stopColor={s.color} />
              ))}
            </linearGradient>
            <linearGradient id={`fillGrad-${circuit.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
            </linearGradient>
            {/* Clip path for progress animation */}
            <clipPath id={`clip-${circuit.id}`}>
              <rect x="0" y="0" width={carX} height={H} />
            </clipPath>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(f => (
            <line key={f} x1="0" y1={H * f} x2={W} y2={H * f} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          ))}

          {/* Fill (undrawn — faded) */}
          <path d={fillPath} fill="rgba(255,255,255,0.03)" />

          {/* Fill (drawn — animated) */}
          <path d={fillPath} fill={`url(#fillGrad-${circuit.id})`} clipPath={`url(#clip-${circuit.id})`} />

          {/* Elevation line (undrawn faded) */}
          <path d={linePath} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />

          {/* Elevation line (animated progress) */}
          <path
            d={linePath}
            fill="none"
            stroke={`url(#elevGrad-${circuit.id})`}
            strokeWidth="2.5"
            clipPath={`url(#clip-${circuit.id})`}
          />

          {/* Sector split lines */}
          <line x1={s1x} y1="0" x2={s1x} y2={H} stroke="rgba(255,215,0,0.4)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={s2x} y1="0" x2={s2x} y2={H} stroke="rgba(255,215,0,0.4)" strokeWidth="1" strokeDasharray="3 3" />

          {/* Sector labels */}
          <text x={s1x / 2} y={H - 3} fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="'Barlow Condensed', sans-serif" fontWeight="700" textAnchor="middle">S1</text>
          <text x={(s1x + s2x) / 2} y={H - 3} fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="'Barlow Condensed', sans-serif" fontWeight="700" textAnchor="middle">S2</text>
          <text x={(s2x + W) / 2} y={H - 3} fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="'Barlow Condensed', sans-serif" fontWeight="700" textAnchor="middle">S3</text>

          {/* Moving car on profile */}
          {progress > 0.02 && (
            <g>
              <circle cx={carX} cy={carY} r={5} fill="white" />
              <circle cx={carX} cy={carY} r={9} fill="rgba(255,255,255,0.15)" />
            </g>
          )}

          {/* Min / Max labels */}
          <text x="4" y={toY(maxE) - 3} fill="rgba(255,100,100,0.7)" fontSize="9" fontFamily="'Barlow Condensed', sans-serif" fontWeight="700">
            +{maxE - minE}m
          </text>
        </svg>
      </div>

      {/* Sector legend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginTop: '8px' }}>
        {[
          { label: 'Sector 1', color: '#FFD700' },
          { label: 'Sector 2', color: '#FFD700' },
          { label: 'Sector 3', color: '#FFD700' },
        ].map((s, i) => (
          <div key={i} style={{ fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'center', borderTop: `1px solid rgba(255,215,0,0.3)`, paddingTop: '4px' }}>
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
