# PRD Workflow Produksi Naskah PubDesk

## Ringkasan

Dokumen ini menjelaskan fitur baru PubDesk untuk menggantikan pencatatan kerja berbasis 3 Excel operasional.

Fitur baru yang dibangun:

1. Pekerjaan Saya
2. Produksi Naskah
3. Import Excel Lama
4. Laporan Operasional

Fitur existing tidak dijelaskan sebagai scope pembangunan. Fitur existing hanya menjadi titik integrasi.

## Fitur Existing yang Diintegrasikan

1. Master Data Naskah
2. Master Data Penulis
3. Master Data Penerbit
4. Master Data Tim
5. Master Data Legalitas
6. Master Data Layanan
7. Invoice
8. Smart Folders
9. Settings

## Fitur yang Tidak Masuk Scope

1. Pre-order Extractor
2. Buku Besar
3. Akuntansi lengkap
4. WhatsApp automation
5. Marketplace API
6. AI extraction

## Struktur Dokumen

- `01_scope-dan-latar-belakang.md` menjelaskan masalah dan scope.
- `02_integration-map.md` menjelaskan integrasi fitur baru dengan modul existing.
- `03_data-model.md` menjelaskan tabel baru dan perubahan tabel existing.
- `04_feature-pekerjaan-saya.md` menjelaskan fitur Pekerjaan Saya.
- `05_feature-produksi-naskah.md` menjelaskan fitur Produksi Naskah.
- `06_feature-import-excel-lama.md` menjelaskan migrasi 3 Excel lama.
- `07_feature-laporan-operasional.md` menjelaskan laporan.
- `08_wireframe.md` berisi wireframe teks.
- `09_mermaid-diagram.md` berisi diagram Mermaid.
- `10_tauri-commands.md` berisi command backend baru.
- `11_acceptance-criteria.md` berisi kriteria penerimaan.
- `12_roadmap.md` berisi tahapan pengerjaan.
- `13_migration-checklist.md` berisi checklist implementasi.

## Catatan Scope

PRD ini tidak menulis ulang fitur lama. Modul lama hanya menjadi sumber data, relasi, atau target update dari fitur baru. Tujuan dokumen ini adalah memberi batas kerja yang jelas untuk developer agar tidak mencampur fitur existing dengan fitur baru.
