# Feature: Pekerjaan Saya

## 1. Deskripsi

Pekerjaan Saya adalah halaman untuk karyawan melihat dan memperbarui tugas yang diberikan kepadanya.

Fitur ini menggantikan pola pencatatan kerja individual di Excel Naskah Hana.xlsx.

## 2. Pengguna

1. Layouter
2. Desainer cover
3. Admin legalitas
4. Admin cetak
5. Admin upload
6. Admin pengiriman
7. Admin produksi

## 3. Tujuan

1. PIC dapat melihat tugas sendiri.
2. PIC dapat mengubah status tugas.
3. PIC dapat menambah catatan kendala.
4. PIC dapat menautkan bukti file atau link.
5. Admin dapat melihat update PIC dari Produksi Naskah.

## 4. Komponen UI

### 4.1 Summary Cards

```text
Aktif
Deadline Dekat
Terlambat
Menunggu Revisi
Menunggu Approval
Selesai Minggu Ini
```

### 4.2 Filter

```text
Semua
Hari Ini
Terlambat
Revisi
Approval
Selesai
```

### 4.3 Task List

Kolom:

| Kolom | Keterangan |
|---|---|
| Judul | Judul naskah |
| Tahap | Nama pekerjaan |
| Deadline | Batas waktu |
| Status | Status tugas |
| Prioritas | Normal, tinggi, urgent |
| Aksi | Mulai, Update, Selesai |

## 5. User Flow

```text
1. PIC membuka Pekerjaan Saya.
2. Sistem menampilkan tugas berdasarkan assigned_team_id.
3. PIC klik tugas.
4. PIC mengubah status.
5. PIC menambah catatan jika perlu.
6. PIC menambahkan bukti file atau link.
7. Sistem menyimpan perubahan ke tasks.
8. Sistem mencatat histori ke task_history.
```

## 6. Rules

1. PIC hanya melihat tugas miliknya.
2. Tugas terlambat ditandai jika due_date < hari ini dan status belum Selesai.
3. Setiap update status wajib masuk ke task_history.
4. Status tidak boleh diisi bebas.
5. Bukti boleh berupa link file atau file dari Smart Folders.
6. PIC tidak boleh menghapus task.
7. PIC tidak boleh mengubah PIC tugas.
8. PIC dapat mengembalikan task ke Proses jika status sebelumnya Menunggu Revisi.

## 7. Acceptance Criteria

1. PIC dapat melihat daftar tugas miliknya.
2. PIC dapat memfilter berdasarkan status.
3. PIC dapat mengubah status dari Belum Mulai ke Proses.
4. PIC dapat mengubah status ke Menunggu Approval.
5. PIC dapat mengubah status ke Selesai jika tidak butuh approval.
6. PIC dapat menambahkan catatan.
7. PIC dapat menambahkan bukti file atau link.
8. Task overdue tampil dengan indikator visual.
9. Perubahan status tercatat di task_history.

## 8. Wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ Pekerjaan Saya                                               │
├──────────────────────────────────────────────────────────────┤
│ 4 Aktif | 2 Deadline Dekat | 1 Terlambat | 5 Selesai Minggu Ini│
├──────────────────────────────────────────────────────────────┤
│ [Semua] [Hari Ini] [Terlambat] [Revisi] [Approval] [Selesai] │
├──────────────────────────────────────────────────────────────┤
│ Judul       Tahap          Deadline      Status        Aksi   │
│ Buku A      Layout         24 Jun 2026   Proses        Update │
│ Buku B      Cover          25 Jun 2026   Belum Mulai   Mulai  │
│ Buku C      Revisi Cover   22 Jun 2026   Terlambat     Update │
└──────────────────────────────────────────────────────────────┘
```

## 9. Empty State

Jika PIC belum memiliki tugas, tampilkan pesan:

```text
Belum ada tugas aktif untuk Anda.
```

## 10. Error State

Jika data gagal dimuat, tampilkan pesan:

```text
Data tugas gagal dimuat. Silakan muat ulang halaman.
```
