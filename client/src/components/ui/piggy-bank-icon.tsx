import React from 'react';

interface PiggyBankIconProps {
  className?: string;
  size?: number;
}

export function PiggyBankIcon({ className = "", size = 24 }: PiggyBankIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`piggy-bank-icon ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="piggyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      
      {/* Main body */}
      <ellipse 
        cx="12" 
        cy="13" 
        rx="8" 
        ry="5.5" 
        fill="url(#piggyGradient)" 
        opacity="0.9"
      />
      
      {/* Snout */}
      <ellipse 
        cx="4.5" 
        cy="13" 
        rx="2" 
        ry="1.5" 
        fill="currentColor" 
        opacity="0.8"
      />
      
      {/* Legs */}
      <rect x="6" y="17" width="1.5" height="3" rx="0.75" fill="currentColor" opacity="0.7" />
      <rect x="9" y="17" width="1.5" height="3" rx="0.75" fill="currentColor" opacity="0.7" />
      <rect x="13" y="17" width="1.5" height="3" rx="0.75" fill="currentColor" opacity="0.7" />
      <rect x="16" y="17" width="1.5" height="3" rx="0.75" fill="currentColor" opacity="0.7" />
      
      {/* Ear */}
      <path 
        d="M15 8 Q18 6 19 9 Q18 11 15 10 Z" 
        fill="currentColor" 
        opacity="0.6"
      />
      
      {/* Eye */}
      <circle cx="8" cy="11" r="1" fill="rgba(255,255,255,0.9)" />
      <circle cx="8" cy="11" r="0.5" fill="rgba(0,0,0,0.8)" />
      
      {/* Coin slot */}
      <rect 
        x="11" 
        y="8" 
        width="3" 
        height="0.8" 
        rx="0.4" 
        fill="rgba(0,0,0,0.3)"
      />
      
      {/* Tail (curly) */}
      <path 
        d="M20 12 Q22 10 21 13 Q20 15 22 14" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        fill="none" 
        opacity="0.7"
      />
      
      {/* Nostrils */}
      <circle cx="3.8" cy="12.5" r="0.3" fill="rgba(0,0,0,0.5)" />
      <circle cx="3.8" cy="13.5" r="0.3" fill="rgba(0,0,0,0.5)" />
    </svg>
  );
}

export default PiggyBankIcon;
