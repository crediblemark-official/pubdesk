# Pub-Billing (Aplikasi Kasir & Penagihan)

Aplikasi ini adalah modul keuangan dan penagihan dalam ekosistem monorepo PubDesk. Digunakan oleh tim Billing/Kasir untuk mengelola transaksi pelanggan dan mencetak invoice.

## Fitur Utama

- **Pembuatan Invoice (Invoice Generator)**: Membuat invoice baru dengan detail perihal, lampiran, dan tabel rincian biaya yang dinamis.
- **Manajemen Profil Invoice (Template)**: Menyimpan preferensi kop surat, warna aksen, rekening bank, salam pembuka, dan salam penutup bawaan per profil usaha.
- **Pratinjau Interaktif**: Pratinjau invoice ukuran A4 dengan fitur zoom, pengaturan watermark status pembayaran (LUNAS/PENDING), dan fitur geser kursor (*drag-to-scroll*).
- **Ekspor PDF & Cetak**: Mengunduh invoice dalam format PDF secara instan menggunakan pustaka jsPDF.
- **Manajemen Pelanggan & Layanan**: Mengelola repositori data master pelanggan dan katalog layanan.

## Pengembangan Lokal

Untuk menjalankan aplikasi ini dalam mode development:

```bash
# Menjalankan dev server pub-billing
bun run dev:billing
```

Untuk melakukan build produksi:

```bash
# Membuat bundle produksi pub-billing
bun run build:billing
```
