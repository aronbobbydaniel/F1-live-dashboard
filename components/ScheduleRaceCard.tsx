'use client';

import React, { memo } from 'react';
import { useRouter } from 'next/navigation';

interface ScheduleRaceCardProps {
  race: any;
  isNext: boolean;
  status: 'completed' | 'upcoming';
  flag: string;
  hasSprint: boolean;
  children: React.ReactNode;
}

const ScheduleRaceCard = memo(function ScheduleRaceCard({
  race, isNext, status, flag, hasSprint, children,
}: ScheduleRaceCardProps) {
  const router = useRouter();
  const tc = isNext ? '#ffd700' : status === 'completed' ? 'rgba(255,255,255,0.15)' : '#E10600';

  return (
    <div
      onClick={() => router.push(`/schedule/${race.round}`)}
      style={{
        background: isNext
          ? 'linear-gradient(135deg, rgba(255,215,0,0.08), var(--bg-card))'
          : status === 'completed'
          ? 'rgba(255,255,255,0.02)'
          : 'var(--bg-card)',
        border: `1px solid ${isNext ? '#ffd70055' : status === 'completed' ? 'rgba(255,255,255,0.06)' : 'var(--border)'}`,
        borderLeft: `4px solid ${tc}`,
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.2s',
        opacity: status === 'completed' ? 0.72 : 1,
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(-3px)';
        el.style.boxShadow = isNext
          ? '0 8px 30px rgba(255,215,0,0.15)'
          : '0 8px 30px rgba(225,6,0,0.12)';
        el.style.opacity = '1';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = '';
        el.style.boxShadow = '';
        el.style.opacity = status === 'completed' ? '0.72' : '1';
      }}
    >
      {children}
    </div>
  );
});

export default ScheduleRaceCard;
