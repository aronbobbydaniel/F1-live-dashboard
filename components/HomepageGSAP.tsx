'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function HomepageGSAP({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Trigger entrance stagger reveal animation on mount with clean props clearing
      gsap.from(['.hero-title', '.f1-card', '.card'], {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'filter,transform,opacity',
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
