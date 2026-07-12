# Pub-Admin (Portal Manajemen & Administrasi)

Aplikasi ini adalah modul administrasi utama dalam ekosistem monorepo PubDesk. Digunakan oleh Administrator untuk mengelola operasional tim secara tersentralisasi.

## Fitur Utama

- **Manajemen Tim**: Menambah, mengubah, dan menghapus anggota tim serta mengatur peran (Role).
- **Log Aktivitas Global**: Memantau catatan riwayat tindakan pengguna di seluruh sistem untuk keperluan audit.
- **Integrasi Google Apps Script (GAS) Cloud Sync**: Mengatur sinkronisasi cloud dengan Google Apps Script.
- **Data Reset**: Fitur pembersihan dan inisialisasi ulang database sistem.

## Pengembangan Lokal

Anda dapat menjalankan aplikasi ini menggunakan salah satu metode berikut:

### Metode 1: Dari Direktori Root Monorepo
Jalankan perintah ini di direktori utama proyek:
```bash
# Menjalankan dev server pub-admin
bun run dev:admin

# Membuat bundle produksi pub-admin
bun run build:admin
```

### Metode 2: Dari Dalam Direktori Aplikasi
Masuk ke subfolder aplikasi terlebih dahulu:
```bash
cd apps/pub-admin

# Menjalankan dev server
bun run dev

# Membuat bundle produksi
bun run build
```
