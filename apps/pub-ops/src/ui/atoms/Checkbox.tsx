import React from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  style,
  ...rest
}) => (
  <label
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      ...style,
    }}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{
        cursor: 'pointer',
        width: '16px',
        height: '16px',
      }}
      {...rest}
    />
    {label}
  </label>
);
