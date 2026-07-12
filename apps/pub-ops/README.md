# Pub-Ops (Manajemen Operasional & Alur Kerja Naskah)

Aplikasi ini adalah modul manajemen produksi dan operasional dalam ekosistem monorepo PubDesk. Digunakan oleh tim Redaksi dan Operasional untuk memantau status naskah buku dari tahap masuk hingga siap cetak.

## Fitur Utama

- **Pelacakan Siklus Hidup Naskah (Manuscript Tracking)**: Memantau status naskah dari editing, layouting, pembuatan cover, pengajuan ISBN, hingga siap cetak.
- **Manajemen Order & Antrean**: Mengelola antrean penugasan editor, desainer, dan layouter untuk setiap naskah yang masuk.
- **Penjadwalan & Distribusi Tugas**: Mengatur tenggat waktu dan delegasi pekerjaan tim kreatif secara visual.
- **Log Produksi & Riwayat Naskah**: Menyimpan riwayat perubahan status dan log setiap tahapan produksi.

## Pengembangan Lokal

Anda dapat menjalankan aplikasi ini menggunakan salah satu metode berikut:

### Metode 1: Dari Direktori Root Monorepo
Jalankan perintah ini di direktori utama proyek:
```bash
# Menjalankan dev server pub-ops
bun run dev:ops

# Membuat bundle produksi pub-ops
bun run build:ops
```

### Metode 2: Dari Dalam Direktori Aplikasi
Masuk ke subfolder aplikasi terlebih dahulu:
```bash
cd apps/pub-ops

# Menjalankan dev server
bun run dev

# Membuat bundle produksi
bun run build
```
