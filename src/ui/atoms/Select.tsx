import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label, options, fullWidth, style, ...rest
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: fullWidth ? '100%' : undefined }}>
    {label && (
      <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
        {label}
      </label>
    )}
    <select
      style={{
        width: '100%',
        padding: '10px 14px',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        fontSize: '14px',
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        outline: 'none',
        boxSizing: 'border-box',
        cursor: 'pointer',
        ...style,
      }}
      {...rest}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);
