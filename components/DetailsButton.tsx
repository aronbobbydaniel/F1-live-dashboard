'use client';
import React, { memo } from 'react';
import Link from 'next/link';

interface DetailsButtonProps {
  round: string | number;
}

const DetailsButton = memo(function DetailsButton({ round }: DetailsButtonProps) {
  return (
    <Link
      href={`/schedule/${round}`}
      prefetch={true}
      onClick={(e) => {
        e.stopPropagation();
      }}
      className="gp-details-btn"
    >
      Details →
    </Link>
  );
});

export default DetailsButton;
