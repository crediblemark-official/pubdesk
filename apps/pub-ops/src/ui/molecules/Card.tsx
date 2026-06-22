import React from 'react';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  hover?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children, style, hover = false, selected = false, onClick
}) => (
  <div
    onClick={onClick}
    style={{
      background: selected ? 'var(--bg-panel)' : 'var(--bg-card)',
      border: selected ? '1px solid var(--accent)' : '1px solid var(--border)',
      borderRadius: '12px',
      padding: '18px',
      cursor: onClick ? 'pointer' : undefined,
      transition: 'all 0.15s ease',
      ...style,
    }}
    onMouseEnter={hover ? (e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; } : undefined}
    onMouseLeave={hover ? (e) => { e.currentTarget.style.boxShadow = 'none'; } : undefined}
  >
    {children}
  </div>
);
