import React from 'react';

interface AshokChakraProps {
  size?: number;
  color?: string;
  className?: string;
  animated?: boolean;
}

export function AshokChakra({ size = 40, color = '#000080', className = '', animated = false }: AshokChakraProps) {
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 15 * Math.PI) / 180;
    const innerR = 10;
    const outerR = 42;
    const x1 = 50 + innerR * Math.cos(angle);
    const y1 = 50 + innerR * Math.sin(angle);
    const x2 = 50 + outerR * Math.cos(angle);
    const y2 = 50 + outerR * Math.sin(angle);
    return { x1, y1, x2, y2 };
  });

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`${className} ${animated ? 'animate-spin' : ''}`}
      style={{ animationDuration: '3s' }}
    >
      <circle cx="50" cy="50" r="47" fill="none" stroke={color} strokeWidth="3" />
      <circle cx="50" cy="50" r="9" fill={color} />
      <circle cx="50" cy="50" r="5" fill="white" />
      {spokes.map((spoke, i) => (
        <line
          key={i}
          x1={spoke.x1}
          y1={spoke.y1}
          x2={spoke.x2}
          y2={spoke.y2}
          stroke={color}
          strokeWidth="1.8"
        />
      ))}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const r = 28;
        const cx = 50 + r * Math.cos(angle);
        const cy = 50 + r * Math.sin(angle);
        return <circle key={`dot-${i}`} cx={cx} cy={cy} r="2" fill={color} />;
      })}
    </svg>
  );
}
