// dependencies
import React from "react";

// components/Logo.tsx
export default function Logo({ width = 120, height }: {
  width?: number;
  height?: number;
}) {
  const dynamicHeight = Math.round(width * (200 / 680));
  return (
    <svg width={width} height={height ? dynamicHeight : height} viewBox="0 0 680 200" xmlns="http://www.w3.org/2000/svg">
      {/* Icon */}
      <g transform="translate(220, 100)">
        <path d="M-30,22 A38,38 0 0,1 30,22" fill="none" stroke="#D85A30" strokeWidth="8" strokeLinecap="round" />
        <path d="M-18,10 A24,24 0 0,1 18,10" fill="none" stroke="#7F77DD" strokeWidth="8" strokeLinecap="round" />
        <path d="M-8,1 A12,12 0 0,1 8,1"    fill="none" stroke="#1D9E75" strokeWidth="8" strokeLinecap="round" />
        <circle cx="0" cy="22" r="6" fill="#D85A30" />
      </g>

      {/* Wordmark — startx: icon center (220) + icon radius (30) + gap (20) = 270 */}
      <text x="270" y="100" fontFamily="var(--font-sans)" fontSize="48" fontWeight="500" fill="var(--color-text-primary)" letterSpacing="-1" textAnchor="start" dominantBaseline="middle">
        Acordio
      </text>

      {/* Tagline — samme x som wordmark */}
      <text x="272" y="138" fontFamily="var(--font-sans)" fontSize="12" fontWeight="400" fill="var(--color-text-secondary)" letterSpacing="2.5" textAnchor="start">
        FREELANCE PIPELINE
      </text>
    </svg>
  );
}
