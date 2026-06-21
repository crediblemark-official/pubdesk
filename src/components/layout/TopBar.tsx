import React, { useState, useEffect } from 'react';
import { useFileState } from '../../contexts/FileContext';
import { useAppContext } from '../../contexts/AppContext';
import { parseModifiedBy } from '../../utils/gdrive';
import { WindowControls } from './WindowControls';
import {
  MODULE_LABELS,
  SEARCHABLE_MODULES,
  SEARCH_PLACEHOLDERS,
  SEARCH_HINTS,
  DEFAULT_SEARCH_PLACEHOLDER,
  DEFAULT_SEARCH_HINT,
} from './topBarConfig';

interface TopBarProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
  activeModule?: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar, sidebarCollapsed, activeModule, searchQuery = '', onSearchChange }) => {
  const {
    rightPanelVisible,
    setRightPanelVisible,
    canNavigateBack,
    canNavigateForward,
    navigateBack,
    navigateForward,
    fileLayoutMode,
    setFileLayoutMode,
    fileCategory,
    currentFolderId,
    files
  } = useFileState();
  const { importExportActions } = useAppContext();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeActions = activeModule ? importExportActions[activeModule] : undefined;

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleOutsideClick = () => {
      setIsDropdownOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [isDropdownOpen]);

  const isSearchable = activeModule ? SEARCHABLE_MODULES.has(activeModule) : false;
  const moduleLabel = MODULE_LABELS[activeModule ?? ''] ?? 'Files';
  const searchPlaceholder = SEARCH_PLACEHOLDERS[activeModule ?? ''] ?? DEFAULT_SEARCH_PLACEHOLDER;
  const searchHint = SEARCH_HINTS[activeModule ?? ''] ?? DEFAULT_SEARCH_HINT;

  const renderGBriveBreadcrumbs = () => {
    const serverIcon = (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#855800" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    );

    const rootFolderId = localStorage.getItem('gdrive_parent_folder_id') || 'root';

    if (currentFolderId === 'root' || currentFolderId === rootFolderId) {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {serverIcon}
          <span className="top-bar-path-text" style={{ fontWeight: '600', color: '#556B2F' }}>Google Drive</span>
        </div>
      );
    }

    const breadcrumbs: Array<{ id: string; name: string; icon?: React.ReactNode }> = [];
    breadcrumbs.push({ id: 'root', name: 'Google Drive', icon: serverIcon });

    if (currentFolderId.startsWith('ac_')) {
      const email = currentFolderId.replace('ac_', '');
      breadcrumbs.push({ id: currentFolderId, name: email });
    } else if (currentFolderId.startsWith('md_')) {
      const email = currentFolderId.replace('md_', '');
      breadcrumbs.push({ id: `ac_${email}`, name: email });
      breadcrumbs.push({ id: currentFolderId, name: 'Drive Saya' });
    } else if (currentFolderId.startsWith('swm_')) {
      const email = currentFolderId.replace('swm_', '');
      breadcrumbs.push({ id: `ac_${email}`, name: email });
      breadcrumbs.push({ id: currentFolderId, name: 'Shared with me' });
    } else {
      const pathList: Array<{ id: string; name: string }> = [];
      let tempId = currentFolderId;
      let limit = 10;
      let accountEmail = '';
      let isShared = false;

      while (tempId && tempId !== 'root' && !tempId.startsWith('ac_') && !tempId.startsWith('md_') && !tempId.startsWith('swm_') && limit > 0) {
        const folder = files.find(f => f.path === `gdrive://${tempId}`);
        if (folder) {
          pathList.unshift({ id: tempId, name: folder.filename });
          const meta = parseModifiedBy(folder.modified_by);
          tempId = meta.parentId || 'root';
          accountEmail = meta.accountEmail;
          isShared = meta.shared === '1';
        } else {
          break;
        }
        limit--;
      }

      if (accountEmail) {
        breadcrumbs.push({ id: `ac_${accountEmail}`, name: accountEmail });
        breadcrumbs.push({ id: isShared ? `swm_${accountEmail}` : `md_${accountEmail}`, name: isShared ? 'Shared with me' : 'Drive Saya' });
      }
      breadcrumbs.push(...pathList);
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {breadcrumbs.map((bc, idx) => (
          <React.Fragment key={bc.id}>
            {idx > 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '11px', margin: '0 2px' }}>&gt;</span>}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {bc.icon}
              <span className="top-bar-path-text" style={{
                fontWeight: idx === breadcrumbs.length - 1 ? '600' : '400',
                color: idx === 0 ? '#556B2F' : 'var(--text-primary)'
              }}>{bc.name}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="top-bar-container" data-tauri-drag-region>
      <div
        className="top-bar-sidebar-area"
        style={{ width: sidebarCollapsed ? '60px' : '260px' }}
        data-tauri-drag-region
      >
        {!sidebarCollapsed && (
          <button className="top-bar-btn" aria-label="Search sidebar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        )}

        {!sidebarCollapsed && (
          <span className="top-bar-sidebar-title">{moduleLabel}</span>
        )}

        <button className="top-bar-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      <div className="top-bar-main-area" data-tauri-drag-region>
        <div className="top-bar-nav-arrows">
          <button
            className="top-bar-btn"
            onClick={navigateBack}
            disabled={!canNavigateBack}
            style={{ opacity: canNavigateBack ? 1 : 0.4, cursor: canNavigateBack ? 'pointer' : 'not-allowed' }}
            aria-label="Back"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <button
            className="top-bar-btn"
            onClick={navigateForward}
            disabled={!canNavigateForward}
            style={{ opacity: canNavigateForward ? 1 : 0.4, cursor: canNavigateForward ? 'pointer' : 'not-allowed' }}
            aria-label="Forward"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        {isSearchable ? (
          (!isSearchFocused && !searchQuery) ? (
            <div
              className="top-bar-gnome-pathbar"
              onClick={() => setIsSearchFocused(true)}
              style={{ display: 'flex', alignItems: 'center', cursor: 'text', userSelect: 'none', width: '100%', padding: '0 8px' }}
            >
              {activeModule === 'files' ? (
                fileCategory === 'gdrive' ? renderGBriveBreadcrumbs() : <span className="top-bar-path-text">/home/rasyiqi</span>
              ) : (
                <span className="top-bar-path-text" style={{ color: 'var(--text-secondary)' }}>{searchHint}</span>
              )}
            </div>
          ) : (
            <div className="top-bar-gnome-pathbar" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '10px', color: 'var(--text-secondary)', fontSize: '14px', pointerEvents: 'none' }}>🔍</span>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                autoFocus
                onBlur={() => { if (!searchQuery) setIsSearchFocused(false); }}
                onChange={(e) => onSearchChange?.(e.target.value)}
                style={{
                  width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: '13px', paddingLeft: '30px', paddingRight: '8px',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => { onSearchChange?.(''); setIsSearchFocused(false); }}
                  className="top-bar-path-clear"
                  aria-label="Hapus pencarian"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          )
        ) : (
          <div className="top-bar-gnome-pathbar">
            <span className="top-bar-path-text">/home/rasyiqi</span>
            <button className="top-bar-path-clear" aria-label="Clear path">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        <button className="top-bar-btn-close-path" aria-label="Close path editing">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="top-bar-gnome-actions">
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

          {activeModule === 'files' && (
            <button
              className={`top-bar-btn ${fileLayoutMode === 'grid' ? 'active' : ''}`}
              onClick={() => setFileLayoutMode(fileLayoutMode === 'list' ? 'grid' : 'list')}
              title={fileLayoutMode === 'grid' ? 'Tampilan List' : 'Tampilan Grid'}
              style={{ color: fileLayoutMode === 'grid' ? 'var(--accent)' : 'var(--text-secondary)', background: fileLayoutMode === 'grid' ? 'var(--bg-card)' : 'transparent' }}
              aria-label="Toggle grid/list view"
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
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              )}
            </button>
          )}

          <div style={{ position: 'relative' }}>
            <button 
              className={`top-bar-btn top-bar-dropdown-btn ${isDropdownOpen ? 'active' : ''}`} 
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              style={{ 
                color: isDropdownOpen ? 'var(--accent)' : 'var(--text-secondary)',
                background: isDropdownOpen ? 'var(--bg-card)' : 'transparent',
                opacity: activeActions ? 1 : 0.4,
                cursor: activeActions ? 'pointer' : 'not-allowed'
              }}
              disabled={!activeActions}
              title={activeActions ? 'Ekspor/Impor Data' : 'Tidak ada opsi ekspor/impor untuk menu ini'}
              aria-label="Menu dropdown"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isDropdownOpen && activeActions && (
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 1000,
                  minWidth: '180px',
                  padding: '4px 0',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {activeActions.onDownloadTemplate && (
                  <button
                    onClick={() => {
                      activeActions.onDownloadTemplate?.();
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    📥 Unduh Template Excel
                  </button>
                )}
                {activeActions.onImport && (
                  <button
                    onClick={() => {
                      activeActions.onImport?.();
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    📥 Impor dari Excel
                  </button>
                )}
                {activeActions.onExport && (
                  <button
                    onClick={() => {
                      activeActions.onExport?.();
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    📤 Ekspor ke Excel
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="top-bar-gnome-separator" />

        <WindowControls />
      </div>
    </div>
  );
};

export { TopBar };
export default TopBar;
