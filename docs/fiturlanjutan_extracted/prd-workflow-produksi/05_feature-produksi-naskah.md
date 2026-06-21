# Feature: Produksi Naskah

## 1. Deskripsi

Produksi Naskah adalah pusat monitoring semua pekerjaan produksi naskah. Fitur ini menggantikan Alur Naskah.xlsx.

## 2. Subfitur

```text
1. Board Produksi
2. Daftar Tugas
3. Revisi dan Kendala
4. Approval
5. Timeline Produksi
```

## 3. Board Produksi

### 3.1 Tujuan

Menampilkan tugas dalam format board berdasarkan status.

### 3.2 Kolom Board

```text
Belum Mulai
Proses
Menunggu Revisi
Menunggu Approval
Selesai
Terlambat
```

### 3.3 Kartu Task

Isi kartu:

1. Judul naskah
2. Tahap
3. PIC
4. Deadline
5. Prioritas
6. Status legalitas jika ada
7. Status pembayaran jika ada

### 3.4 Filter

1. PIC
2. Tahap
3. Penerbit
4. Paket
5. Deadline
6. Status

## 4. Daftar Tugas

### 4.1 Kolom

| Kolom | Keterangan |
|---|---|
| ID Task | ID tugas |
| ID Naskah | Relasi ke naskah |
| Judul | Judul naskah |
| Tahap | Nama tahap |
| PIC | Karyawan |
| Mulai | Tanggal mulai |
| Deadline | Batas waktu |
| Selesai | Tanggal selesai |
| Status | Status tugas |
| Catatan | Kendala |
| Bukti | Link atau file |

### 4.2 Aksi

1. Tambah task
2. Edit task
3. Ubah PIC
4. Ubah deadline
5. Ubah status
6. Tambah blocker
7. Request approval
8. Tandai selesai

## 5. Revisi dan Kendala

### 5.1 Kategori Kendala

```text
Data penulis belum lengkap
Naskah belum diterima
Surat keaslian belum masuk
Menunggu revisi layout
Menunggu revisi cover
Legalitas ditolak
Menunggu pembayaran
Menunggu ACC cetak
Belum ada file final
Belum ada resi
```

### 5.2 Status Kendala

```text
Aktif
Selesai
Batal
```

### 5.3 Rules Kendala

1. Kendala harus terhubung ke `task_id` atau `naskah_id`.
2. Kendala aktif harus tampil pada detail task.
3. Kendala aktif harus tampil di Revisi dan Kendala.
4. Kendala selesai harus punya `resolved_at`.

## 6. Approval

### 6.1 Jenis Approval

```text
ACC layout
ACC cover
ACC cetak
ACC upload Playbook
ACC upload Shopee
ACC upload OMP
ACC pengiriman
```

### 6.2 Keputusan Approval

```text
Disetujui
Revisi Diminta
Ditolak
```

### 6.3 Rules Approval

1. Approval hanya dibuat dari task yang butuh persetujuan.
2. Task dengan approval aktif memakai status Menunggu Approval.
3. Jika disetujui, task dapat menjadi Selesai.
4. Jika revisi diminta, task menjadi Menunggu Revisi.
5. Setiap keputusan approval masuk ke task_history.

## 7. Timeline Produksi

Timeline menampilkan:

1. Task dibuat
2. PIC ditugaskan
3. Status berubah
4. Kendala dibuat
5. Kendala diselesaikan
6. Approval diminta
7. Approval diputuskan
8. Task selesai

## 8. Acceptance Criteria

1. Admin dapat melihat seluruh task produksi.
2. Admin dapat memfilter task.
3. Admin dapat membuka detail task.
4. Admin dapat membuat task manual.
5. Admin dapat mengubah PIC.
6. Admin dapat mengubah deadline.
7. Admin dapat mencatat kendala.
8. Admin dapat menyetujui atau meminta revisi.
9. Semua perubahan status tercatat di task_history.
10. Timeline menampilkan riwayat produksi.

## 9. Wireframe Board

```text
┌──────────────────────────────────────────────────────────────┐
│ Produksi Naskah > Board Produksi                             │
├──────────────────────────────────────────────────────────────┤
│ [PIC ▼] [Tahap ▼] [Penerbit ▼] [Deadline ▼] [Cari]           │
├────────────┬────────────┬─────────────────┬────────────┬─────┤
│ Belum Mulai│ Proses     │ Menunggu Revisi │ Approval   │ Done│
├────────────┼────────────┼─────────────────┼────────────┼─────┤
│ Buku B     │ Buku A     │ Buku C          │ Buku D     │Buku E│
│ Layout     │ Layout     │ Cover           │ ACC Cetak  │Resi │
│ PIC Ika    │ PIC Ika    │ PIC Dini        │ Admin      │Admin│
│ 25 Jun     │ 24 Jun     │ 22 Jun          │ 23 Jun     │Done │
└────────────┴────────────┴─────────────────┴────────────┴─────┘
```

## 10. Wireframe Daftar Tugas

```text
┌──────────────────────────────────────────────────────────────┐
│ Produksi Naskah > Daftar Tugas                               │
├──────────────────────────────────────────────────────────────┤
│ [Cari] [PIC ▼] [Status ▼] [Deadline ▼] [+ Task]              │
├──────────────────────────────────────────────────────────────┤
│ ID    Judul    Tahap       PIC     Deadline    Status   Aksi  │
│ T001  Buku A   Layout      Ika     24 Jun      Proses   Detail│
│ T002  Buku B   Cover       Dini    25 Jun      Belum    Detail│
│ T003  Buku C   ACC Cetak   Admin   22 Jun      Approval Detail│
└──────────────────────────────────────────────────────────────┘
```
