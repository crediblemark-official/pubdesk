# Feature: Import Excel Lama

## 1. Deskripsi

Import Excel Lama adalah fitur migrasi data dari 3 Excel operasional ke database PubDesk.

## 2. Jenis Import

```text
1. Import Alur Naskah
2. Import Naskah Masuk
3. Import Legalitas
```

## 3. Alur Import

```text
1. Pilih jenis import.
2. Pilih file Excel.
3. Pilih sheet.
4. Mapping kolom.
5. Preview data.
6. Validasi data.
7. Deteksi duplikat.
8. Konfirmasi import.
9. Backup database.
10. Simpan data.
11. Buat import log.
```

## 4. Target Mapping

| Sumber Excel | Target Database |
|---|---|
| Alur Naskah.xlsx | tasks, task_history, workflow_events, cetak_distribusi |
| Naskah Hana.xlsx | tasks, relasi task dengan tim |
| PENGAJUAN ISBN QRCBN QRSBN HAKI.xlsx | legalitas, task legalitas jika diperlukan |

## 5. Normalisasi Status

| Status Lama | Status Baru |
|---|---|
| sudah | Selesai |
| Sudah Keluar | Selesai |
| sudah Keluar | Selesai |
| pengajuan | Diajukan |
| Pengajuan | Diajukan |
| belum | Belum Mulai |
| Ditolak | Ditolak |
| Diajukan ulang | Diajukan Ulang |

## 6. Deteksi Duplikat

Kriteria:

1. Judul naskah
2. Nama penulis
3. Penerbit
4. Tanggal masuk
5. Jenis legalitas
6. Nama PIC

## 7. Aksi pada Duplikat

```text
Merge
Skip
Create New
```

## 8. Validasi

Data invalid jika:

1. Judul kosong.
2. Tanggal tidak valid.
3. Status tidak bisa dimapping.
4. PIC tidak ditemukan.
5. Jenis legalitas tidak dikenali.

## 9. Acceptance Criteria

1. Admin dapat memilih file Excel.
2. Sistem menampilkan daftar sheet.
3. Admin dapat mapping kolom manual.
4. Sistem menampilkan preview data.
5. Sistem menandai data invalid.
6. Sistem menandai potensi duplikat.
7. Admin dapat memilih Merge, Skip, atau Create New.
8. Sistem membuat backup sebelum import.
9. Sistem menyimpan import log.
10. Import tidak menghapus data lama tanpa konfirmasi.

## 10. Wireframe Import

```text
┌──────────────────────────────────────────────────────────────┐
│ Import Excel Lama                                            │
├──────────────────────────────────────────────────────────────┤
│ Step 1: Jenis Import                                         │
│ ( ) Alur Naskah                                              │
│ ( ) Naskah Masuk                                             │
│ ( ) Legalitas                                                │
│                                                              │
│ Step 2: File                                                 │
│ [Pilih File Excel]                                           │
│                                                              │
│ Step 3: Mapping Kolom                                        │
│ Kolom Excel              Field Sistem                        │
│ Judul Buku          ->   naskah.title                        │
│ Layouter            ->   tasks.assigned_team_id              │
│ Tanggal             ->   tasks.start_date                    │
│ Status              ->   tasks.status                        │
│                                                              │
│ [Preview] [Validasi] [Import]                                │
└──────────────────────────────────────────────────────────────┘
```

## 11. Wireframe Preview

```text
┌──────────────────────────────────────────────────────────────┐
│ Preview Import                                               │
├──────────────────────────────────────────────────────────────┤
│ Total: 2.130 | Valid: 2.050 | Invalid: 30 | Duplikat: 50     │
├──────────────────────────────────────────────────────────────┤
│ Status    Judul      Penulis    PIC       Aksi               │
│ Valid     Buku A     Andi       Ika       Import             │
│ Duplikat  Buku B     Rina       Dini      Merge / Skip / New │
│ Invalid   -          Budi       Sopita    Perbaiki           │
└──────────────────────────────────────────────────────────────┘
```
