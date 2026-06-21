# Wireframe

## 1. Pekerjaan Saya

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

## 2. Produksi Naskah: Board

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

## 3. Produksi Naskah: Daftar Tugas

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

## 4. Produksi Naskah: Revisi dan Kendala

```text
┌──────────────────────────────────────────────────────────────┐
│ Produksi Naskah > Revisi dan Kendala                         │
├──────────────────────────────────────────────────────────────┤
│ [Status ▼] [Jenis Kendala ▼] [PIC ▼] [Cari]                  │
├──────────────────────────────────────────────────────────────┤
│ Judul     Task       Kendala                  Status   Aksi   │
│ Buku A    Layout     Menunggu revisi layout   Aktif    Detail │
│ Buku B    Legalitas  Surat keaslian belum ada Aktif    Detail │
│ Buku C    Resi       Belum ada nomor resi     Selesai  Detail │
└──────────────────────────────────────────────────────────────┘
```

## 5. Produksi Naskah: Approval

```text
┌──────────────────────────────────────────────────────────────┐
│ Produksi Naskah > Approval                                   │
├──────────────────────────────────────────────────────────────┤
│ [Jenis Approval ▼] [PIC ▼] [Tanggal ▼] [Cari]                │
├──────────────────────────────────────────────────────────────┤
│ Judul     Approval        Diminta Oleh    Status       Aksi   │
│ Buku A    ACC Layout      Ika             Menunggu     Review │
│ Buku B    ACC Cetak       Admin           Menunggu     Review │
└──────────────────────────────────────────────────────────────┘
```

## 6. Import Excel Lama

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

## 7. Laporan Operasional

```text
┌──────────────────────────────────────────────────────────────┐
│ Laporan Operasional                                          │
├──────────────────────────────────────────────────────────────┤
│ [Periode ▼] [PIC ▼] [Penerbit ▼] [Status ▼] [Export Excel]  │
├──────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐ │
│ │Naskah Aktif │ │Selesai      │ │Overdue      │ │Legalitas │ │
│ │124          │ │38           │ │12           │ │27 Proses │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘ │
│                                                              │
│ Beban Kerja Tim                                              │
│ Ika: 32 tugas | Dini: 28 tugas | Sopita: 25 tugas            │
└──────────────────────────────────────────────────────────────┘
```
