import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => (
  <div
    style={{
      background: 'var(--bg-card)',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      borderLeft: `4px solid ${color}`,
    }}
  >
    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
      {value}
    </div>
    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</div>
  </div>
);
