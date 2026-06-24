export const MODULE_LABELS: Record<string, string> = {
  'home': 'Beranda Utama',
  'tim': 'Anggota Tim',
  'activity-log': 'Activity Log',
  'settings-p2p': 'Koneksi Jaringan',
  'settings-gas': 'Google Apps Script',
  'settings-data-reset': 'Reset Data',
};

export const SEARCHABLE_MODULES = new Set([
  'tim',
]);

export const SEARCH_PLACEHOLDERS: Record<string, string> = {
  'tim': 'Cari nama, peran, divisi...',
};

export const SEARCH_HINTS: Record<string, string> = {
  'tim': '🔍 Cari nama, peran, divisi...',
};

export const DEFAULT_SEARCH_PLACEHOLDER = 'Cari anggota tim...';
export const DEFAULT_SEARCH_HINT = '🔍 Cari nama atau peran anggota tim...';
