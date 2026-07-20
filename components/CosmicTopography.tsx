'use client';

import { useEffect, useState } from 'react';

interface Star {
  id: number;
  cx: string;
  cy: string;
  r: number;
  color: string;
  delay: string;
  duration: string;
}

export default function CosmicTopography() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Generate star nodes scattered across grid intersections
    const generated = Array.from({ length: 45 }).map((_, i) => {
      const isCyan = Math.random() > 0.6;
      return {
        id: i,
        cx: `${Math.random() * 100}%`,
        cy: `${Math.random() * 100}%`,
        r: Math.random() * 1.0 + 0.5, // 0.5px to 1.5px
        color: isCyan ? '#27F4D2' : '#ffffff',
        delay: `${Math.random() * 5}s`,
        duration: `${Math.random() * 4 + 2}s`,
      };
    });
    setStars(generated);
  }, []);

  return (
    <>
      <svg
        className="cosmic-topo-svg"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          pointerEvents: 'none',
          backgroundColor: '#050507',
        }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Neon glows */}
          <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComponentTransfer in="blur" result="glow">
              <feFuncA type="linear" slope="0.6" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Group 1 (Red glows): Slow topo drift animation */}
        <g style={{
          animation: 'topoDrift1 30s infinite ease-in-out alternate',
          transformOrigin: 'center center',
        }}>
          {/* Parallels/nested topographic fluid lines */}
          <path d="M -100,150 C 300,50 600,350 900,150 S 1200,-50 1600,200" stroke="rgba(225, 6, 0, 0.16)" strokeWidth="1.5" fill="none" filter="url(#glow-red)" />
          <path d="M -100,200 C 300,100 600,400 900,200 S 1200,0 1600,250" stroke="rgba(225, 6, 0, 0.14)" strokeWidth="1.5" fill="none" filter="url(#glow-red)" />
          <path d="M -100,250 C 300,150 600,450 900,250 S 1200,50 1600,300" stroke="rgba(225, 6, 0, 0.12)" strokeWidth="1.5" fill="none" filter="url(#glow-red)" />
          <path d="M -100,300 C 300,200 600,500 900,300 S 1200,100 1600,350" stroke="rgba(225, 6, 0, 0.10)" strokeWidth="1.5" fill="none" filter="url(#glow-red)" />
        </g>

        {/* Group 2 (Purple glows): Alternating shift animation */}
        <g style={{
          animation: 'topoDrift2 30s infinite ease-in-out alternate',
          transformOrigin: 'center center',
        }}>
          <path d="M -100,500 C 250,650 550,350 850,550 S 1250,750 1600,550" stroke="rgba(191, 0, 255, 0.14)" strokeWidth="1.5" fill="none" filter="url(#glow-red)" />
          <path d="M -100,550 C 250,700 550,400 850,600 S 1250,800 1600,600" stroke="rgba(191, 0, 255, 0.12)" strokeWidth="1.5" fill="none" filter="url(#glow-red)" />
          <path d="M -100,600 C 250,750 550,450 850,650 S 1250,850 1600,650" stroke="rgba(191, 0, 255, 0.10)" strokeWidth="1.5" fill="none" filter="url(#glow-red)" />
        </g>

        {/* Starfield Layer */}
        <g>
          {stars.map(star => (
            <circle
              key={star.id}
              cx={star.cx}
              cy={star.cy}
              r={star.r}
              fill={star.color}
              style={{
                animation: 'twinkle infinite ease-in-out',
                animationDelay: star.delay,
                animationDuration: star.duration,
              }}
            />
          ))}
        </g>
      </svg>

      {/* Styled JSX keyframe rules */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes topoDrift1 {
          0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          50% { transform: translate(25px, -15px) scale(1.03) rotate(0.5deg); }
          100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
        }
        @keyframes topoDrift2 {
          0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          50% { transform: translate(-20px, 25px) scale(0.98) rotate(-0.5deg); }
          100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.9); }
          50% { opacity: 0.85; transform: scale(1.1); }
        }
      `}} />
    </>
  );
}
