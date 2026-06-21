import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';

export const UserProfile: React.FC = () => {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }}>
      <div style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background: '#3b82f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '9px',
        fontWeight: '700',
        color: '#fff',
        flexShrink: 0,
      }}>
        {currentUser.tim_name.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('')}
      </div>
      <button
        onClick={logout}
        title="Logout / Ganti User"
        style={{
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: '0px',
          padding: '2px 8px',
          fontSize: '10px',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#ef4444';
          e.currentTarget.style.borderColor = '#ef4444';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logout
      </button>
    </div>
  );
};
