import React from 'react';

export const FloatingFruit = ({ type = 'tomato', size = 48, style = {} }) => {
  const getFruitSvg = () => {
    switch (type) {
      case 'tomato':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <defs>
              <radialGradient id="tomGrad" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ff7675" />
                <stop offset="50%" stopColor="#d63031" />
                <stop offset="100%" stopColor="#8b0000" />
              </radialGradient>
              <filter id="fruitShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="8" stdDeviation="6" floodColor="#d63031" floodOpacity="0.3" />
              </filter>
            </defs>
            {/* Tomato Body */}
            <circle cx="50" cy="54" r="38" fill="url(#tomGrad)" filter="url(#fruitShadow)" />
            {/* Glossy highlight */}
            <ellipse cx="38" cy="38" rx="10" ry="6" transform="rotate(-30 38 38)" fill="rgba(255,255,255,0.6)" />
            {/* Green Calyx / Stem */}
            <path d="M50 20 C48 10 52 8 50 4 C47 7 45 12 48 18" stroke="#27ae60" strokeWidth="4" strokeLinecap="round" />
            <path d="M50 18 Q35 12 28 22 Q42 22 48 20" fill="#2ecc71" />
            <path d="M50 18 Q65 12 72 22 Q58 22 52 20" fill="#27ae60" />
            <path d="M50 18 Q45 28 50 32 Q55 28 50 18" fill="#2ecc71" />
          </svg>
        );
      case 'orange':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <defs>
              <radialGradient id="oraGrad" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#fed330" />
                <stop offset="50%" stopColor="#fa8231" />
                <stop offset="100%" stopColor="#c0392b" />
              </radialGradient>
              <filter id="oraShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="8" stdDeviation="6" floodColor="#fa8231" floodOpacity="0.35" />
              </filter>
            </defs>
            {/* Orange Body */}
            <circle cx="50" cy="52" r="38" fill="url(#oraGrad)" filter="url(#oraShadow)" />
            {/* Glossy highlight */}
            <ellipse cx="36" cy="36" rx="9" ry="5" transform="rotate(-35 36 36)" fill="rgba(255,255,255,0.55)" />
            {/* Green Leaf & Stem */}
            <path d="M50 16 C53 8 56 6 52 2" stroke="#27ae60" strokeWidth="3" strokeLinecap="round" />
            <path d="M50 15 Q65 6 74 16 Q60 22 50 15" fill="#2ecc71" />
          </svg>
        );
      case 'leaf':
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a8e063" />
                <stop offset="100%" stopColor="#56ab2f" />
              </linearGradient>
              <filter id="leafShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="1" dy="6" stdDeviation="5" floodColor="#56ab2f" floodOpacity="0.3" />
              </filter>
            </defs>
            <path
              d="M20 80 Q20 20 80 20 Q80 80 20 80 Z"
              fill="url(#leafGrad)"
              filter="url(#leafShadow)"
            />
            <path d="M20 80 Q50 50 80 20" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        ...style,
      }}
    >
      {getFruitSvg()}
    </div>
  );
};
