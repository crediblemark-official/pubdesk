## Menangani File dan Data Lama: Strategi Onboarding Tanpa Migrasi

Salah satu janji utama PubHub Desktop adalah **In-Place Organizer**: tidak memaksa pengguna mengubah struktur file atau memigrasikan data. Lalu, bagaimana aplikasi menghadapi tumpukan file dan data historis yang sudah ada sebelum instalasi?

---

### 1. Prinsip Dasar: Baca dan Indeks, Jangan Pindahkan

PubHub Desktop **tidak pernah** memindahkan, mengganti nama, atau mengubah file tanpa perintah eksplisit dari pengguna. Untuk data lama, ia hanya melakukan:

- **Pemindaian (scanning)** folder yang ditentukan oleh pengguna.
- **Ekstraksi metadata** (nama file, tipe, tanggal modifikasi, ukuran, dan jika memungkinkan, isi teks untuk pencarian).
- **Penyimpanan indeks** di database SQLite lokal, terpisah dari file aslinya.

Dengan demikian, file tetap di tempatnya semula. PubHub hanya menambahkan lapisan informasi di atasnya.

---

### 2. Strategi untuk File-File Lama

#### 2.1. Saat Pertama Kali Menambahkan Folder Pantau

Saat pengguna membuka **Pengaturan** dan menambahkan folder (misal `D:\Penerbitan\Naskah`), backend akan:

1. **Memindai seluruh isi folder dan subfolder** secara rekursif.
2. Untuk setiap file, mencatat:
   - Path lengkap
   - Nama file
   - Tipe (docx, pdf, xlsx, gambar)
   - Tanggal dibuat dan dimodifikasi
   - Ukuran
   - Status awal (draft/revisi/final) — bisa disetel otomatis berdasarkan kata kunci di nama file (misal mengandung "Final" → status Final).
3. **Menyimpannya ke tabel `files`** di SQLite.
4. **Membangun indeks pencarian penuh** (FTS5) dari nama file dan, jika jenis file mendukung, teks isi (docx, pdf, xlsx yang bisa dibaca).

Proses ini berjalan di background dengan progress bar agar tidak membekukan UI. Selanjutnya, file watcher (`notify`) akan menangani perubahan setelahnya.

#### 2.2. Penanganan Nama File Tidak Terstruktur

File lama sering kali dinamai secara tidak konsisten, misalnya:
- `Naskah_Budi.docx`
- `Revisi_BukuA_2.docx`
- `BukuA_Final_Beneran.docx`

PubHub tidak memaksa pengguna mengganti nama. Sebaliknya:

- **Ekstraksi otomatis**: Backend mencoba mengenali judul buku, nama penulis, nomor revisi, dan status dari pola nama file umum menggunakan regex dan daftar buku yang sudah ada di database `books`. Jika dikenali, file langsung dikaitkan dengan proyek/buku terkait.
- **Tag manual**: Pengguna bisa menambahkan tag pada file lewat menu konteks (misal tag "Buku A", "Final", "Layout"). Tag ini memperkuat pencarian dan pengelompokan.
- **Pratinjau** di panel kanan memudahkan identifikasi isi tanpa membuka aplikasi asli.

#### 2.3. File Tanpa Metadata Proyek

File yang tidak bisa dikaitkan otomatis tetap terindeks dan dapat dicari berdasarkan nama atau isi teks. Pengguna dapat menautkan file ke proyek/buku secara manual melalui menu konteks: **"Tautkan ke Proyek..."**.

#### 2.4. Strategi Google Drive Cloud Indexing (Multi-Akun)

Sebagai penyesuaian utama untuk mendukung kerja kolaboratif jarak jauh, PubDesk mendukung pengindeksan direktori awan Google Drive dengan struktur multi-akun:
- **Penyelarasan Tanpa Unduh Massal**: Aplikasi hanya mengunduh daftar metadata file (nama, mimeType, ukuran, id parent, email pemilik) dari Google Drive API, lalu menyimpannya ke tabel database `files` lokal.
- **Virtual Folders**: Di antarmuka file manager, berkas disusun dalam folder virtual bertingkat berdasarkan akun (`ac_email`) -> kategori (`Drive Saya` dan `Shared with me`) -> folder internal Google Drive.
- **Clean-up Metadata Otomatis**: Jika file dihapus dari Google Drive cloud, proses sinkronisasi berikutnya akan secara otomatis menghapus metadata file tersebut dari database lokal agar data tetap konsisten.
- **Caching On-Demand**: File fisik biner (PDF, Gambar, dll.) hanya diunduh dan disimpan di cache lokal saat pengguna mengklik atau meminta pratinjau file tersebut menggunakan token OAuth yang sesuai.

---

### 3. Strategi untuk Data Transaksi Lama (Invoice Historis)

Banyak penerbitan memiliki invoice lama dalam bentuk:
- File Word/Excel yang tersimpan di folder
- Gambar struk di WhatsApp
- Catatan tangan di buku

#### 3.1. Tidak Wajib Migrasi

PubHub tidak memaksa memasukkan data historis ke database. Pengguna bisa langsung memulai transaksi baru dengan Invoice Generator, dan data baru akan otomatis tercatat di **Buku Besar Virtual**.

#### 3.2. Impor Opsional untuk Pelaporan Utuh

