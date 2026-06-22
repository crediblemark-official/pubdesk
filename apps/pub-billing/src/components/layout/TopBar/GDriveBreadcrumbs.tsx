import React from 'react';
import { File } from '../../../types/file.types';
import { parseModifiedBy } from '../../../utils/gdrive';

interface GDriveBreadcrumbsProps {
  currentFolderId: string;
  files: File[];
}

export const GDriveBreadcrumbs: React.FC<GDriveBreadcrumbsProps> = ({ currentFolderId, files }) => {
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
