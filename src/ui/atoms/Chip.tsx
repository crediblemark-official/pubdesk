import React from 'react';

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  inactiveColor?: string;
  size?: 'sm' | 'md';
}

export const Chip: React.FC<ChipProps> = ({
  label, active, onClick, inactiveColor, size = 'md'
}) => {
  const sizeStyle = size === 'sm'
    ? { padding: '2px 8px', fontSize: '11px', height: '22px' }
    : { padding: '4px 10px', fontSize: '12px', height: '24px' };

  return (
    <button
      onClick={onClick}
      style={{
        ...sizeStyle,
        borderRadius: '20px',
        border: active ? 'none' : '1px solid rgba(255,255,255,0.05)',
        fontWeight: '600',
        cursor: 'pointer',
        background: active ? 'var(--accent)' : 'var(--bg-card)',
        color: active ? '#ffffff' : (inactiveColor ?? 'var(--text-secondary)'),
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {label}
    </button>
  );
};