Jika pengguna ingin memiliki laporan keuangan yang utuh (termasuk data sebelum pakai PubHub), disediakan fitur **Impor CSV/Excel**:

- Format CSV sederhana: `Tanggal, Nama, WA, Item (JSON), Total, Keterangan`.
- Pengguna tinggal menyiapkan file CSV dari rekap Excel lama mereka, lalu mengimpornya sekali.
- Data masuk ke tabel `invoices_history` dengan flag `imported = true`.

Untuk file invoice berbentuk Word/gambar, pengguna bisa menyimpannya sebagai arsip di folder yang dipantau. PubHub akan mengindeksnya sebagai file biasa, bukan sebagai data transaksi terstruktur.

#### 3.3. Penautan Manual ke Kontak/Buku

Saat mengimpor, jika nama pelanggan atau judul buku sudah ada di database, sistem akan mencocokkan secara otomatis. Jika tidak, data baru akan menambah entri ke tabel `contacts` dan `books`.

---

### 4. Proses Onboarding Pertama Kali (First Run Wizard - Fase 2 Direncanakan)

> [!NOTE]
> Wizard onboarding interaktif langkah-demi-langkah ini direncanakan untuk **Fase 2**. Saat ini, pengguna langsung masuk ke halaman utama aplikasi dan dapat mengonfigurasi integrasi Google Drive secara mandiri di tab Pengaturan Umum.

Agar pengguna tidak bingung, aplikasi bisa menyajikan wizard sederhana saat pertama kali dijalankan:

```
┌──────────────────────────────────────────────────────┐
│          SELAMAT DATANG DI PUBHUB DESKTOP            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Mari siapkan ruang kerja Anda.                      │
│                                                      │
│  1. 📁 Pilih folder utama penerbitan Anda:           │
│     [ D:\Penerbitan                     ] [Browse]   │
│                                                      │
│  2. 📚 Apakah Anda punya daftar buku (Excel/CSV)?   │
│     [ ] Ya, impor sekarang                          │
│     [●] Tidak, saya akan isi manual                 │
│                                                      │
│  3. 🧾 Apakah Anda ingin mengimpor transaksi lama?   │
│     [ ] Ya, dari file CSV                           │
│     [●] Tidak, mulai dari transaksi baru            │
│                                                      │
│  [ Mulai ]   [ Lewati ]                              │
└──────────────────────────────────────────────────────┘
```

Wizard ini memicu:
- Pemindaian folder pertama (langsung berjalan di background).
- Impor buku (jika ada).
- Impor transaksi historis (jika ada).

Setelah itu, aplikasi langsung bisa digunakan untuk invoice baru sementara indeks file dibangun di background.

---

### 5. Klasifikasi File Lama Secara Otomatis (Heuristik - Fase 2 Direncanakan)

Untuk membantu pengguna menata file lama tanpa memindahkan, PubHub menyediakan **klasifikasi otomatis** berdasarkan nama file:

| Pola Nama File | Status | Tag Otomatis |
|----------------|--------|--------------|
| `*Final*` | Final | #final |
| `*Revisi*`, `*Rev*` | Revisi | #revisi |
| `*Draft*` | Draft | #draft |
| `*Layout*` | Layout | #layout |
| `*Cover*`, `*Sampul*` | Final | #aset #cover |
| `*Promo*`, `*Banner*` | Final | #aset #promo |
| `*Bab1*`..`*BabN*` | - | #naskah #bab |

Aturan ini bisa dikustomisasi di Pengaturan.

---

### 6. Backup & Integritas Data Lama

Karena data lama tetap di tempatnya, satu-satunya yang "baru" di PubHub adalah file database SQLite. Untuk keamanan:

- **Backup database** otomatis setiap interval tertentu ke folder aman.
- **Ekspor** data (buku, kontak, invoice) ke CSV kapan saja.
- Jika database rusak, pengguna tinggal mengganti dengan backup, dan **file asli tetap aman**.

---

### 7. Ringkasan: Tidak Ada yang Tersentuh, Semua Terlihat

| Jenis Data | Penanganan | Status Saat Ini |
|------------|------------|-----------------|
| Berkas Google Drive (Cloud) | Sinkronisasi metadata dinamis (multi-akun), folder virtual, download cache on-demand | **Aktif (Terimplementasi)** |
| Berkas naskah/aset lokal | Dipindai, diindeks (path, meta, teks), tidak dipindahkan | **Fase 2 (Direncanakan)** |
| Watcher folder lokal (`notify`) | Memantau perubahan file sistem lokal real-time | **Fase 2 (Direncanakan)** |
| Nama file tidak terstruktur | Dikenali otomatis dengan pola regex dasar di frontend | **Aktif (Terimplementasi)** |
| Invoice historis (file) | Diindeks sebagai file biasa di cloud/lokal | **Aktif (Terimplementasi)** |
| Transaksi lama (data) | Impor opsional via CSV untuk Buku Besar | **Fase 2 (Direncanakan)** |
| Kontak lama | Otomatis terbentuk saat invoice baru dibuat | **Aktif (Terimplementasi)** |
| Struktur folder | Tetap utuh, aplikasi hanya "melihat" indeks | **Aktif (Terimplementasi)** |

Dengan pendekatan ini, PubHub Desktop benar-benar menjadi "lensa pintar" yang langsung bisa dipakai pada ekosistem file yang sudah ada, tanpa ketakutan kehilangan data atau harus merapikan ulang.