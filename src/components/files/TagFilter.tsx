import React from 'react';

interface TagFilterProps {
  allTags: string[];
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({ allTags, selectedTag, setSelectedTag }) => {
  if (allTags.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        🏷️ Tag:
      </span>
      <select
        value={selectedTag || ''}
        onChange={(e) => setSelectedTag(e.target.value || null)}
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
        <option value="">Semua Tag</option>
        {allTags.map(tag => (
          <option key={tag} value={tag}>{tag}</option>
        ))}
      </select>
    </div>
  );
};
