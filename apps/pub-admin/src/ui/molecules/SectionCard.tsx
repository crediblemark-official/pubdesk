import React from 'react';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, children }) => (
  <div>
    <h5
      style={{
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        color: 'var(--text-secondary)',
        marginBottom: '8px',
      }}
    >
      {title}
    </h5>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: 'var(--bg-card)',
        padding: '12px 14px',
        borderRadius: '10px',
        border: '1px solid var(--border)',
      }}
    >
      {children}
    </div>
  </div>
);
