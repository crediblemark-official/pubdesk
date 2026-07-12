# Pub-Ops (Manajemen Operasional & Alur Kerja Naskah)

Aplikasi ini adalah modul manajemen produksi dan operasional dalam ekosistem monorepo PubDesk. Digunakan oleh tim Redaksi dan Operasional untuk memantau status naskah buku dari tahap masuk hingga siap cetak.

## Fitur Utama

- **Pelacakan Siklus Hidup Naskah (Manuscript Tracking)**: Memantau status naskah dari editing, layouting, pembuatan cover, pengajuan ISBN, hingga siap cetak.
- **Manajemen Order & Antrean**: Mengelola antrean penugasan editor, desainer, dan layouter untuk setiap naskah yang masuk.
- **Penjadwalan & Distribusi Tugas**: Mengatur tenggat waktu dan delegasi pekerjaan tim kreatif secara visual.
- **Log Produksi & Riwayat Naskah**: Menyimpan riwayat perubahan status dan log setiap tahapan produksi.

## Pengembangan Lokal

Untuk menjalankan aplikasi ini dalam mode development:

```bash
# Menjalankan dev server pub-ops
bun run dev:ops
```

Untuk melakukan build produksi:

```bash
# Membuat bundle produksi pub-ops
bun run build:ops
```
