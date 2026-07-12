# Pub-Files (Manajemen Berkas & Aset Digital)

Aplikasi ini adalah modul penyimpanan berkas dan manajemen aset digital dalam ekosistem monorepo PubDesk. Digunakan oleh seluruh tim untuk mengunggah, mengunduh, dan mengatur dokumen proyek.

## Fitur Utama

- **Unggah & Unduh Berkas**: Mengirimkan dokumen proyek, naskah mentah, cover buku, dan aset penunjang lainnya ke sistem penyimpanan lokal atau cloud.
- **Struktur Folder Dinamis**: Mengelola organisasi berkas berdasarkan kategori proyek dan status pengerjaan.
- **Sinkronisasi Berkas Cloud**: Integrasi penyimpanan dengan Google Drive, OneDrive, atau server FTP bersama.
- **Pratinjau Berkas**: Melihat langsung isi file gambar, teks, atau dokumen PDF dalam aplikasi.

## Pengembangan Lokal

Untuk menjalankan aplikasi ini dalam mode development:

```bash
# Menjalankan dev server pub-files
bun run dev:files
```

Untuk melakukan build produksi:

```bash
# Membuat bundle produksi pub-files
bun run build:files
```
