export const MODULE_LABELS: Record<string, string> = {
  'home': 'Beranda Utama',
  'invoice': 'Invoice Generator',
  'invoice-manager': 'Manajemen Invoice',
  'invoice-insight': 'Invoice Insight',
  'services': 'Master Layanan',
  'pelanggan': 'Pelanggan',
  'laporan-operasional': 'Laporan Operasional',
  'activity-log': 'Activity Log',
  'master-data-parent': 'Dashboard Master Data',
  'invoice-parent': 'Dashboard Invoice',
  'settings-invoice': 'Pengaturan Invoice',
};

export const SEARCHABLE_MODULES = new Set([
  'invoice-manager', 'pelanggan', 'services',
]);

export const SEARCH_PLACEHOLDERS: Record<string, string> = {
  'invoice-manager': 'Cari invoice...',
  'pelanggan': 'Cari nama, WA...',
  'services': 'Cari nama layanan...',
};

export const SEARCH_HINTS: Record<string, string> = {
  'invoice-manager': '🔍 Cari nomor invoice atau pelanggan...',
  'pelanggan': '🔍 Cari nama atau WhatsApp pelanggan...',
  'services': '🔍 Cari nama atau kategori layanan...',
};

export const DEFAULT_SEARCH_PLACEHOLDER = 'Cari invoice...';
export const DEFAULT_SEARCH_HINT = '🔍 Cari nomor invoice atau pelanggan...';
