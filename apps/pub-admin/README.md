# Pub-Admin (Portal Manajemen & Administrasi)

Aplikasi ini adalah modul administrasi utama dalam ekosistem monorepo PubDesk. Digunakan oleh Administrator untuk mengelola operasional tim secara tersentralisasi.

## Fitur Utama

- **Manajemen Tim**: Menambah, mengubah, dan menghapus anggota tim serta mengatur penugasan peran.
- **Manajemen Hak Akses & Peran**: Mengontrol izin akses pengguna ke berbagai modul aplikasi.
- **Log Aktivitas Global**: Memantau catatan riwayat tindakan pengguna untuk keperluan audit.
- **Integrasi Sistem**: Mengelola pengaturan koneksi database dan sinkronisasi API luar.

## Pengembangan Lokal

Untuk menjalankan aplikasi ini dalam mode development:

```bash
# Menjalankan dev server pub-admin
bun run dev:admin
```

Untuk melakukan build produksi:

```bash
# Membuat bundle produksi pub-admin
bun run build:admin
```
