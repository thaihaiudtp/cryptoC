
import { useEffect, useRef } from 'react';

// Simple deterministic avatar generator (Jazzicon alternative)
const generateAvatar = (address: string, size: number) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  const seed = parseInt(address.slice(2, 10), 16);
  const color1 = colors[seed % colors.length];
  const color2 = colors[(seed >> 4) % colors.length];
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="grad-${address}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#grad-${address})" />
      <circle cx="35" cy="40" r="8" fill="white" opacity="0.8" />
      <circle cx="65" cy="40" r="8" fill="white" opacity="0.8" />
      <path d="M 30 70 Q 50 85 70 70" stroke="white" stroke-width="3" fill="none" opacity="0.8" />
    </svg>
  `;
};

interface WalletAvatarProps {
  address: string;
  size?: number;
  className?: string;
}

const WalletAvatar = ({ address, size = 40, className = '' }: WalletAvatarProps) => {
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (avatarRef.current && address) {
      const svg = generateAvatar(address, size);
      avatarRef.current.innerHTML = svg;
    }
  }, [address, size]);

  return (
    <div 
      ref={avatarRef} 
      className={`inline-block rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export default WalletAvatar;
