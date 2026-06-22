import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useAppContext } from '../../../contexts/AppContext';
import { invoke } from '@tauri-apps/api/core';

export const UserProfile: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { showToast } = useAppContext();

  if (!currentUser) return null;

  const handleLogoutClick = async () => {
    try {
      const activeSession = await invoke<any>('get_active_work_session');
      if (activeSession) {
        showToast('Gagal Logout! Harap hentikan sesi jam kerja Anda terlebih dahulu.', 'error');
        return;
      }
      await logout();
    } catch (err) {
      console.error('Gagal mengecek sesi kerja aktif:', err);
      // Fallback jika terjadi error system, izinkan tetap logout
      await logout();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '4px' }}>
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
      <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', userSelect: 'none' }}>
        {currentUser.tim_name}
      </span>
    </div>
  );
};
