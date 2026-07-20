'use client';

import React, { useEffect, useRef } from 'react';

export const VideoBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Skip canvas animation on mobile to save GPU
    if (window.innerWidth <= 768) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Reduced star count from 350 → 150 for lower GPU load
    const numStars = 150;
    const stars: Array<{ x: number; y: number; z: number; o: number }> = [];

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
        o: Math.random() * 0.8 + 0.2,
      });
    }

    let lastTime = 0;
    // Cap at 30fps instead of 60fps — halves GPU work instantly
    const TARGET_INTERVAL = 1000 / 30;

    const render = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(render);

      if (timestamp - lastTime < TARGET_INTERVAL) return;
      lastTime = timestamp;

      ctx.fillStyle = 'rgba(5, 5, 7, 0.4)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < numStars; i++) {
        const star = stars[i];
        star.z -= 9; // Halved speed to match 30fps feel

        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
          star.z = width;
        }

        const k = 250 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const prevK = 250 / (star.z + 15);
          const prevPx = star.x * prevK + cx;
          const prevPy = star.y * prevK + cy;

          const size = Math.max(0.8, (1 - star.z / width) * 2.5);
          const alpha = (1 - star.z / width) * star.o;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(225, 30, 30, ${alpha * 0.75})`;
          ctx.lineWidth = size;
          ctx.moveTo(px, py);
          ctx.lineTo(prevPx, prevPy);
          ctx.stroke();

          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.arc(px, py, size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="home-video-bg">
      {/* Optimized Canvas Starfield — 30fps cap, 150 stars, mobile-disabled */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      {/* MP4 video — only render on desktop */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'translate(-50%, -50%)',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      >
        <source src="/home-bg.mp4" type="video/mp4" />
      </video>
    </div>
  );
};
