# Scope dan Latar Belakang

## 1. Latar Belakang

Operasional penerbitan masih bergantung pada 3 Excel:

1. Alur Naskah.xlsx
2. Naskah Hana.xlsx
3. PENGAJUAN ISBN QRCBN QRSBN HAKI.xlsx

Ketiga Excel tersebut membantu pencatatan, tetapi sulit dirawat karena data tersebar, status tidak standar, dan progres pekerjaan sulit dipantau secara cepat.

## 2. Masalah Utama

### 2.1 Alur Naskah.xlsx

Masalah:

1. Tahap kerja dicatat dalam kolom panjang.
2. Status ditulis manual.
3. Tanggal proses tersebar.
4. Tidak ada histori perubahan status.
5. Sulit melihat pekerjaan terlambat.
6. Sulit mengetahui siapa PIC terakhir.
7. Sulit membuat laporan otomatis.

### 2.2 Naskah Hana.xlsx

Masalah:

1. Data hanya mencatat judul, layouter, dan tanggal.
2. Tidak ada status produksi lengkap.
3. Tidak ada deadline.
4. Tidak ada catatan revisi.
5. Tidak ada histori pekerjaan.
6. Beban kerja karyawan sulit dihitung.

### 2.3 PENGAJUAN ISBN QRCBN QRSBN HAKI.xlsx

Masalah:

1. Status tidak konsisten.
2. Pengajuan legalitas tidak selalu terhubung rapi ke naskah.
3. Nomor dokumen sulit dilacak.
4. Bukti dokumen tidak terhubung ke sistem file.
5. Data revisi dan penolakan sulit dipantau.

## 3. Scope Fitur Baru

PRD ini hanya membangun fitur baru berikut:

1. Pekerjaan Saya
2. Produksi Naskah
3. Import Excel Lama
4. Laporan Operasional

## 4. Out of Scope

Fitur berikut tidak masuk scope:

1. Pre-order Extractor
2. Buku Besar
3. Akuntansi penuh
4. WhatsApp automation
5. Marketplace API
6. AI extraction
7. Cloud collaboration real-time

## 5. Target Hasil

Setelah fitur ini selesai, karyawan tidak perlu lagi mencatat pekerjaan di 3 Excel. Semua pekerjaan harian, monitoring produksi, legalitas, import data lama, dan laporan operasional berjalan dari PubDesk.

## 6. Prinsip Desain

1. Fitur baru harus memakai data existing, bukan membuat master data duplikat.
2. Semua status harus memakai dropdown standar.
3. Semua pekerjaan harus terhubung ke `naskah_id`.
4. Semua update status task harus punya histori.
5. Import Excel wajib punya preview, validasi, deteksi duplikat, dan backup database.
6. Fitur harus tetap berjalan offline dengan SQLite lokal.
