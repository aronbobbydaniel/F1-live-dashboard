'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────
   ScrollReveal — wraps any children and fades/slides them
   in when they enter the viewport.
──────────────────────────────────────────────────────────*/
interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function ScrollReveal({ children, delay = 0, y = 28, className, style }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    return () => ctx.revert();
  }, [delay, y]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0, ...style }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   StaggerReveal — animates a group of children staggered
──────────────────────────────────────────────────────────*/
interface StaggerRevealProps {
  children: ReactNode;
  stagger?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function StaggerReveal({ children, stagger = 0.06, y = 24, className, style }: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(el.children);
      gsap.fromTo(
        items,
        { opacity: 0, y, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          stagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    return () => ctx.revert();
  }, [stagger, y]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   TiltCard — adds a smooth 3D tilt on hover via GSAP
──────────────────────────────────────────────────────────*/
interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxTilt?: number;
  glare?: boolean;
}

export function TiltCard({ children, className, style, maxTilt = 10, glare = true }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 → 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5;

    gsap.to(el, {
      rotateY: x * maxTilt * 2,
      rotateX: -y * maxTilt * 2,
      transformPerspective: 800,
      duration: 0.4,
      ease: 'power2.out',
    });

    if (glare && glareRef.current) {
      const angle = Math.atan2(y, x) * (180 / Math.PI);
      gsap.to(glareRef.current, {
        opacity: Math.hypot(x, y) * 0.5,
        background: `linear-gradient(${angle}deg, rgba(255,255,255,0.18) 0%, transparent 70%)`,
        duration: 0.3,
      });
    }
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, {
      rotateX: 0, rotateY: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
    });
    if (glare && glareRef.current) {
      gsap.to(glareRef.current, { opacity: 0, duration: 0.3 });
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, position: 'relative', transformStyle: 'preserve-3d', willChange: 'transform' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit',
            opacity: 0, pointerEvents: 'none', zIndex: 10,
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   FadeInImage — lazy-loads an image and fades it in with
   GSAP once it's fully loaded.
──────────────────────────────────────────────────────────*/
interface FadeInImageProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
  onError?: () => void;
}

export function FadeInImage({ src, alt, style, className, onError }: FadeInImageProps) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    gsap.set(img, { opacity: 0, scale: 0.95 });

    const onLoad = () => {
      gsap.to(img, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' });
    };

    if (img.complete && img.naturalWidth > 0) {
      onLoad();
    } else {
      img.addEventListener('load', onLoad);
      return () => img.removeEventListener('load', onLoad);
    }
  }, [src]);

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading="lazy"
      style={{ ...style, opacity: 0 }}
      className={className}
      onError={onError}
    />
  );
}

/* ─────────────────────────────────────────────────────────
   PageEntrance — runs a one-shot entrance animation on
   mount for hero sections.
──────────────────────────────────────────────────────────*/
interface PageEntranceProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function PageEntrance({ children, className, style }: PageEntranceProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 40, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: 'power4.out' }
    );
  }, []);

  return (
    <div ref={ref} className={className} style={{ opacity: 0, ...style }}>
      {children}
    </div>
  );
}
