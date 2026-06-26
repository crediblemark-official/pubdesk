<div align="center">
  <h1>📚 PubDesk Desktop Suite</h1>
  <p><strong>Sistem Manajemen Penerbitan & Operasional Buku Terpadu</strong></p>
  <p>
    Sebuah ERP modern, super cepat, dan aman, yang dibangun khusus untuk industri penerbitan buku.<br>
    Berbasis arsitektur <em>Micro-frontend Desktop</em> menggunakan <strong>Tauri, React, dan Rust</strong>.
  </p>
</div>

---

## 🌟 Kenapa PubDesk?

PubDesk hadir untuk memecahkan masalah operasional penerbitan tradisional yang lambat dan tersebar di berbagai platform. Mulai dari manajemen naskah, penjadwalan produksi, hingga penagihan invoice, semuanya terpusat, cepat, dan bekerja secara offline-first dengan sinkronisasi pintar.

### ✨ Fitur Unggulan
- ⚡ **Performa Native:** Dibangun di atas Tauri & Rust, sangat ringan dan memakan RAM jauh lebih kecil dari aplikasi Electron.
- 🔗 **Arsitektur Modular:** Terbagi dalam 4 aplikasi terpisah yang fokus pada tugas spesifik, namun menggunakan satu database (Local & Cloud Sync).
- 📴 **Offline-First:** Tetap bisa bekerja 100% saat tidak ada internet. Data akan tersinkronisasi (P2P / Cloud) secara otomatis saat online.
- 🎨 **UI/UX Premium:** Antarmuka modern, elegan, responsif, dan mudah digunakan (Glassmorphism & Mode Gelap).

---

## 🏗️ Modul Aplikasi (Monorepo)

PubDesk menerapkan arsitektur **Monorepo Modular** menggunakan **Bun Workspaces**. Kode dan logika bisnis dipecah ke dalam beberapa *packages*, sementara aplikasi end-user terbagi menjadi 4 pilar utama:

### 👑 1. PubAdmin (Manajemen Tim & Pengaturan)
Pusat kontrol untuk *Business Owner* dan Manajer. 
- Manajemen anggota tim & hak akses (PIN khusus).
- Pengaturan master (Layanan, Harga, Setup Sinkronisasi).
- Analitik & *Activity Log* keseluruhan sistem.

### 💼 2. PubOps (CRM & Produksi Naskah)
Alat harian untuk editor, layouter, desainer, dan tim operasional.
- CRM: Manajemen Penulis & Penerbit (Kontak, Alamat, Status).
- Produksi: Tracking naskah (Antrean, Layout, Desain Cover, Proofread, Cetak).
- Manajemen Legalitas (ISBN, HAKI).

### 💰 3. PubBilling (Keuangan & Invoicing)
Sistem keuangan terintegrasi untuk mencatat transaksi secara rapi.
- Pembuatan Invoice pintar dan kustom.
- Pelacakan status pembayaran (Lunas, DP, Menunggu).
- Kalkulasi Harga Layanan otomatis berdasarkan Master Data.

### 📁 4. PubFiles (Smart Folders & Indexer)
Berkolaborasi file tanpa pusing mencari letak dokumen.
- Manajer file lokal & sinkronisasi Google Drive.
- Sistem pencarian semantik tingkat lanjut untuk dokumen naskah.

---

## 💻 Tech Stack
- **Frontend:** React 19, TypeScript, Vite, CSS Native
- **Backend/Core:** Rust, Tauri v2
- **Database:** SQLite (Bundled with Rust)
- **Paket Manajer:** Bun (Ultra-fast workflow)
- **CI/CD:** GitHub Actions (Otomasi rilis Windows & Linux)

---

## 🚀 Cara Menjalankan Aplikasi (Development)

Pastikan Anda sudah menginstal **Bun** dan toolchain **Rust**.

1. **Install semua dependensi monorepo:**
   ```bash
   bun install
   ```

2. **Jalankan Aplikasi:**
   Pilih aplikasi yang ingin Anda uji coba, lalu jalankan perintah `bun tauri dev` di direktorinya:
   ```bash
   cd apps/pub-admin && bun tauri dev
   # Atau pub-ops, pub-billing, pub-files
   ```

---

## 📦 Build & Release (Production)

Anda dapat membuat *installer* secara lokal menggunakan perintah build:

```bash
cd apps/pub-admin && bun tauri build
```
*(Installer .exe / .deb akan dihasilkan di dalam folder `src-tauri/target/release/bundle/`)*

**🤖 Otomasi Rilis (GitHub Actions)**
Proyek ini sudah terintegrasi dengan GitHub Actions. Setiap kali Anda melakukan push *Tag* baru (misal: `v1.0.0`), GitHub akan otomatis melakukan kompilasi untuk Windows dan Linux, lalu menerbitkannya di tab **Releases** repositori Anda.

---
<div align="center">
  <sub>Dibangun dengan ❤️ untuk masa depan penerbitan Indonesia.</sub>
</div>
