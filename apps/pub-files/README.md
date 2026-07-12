# Pub-Files (Manajemen Berkas & Aset Digital)

Aplikasi ini adalah modul penyimpanan berkas dan manajemen aset digital dalam ekosistem monorepo PubDesk. Digunakan oleh seluruh tim untuk mengunggah, mengunduh, dan mengatur dokumen proyek.

## Fitur Utama

- **Unggah & Unduh Berkas**: Mengirimkan dokumen proyek, naskah mentah, cover buku, dan aset penunjang lainnya ke sistem penyimpanan lokal atau cloud.
- **Struktur Folder Dinamis**: Mengelola organisasi berkas berdasarkan kategori proyek dan status pengerjaan.
- **Sinkronisasi Berkas Cloud**: Integrasi penyimpanan dengan Google Drive, OneDrive, atau server FTP bersama.
- **Pratinjau Berkas**: Melihat langsung isi file gambar, teks, atau dokumen PDF dalam aplikasi.

## Pengembangan Lokal

Anda dapat menjalankan aplikasi ini menggunakan salah satu metode berikut:

### Metode 1: Dari Direktori Root Monorepo
Jalankan perintah ini di direktori utama proyek:
```bash
# Menjalankan dev server pub-files
bun run dev:files

# Membuat bundle produksi pub-files
bun run build:files
```

### Metode 2: Dari Dalam Direktori Aplikasi
Masuk ke subfolder aplikasi terlebih dahulu:
```bash
cd apps/pub-files

# Menjalankan dev server
bun run dev

# Membuat bundle produksi
bun run build
```
