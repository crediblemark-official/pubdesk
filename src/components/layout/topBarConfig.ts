export const MODULE_LABELS: Record<string, string> = {
  'invoice': 'Invoice Generator',
  'invoice-manager': 'Manajemen Invoice',
  'invoice-insight': 'Invoice Insight',
  'extractor': 'Extractor',
  'files': 'Smart Folders',
  'books': 'Master Buku',
  'services': 'Master Layanan',
  'kontak': 'Master Data — Kontak',
  'penulis': 'Master Data — Penulis',
  'penerbit': 'Master Data — Penerbit',
  'naskah': 'Master Data — Naskah',
  'tim': 'Master Data — Tim',
  'legalitas': 'Master Data — Legalitas',
  'pelanggan': 'Master Data — Pelanggan',
  'ledger': 'Buku Besar',
  'settings': 'Pengaturan',
  'pekerjaan-saya': 'Pekerjaan Saya',
  'produksi-parent': 'Produksi Naskah',
  'produksi-board': 'Board Produksi',
  'produksi-list': 'Daftar Tugas',
  'produksi-kendala': 'Revisi & Kendala',
  'produksi-approval': 'Approval',
  'tambah-tugas': 'Tambah Tugas Baru',
  'edit-tugas': 'Edit Tugas',
  'laporan-operasional': 'Laporan Operasional',
  'import-data': 'Import Excel Lama',
  'activity-log': 'Activity Log',
};

export const SEARCHABLE_MODULES = new Set([
  'files', 'invoice-manager', 'kontak', 'penulis', 'penerbit', 'naskah',
  'tim', 'legalitas', 'pelanggan', 'produksi-list', 'produksi-board',
  'pekerjaan-saya', 'produksi-kendala', 'produksi-approval', 'produksi-timeline',
]);

export const SEARCH_PLACEHOLDERS: Record<string, string> = {
  'files': 'Cari berkas...',
  'kontak': 'Cari nama, email, WA...',
  'penulis': 'Cari nama, email, WA...',
  'penerbit': 'Cari nama penerbit...',
  'naskah': 'Cari judul, penulis, genre...',
  'tim': 'Cari nama, peran, divisi...',
  'legalitas': 'Cari judul, tipe...',
  'pelanggan': 'Cari nama, WA...',
  'produksi-timeline': 'Cari riwayat...',
};

export const SEARCH_HINTS: Record<string, string> = {
  'kontak': '🔍 Cari nama, email, WA...',
  'penulis': '🔍 Cari nama, email, WA...',
  'penerbit': '🔍 Cari nama penerbit...',
  'naskah': '🔍 Cari judul, penulis, genre...',
  'tim': '🔍 Cari nama, peran, divisi...',
  'legalitas': '🔍 Cari judul, tipe...',
  'pelanggan': '🔍 Cari nama, WA...',
};

export const DEFAULT_SEARCH_PLACEHOLDER = 'Cari judul naskah...';
export const DEFAULT_SEARCH_HINT = '🔍 Cari nomor invoice atau pelanggan...';
