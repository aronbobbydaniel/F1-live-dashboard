'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import type { CircuitData } from '@/lib/circuits';
import { SPEED_COLORS } from '@/lib/circuits';

interface CircuitMapProps {
  circuit: CircuitData;
  animated?: boolean;
  showLabels?: boolean;
  height?: number;
}

export default function CircuitMap({ circuit, animated = true, showLabels = false, height = 240 }: CircuitMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [carPos, setCarPos] = useState<{ x: number; y: number; angle: number } | null>(null);
  const animRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const pathsRef = useRef<SVGPathElement[]>([]);
  const totalLengthRef = useRef(0);
  const segmentLengthsRef = useRef<number[]>([]);

  const draw = useCallback(() => {
    if (!svgRef.current) return;
    const paths = Array.from(svgRef.current.querySelectorAll<SVGPathElement>('path.track-segment'));
    pathsRef.current = paths;

    let total = 0;
    const lengths: number[] = [];
    paths.forEach(p => {
      const l = p.getTotalLength();
      lengths.push(l);
      total += l;
    });
    totalLengthRef.current = total;
    segmentLengthsRef.current = lengths;

    // Draw-on animation
    paths.forEach((p, i) => {
      const len = lengths[i];
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
      p.style.transition = `stroke-dashoffset ${0.6 + i * 0.08}s cubic-bezier(0.4,0,0.2,1) ${i * 0.05}s`;
      setTimeout(() => {
        p.style.strokeDashoffset = '0';
      }, 80);
    });

    setTimeout(() => {
      setDrawn(true);
      if (animated) animateCar();
    }, 800 + paths.length * 60);
    // eslint-disable-next-line
  }, [animated]);

  const getPositionOnTrack = useCallback((progress: number) => {
    const paths = pathsRef.current;
    if (!paths.length) return null;
    const total = totalLengthRef.current;
    const lengths = segmentLengthsRef.current;
    let dist = (progress % 1) * total;
    for (let i = 0; i < paths.length; i++) {
      if (dist <= lengths[i]) {
        const pt = paths[i].getPointAtLength(dist);
        const pt2 = paths[i].getPointAtLength(Math.min(dist + 2, lengths[i]));
        const angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI);
        return { x: pt.x, y: pt.y, angle };
      }
      dist -= lengths[i];
    }
    return null;
  }, []);

  const animateCar = useCallback(() => {
    const speed = 0.0008;
    const tick = () => {
      progressRef.current += speed;
      const pos = getPositionOnTrack(progressRef.current);
      if (pos) setCarPos(pos);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, [getPositionOnTrack]);

  useEffect(() => {
    const timeout = setTimeout(draw, 100);
    return () => {
      clearTimeout(timeout);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <svg
        ref={svgRef}
        viewBox={circuit.svgViewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Background glow for DRS zones */}
        {circuit.segments.filter(s => s.drs).map((seg, i) => (
          <path
            key={`glow-${i}`}
            d={seg.path}
            fill="none"
            stroke="rgba(255,215,0,0.12)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Track border (dark outer line) */}
        {circuit.segments.map((seg, i) => (
          <path
            key={`border-${i}`}
            d={seg.path}
            fill="none"
            stroke="rgba(0,0,0,0.8)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Main track segments — colored by speed zone */}
        {circuit.segments.map((seg, i) => (
          <path
            key={`seg-${i}`}
            d={seg.path}
            fill="none"
            stroke={SPEED_COLORS[seg.type]}
            strokeWidth={seg.type === 'straight' ? 7 : 6}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="track-segment"
            opacity="0.92"
          />
        ))}

        {/* DRS zone markers */}
        {circuit.segments.filter(s => s.drs).map((seg, i) => (
          <path
            key={`drs-${i}`}
            d={seg.path}
            fill="none"
            stroke="rgba(255,215,0,0.5)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 4"
          />
        ))}

        {/* Start/Finish line */}
        <g opacity="0.9">
          <line x1={parseFloat(circuit.svgViewBox.split(' ')[2]) * 0.18} y1={parseFloat(circuit.svgViewBox.split(' ')[3]) * 0.88}
                x2={parseFloat(circuit.svgViewBox.split(' ')[2]) * 0.18} y2={parseFloat(circuit.svgViewBox.split(' ')[3]) * 0.94}
                stroke="white" strokeWidth="3" />
        </g>

        {/* Corner labels */}
        {showLabels && circuit.corners.map((corner, i) => (
          <g key={i}>
            <circle cx={corner.x} cy={corner.y} r={5} fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <text
              x={corner.x + 8}
              y={corner.y + 4}
              fill="rgba(255,255,255,0.7)"
              fontSize="9"
              fontFamily="'Barlow Condensed', sans-serif"
              fontWeight="700"
            >
              {corner.name}
            </text>
          </g>
        ))}

        {/* Racing car dot */}
        {drawn && carPos && (
          <g transform={`translate(${carPos.x},${carPos.y}) rotate(${carPos.angle})`}>
            {/* Glow */}
            <circle r="10" fill="rgba(255,255,255,0.15)" />
            {/* Car body */}
            <circle r="5" fill="white" />
            {/* Headlight */}
            <circle r="2" cx="5" cy="0" fill="rgba(255,200,0,0.9)" />
          </g>
        )}
      </svg>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 4,
        right: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        background: 'rgba(10,10,15,0.7)',
        borderRadius: 6,
        padding: '5px 8px',
        backdropFilter: 'blur(8px)',
      }}>
        {[
          { color: SPEED_COLORS.straight, label: 'DRS' },
          { color: SPEED_COLORS.fast,     label: 'Fast' },
          { color: SPEED_COLORS.medium,   label: 'Mid' },
          { color: SPEED_COLORS.slow,     label: 'Slow' },
          { color: SPEED_COLORS.hairpin,  label: 'Hairpin' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 16, height: 3, background: l.color, borderRadius: 2 }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, letterSpacing: '0.5px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
