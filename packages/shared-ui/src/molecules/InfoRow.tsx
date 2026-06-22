import React from 'react';

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  noBorder?: boolean;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value, noBorder = false }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '8px',
      ...(noBorder ? {} : { borderBottom: '1px solid var(--border)', paddingBottom: '8px' }),
    }}
  >
    <span style={{ color: 'var(--text-secondary)', fontSize: '12px', flexShrink: 0 }}>
      {label}
    </span>
    <strong style={{ color: 'var(--text-primary)', fontSize: '12px', textAlign: 'right' }}>
      {value}
    </strong>
  </div>
);
