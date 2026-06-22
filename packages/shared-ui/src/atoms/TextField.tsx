import React from 'react';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const TextField: React.FC<TextFieldProps> = ({
  label, error, fullWidth, style, ...rest
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: fullWidth ? '100%' : undefined }}>
    {label && (
      <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
        {label}
      </label>
    )}
    <input
      style={{
        width: '100%',
        height: '42px',
        padding: '10px 14px',
        border: `1px solid ${error ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: '8px',
        fontSize: '14px',
        lineHeight: '1.4',
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        outline: 'none',
        boxSizing: 'border-box',
        ...style,
      }}
      {...rest}
    />
    {error && <span style={{ fontSize: '11px', color: 'var(--accent)' }}>{error}</span>}
  </div>
);
