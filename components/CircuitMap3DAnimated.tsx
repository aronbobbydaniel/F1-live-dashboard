'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import dynamic from 'next/dynamic';

const CircuitMap3D = dynamic(() => import('./CircuitMap3D'), { ssr: false });

interface Props {
  circuitId: string;
  height?: number;
}

export default function CircuitMap3DAnimated({ circuitId, height = 380 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    // Scale-up + fade entrance — the "track drawing itself in"
    gsap.fromTo(
      el,
      { opacity: 0, scale: 0.88, y: 20 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.1,
        delay: 0.2,
        ease: 'power4.out',
      }
    );
  }, [circuitId]);

  return (
    <div ref={wrapRef} style={{ opacity: 0, width: '100%' }}>
      <CircuitMap3D circuitId={circuitId} height={height} />
    </div>
  );
}
