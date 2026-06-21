# Feature: Laporan Operasional

## 1. Deskripsi

Laporan Operasional menyajikan rekap produksi, kinerja tim, legalitas, invoice, dan distribusi.

## 2. Jenis Laporan

```text
1. Laporan Produksi
2. Laporan Kinerja Tim
3. Laporan Legalitas
4. Laporan Invoice Terkait Produksi
5. Laporan Cetak dan Distribusi
```

## 3. Filter

1. Periode
2. PIC
3. Penerbit
4. Paket
5. Status
6. Jenis legalitas

## 4. Metrik Produksi

| Metrik | Rumus |
|---|---|
| Total naskah aktif | Count naskah dengan task aktif |
| Task selesai | Count task status Selesai |
| Task overdue | due_date < today dan status bukan Selesai |
| Progress naskah | task selesai / total task |
| Durasi task | completed_date - start_date |

## 5. Metrik Kinerja Tim

| Metrik | Rumus |
|---|---|
| Beban kerja PIC | Count task aktif per PIC |
| Tugas selesai per PIC | Count task selesai per PIC |
| Tugas terlambat per PIC | Count overdue per PIC |
| Capaian target | tugas selesai / weekly_target |

## 6. Metrik Legalitas

| Metrik | Rumus |
|---|---|
| Legalitas proses | Count status Diajukan atau Revisi |
| Legalitas selesai | Count status Selesai |
| Legalitas ditolak | Count status Ditolak |
| Durasi legalitas | tanggal_keluar - tanggal_pengajuan |

## 7. Metrik Invoice

| Metrik | Rumus |
|---|---|
| Invoice DP | Count payment_status DP |
| Invoice lunas | Count payment_status Lunas |
| Invoice belum lunas | Count Belum Lunas |
| Sisa pembayaran | Sum remaining_amount |

## 8. Acceptance Criteria

1. User dapat melihat laporan produksi.
2. User dapat melihat laporan kinerja tim.
3. User dapat melihat laporan legalitas.
4. User dapat melihat laporan invoice produksi.
5. User dapat filter berdasarkan periode, PIC, penerbit, paket, dan status.
6. User dapat export Excel.
7. User dapat export PDF ringkasan.

## 9. Wireframe

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
│                                                              │
│ Task Terlambat                                               │
│ Buku A | Layout | PIC Ika | Due 20 Jun 2026                  │
│ Buku B | Cover  | PIC Dini | Due 21 Jun 2026                 │
└──────────────────────────────────────────────────────────────┘
```
