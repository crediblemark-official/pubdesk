import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'accent' | 'danger';
  size?: 'sm' | 'md';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon, label, variant = 'default', size = 'md', style, ...rest
}) => {
  const sizePx = size === 'sm' ? 24 : 32;
  const colorMap = {
    default: 'var(--text-secondary)',
    accent: 'var(--accent)',
    danger: '#ef4444',
  };

  return (
    <button
      aria-label={label}
      title={label}
      style={{
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        border: 'none',
        background: 'transparent',
        color: colorMap[variant],
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
        flexShrink: 0,
        ...style,
      }}
      {...rest}
    >
      {icon}
    </button>
  );
};
