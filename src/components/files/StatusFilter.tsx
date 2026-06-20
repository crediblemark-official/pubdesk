import React from 'react';

interface StatusFilterProps {
  selectedStatus: string | null;
  setSelectedStatus: (status: string | null) => void;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({ selectedStatus, setSelectedStatus }) => {
  const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'review', label: 'Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'final', label: 'Final' },
    { value: 'Tersimpan', label: 'Tersimpan Lokal' },
    { value: 'Cloud', label: 'Tersedia di Cloud' }
  ];

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        🚦 Status:
      </span>
      <select
        value={selectedStatus || ''}
        onChange={(e) => setSelectedStatus(e.target.value || null)}
        style={{
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          outline: 'none',
          minWidth: '130px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
      >
        <option value="">Semua Status</option>
        {statuses.map(st => (
          <option key={st.value} value={st.value}>{st.label}</option>
        ))}
      </select>
    </div>
  );
};
