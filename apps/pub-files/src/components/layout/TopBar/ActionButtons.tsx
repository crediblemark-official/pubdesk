import React, { useState } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { useFileState } from '../../../contexts/FileContext';

interface ActionButtonsProps {
  activeModule?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ activeModule }) => {
  const {
    rightPanelVisible,
    setRightPanelVisible,
    fileLayoutMode,
    setFileLayoutMode
  } = useFileState();
  
  const { 
    showToast,
    loadFiles,
    loadInvoices,
    loadWatchFolders,
  } = useAppContext();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    showToast('Menyegarkan data file & folder...', 'info');
    try {
      await Promise.all([
        loadFiles(),
        loadInvoices(),
        loadWatchFolders(),
      ]);
      showToast('Data file & folder berhasil disegarkan!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyegarkan data.', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="top-bar-gnome-actions">
      <button 
        className="top-bar-btn" 
        onClick={handleRefresh}
        disabled={refreshing}
        title={refreshing ? "Sedang menyegarkan data..." : "Segarkan data file & folder"}
        aria-label="Refresh data"
        style={{
          color: refreshing ? 'var(--accent)' : 'var(--text-secondary)',
          cursor: refreshing ? 'not-allowed' : 'pointer'
        }}
      >
        <svg 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{
            animation: refreshing ? 'spin 1s linear infinite' : 'none'
          }}
        >
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.72 2.78L21 8" />
          <polyline points="21 3 21 8 16 8" />
        </svg>
      </button>

      {activeModule === 'files' && (
        <button
          className="top-bar-btn"
          onClick={() => setFileLayoutMode(fileLayoutMode === 'grid' ? 'list' : 'grid')}
          title={fileLayoutMode === 'grid' ? 'Tampilan Daftar' : 'Tampilan Grid'}
          aria-label="Toggle layout"
          style={{ color: 'var(--text-secondary)' }}
        >
          {fileLayoutMode === 'grid' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          )}
        </button>
      )}

      <button
        className={`top-bar-btn ${rightPanelVisible ? 'active' : ''}`}
        onClick={() => setRightPanelVisible(!rightPanelVisible)}
        style={{ color: rightPanelVisible ? 'var(--accent)' : 'var(--text-secondary)', background: rightPanelVisible ? 'var(--bg-card)' : 'transparent' }}
        aria-label="Toggle right panel"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </div>
  );
};
