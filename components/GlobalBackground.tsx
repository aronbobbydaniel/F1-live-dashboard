'use client';

export default function GlobalBackground() {
  return (
    <>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -20,
        backgroundColor: '#050505',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}>
        {/* Animated Radial Gradients */}
        <div className="radial-glow-layer" style={{
          position: 'absolute',
          inset: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle at 35% 25%, rgba(225, 6, 0, 0.07) 0%, transparent 40%), radial-gradient(circle at 75% 75%, rgba(191, 0, 255, 0.05) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(39, 244, 210, 0.02) 0%, transparent 50%)',
          filter: 'blur(100px)',
          animation: 'bgShift 45s infinite alternate ease-in-out',
        }} />
      </div>

      {/* SVG noise grain overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -19,
        pointerEvents: 'none',
        opacity: 0.025,
        mixBlendMode: 'overlay',
        backgroundRepeat: 'repeat',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />

      {/* CSS Animation declaration */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bgShift {
          0% { transform: rotate(0deg) translate(0px, 0px) scale(1); }
          50% { transform: rotate(4deg) translate(40px, -40px) scale(1.05); }
          100% { transform: rotate(-4deg) translate(-40px, 40px) scale(1); }
        }
      `}} />
    </>
  );
}
