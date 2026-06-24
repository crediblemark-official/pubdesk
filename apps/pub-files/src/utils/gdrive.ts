export const parseModifiedBy = (modifiedBy?: string) => {
  if (!modifiedBy) return { size: '0', parentId: 'root', shared: '0', accountEmail: '' };
  const parts = modifiedBy.split('|');
  return {
    size: parts[0] || '0',
    parentId: parts[1] || 'root',
    shared: parts[2] || '0',
    accountEmail: parts[3] || ''
  };
};

export const getParentId = (file: any) => {
  if (file.type !== 'gdrive') return null;
  return parseModifiedBy(file.modified_by).parentId;
};

export const getIsShared = (file: any) => {
  if (file.type !== 'gdrive') return false;
  return parseModifiedBy(file.modified_by).shared === '1';
};

export const formatBytes = (modifiedBy?: string, mimeType?: string): string => {
  if (!modifiedBy) return '-';
  const sizePart = modifiedBy.split('|')[0] || '0';
  const bytes = parseInt(sizePart);
  if (isNaN(bytes) || bytes === 0) return '-';
  if (mimeType === 'application/vnd.google-apps.folder') return '-';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getMimeLabel = (mime?: string): string => {
  if (!mime) return 'Berkas Cloud';
  if (mime.startsWith('application/vnd.google-apps.')) {
    return mime.replace('application/vnd.google-apps.', 'Google ').toUpperCase();
  }
  return mime;
};

export const getDisplayType = (file: any) => {
  if (file.type === 'gdrive' && file.version_label === 'application/vnd.google-apps.folder') return 'Folder';
  const parts = file.filename.split('.');
  if (parts.length > 1) {
    const ext = parts[parts.length - 1].toUpperCase();
    if (file.type === 'gdrive' && file.version_label?.includes('google-apps')) {
      if (file.version_label.endsWith('document')) return 'Google Doc (DOCX)';
      if (file.version_label.endsWith('spreadsheet')) return 'Google Sheet (XLSX)';
      if (file.version_label.endsWith('presentation')) return 'Google Slide (PPTX)';
      return `Google ${ext}`;
    }
    return `${ext} File`;
  }
  if (file.type === 'gdrive') return 'Cloud File';
  return 'Berkas';
};
