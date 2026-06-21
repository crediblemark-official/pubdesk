# Integration Map

## 1. Prinsip Integrasi

Fitur baru tidak menggantikan modul existing. Fitur baru hanya membaca, menulis, atau menautkan data ke modul existing.

## 2. Integrasi dengan Master Data Naskah

Fitur baru memakai data naskah sebagai pusat relasi.

Data yang dibutuhkan:

```sql
naskah.id
naskah.naskah_id_code
naskah.title
naskah.penulis_id
naskah.penerbit_id
naskah.package_type
naskah.status
```

Dipakai oleh:

1. Pekerjaan Saya
2. Produksi Naskah
3. Import Excel Lama
4. Laporan Operasional

Tujuan integrasi:

1. Menghubungkan task ke naskah.
2. Menampilkan judul naskah di daftar tugas.
3. Menghitung progres produksi per naskah.
4. Menampilkan status ringkas naskah.

## 3. Integrasi dengan Master Data Tim

Data yang dibutuhkan:

```sql
tim.id
tim.name
tim.role
tim.department
tim.weekly_target
tim.is_active
```

Tujuan integrasi:

1. Menentukan PIC tugas.
2. Menghitung beban kerja PIC.
3. Menghitung tugas selesai per PIC.
4. Menampilkan tugas di Pekerjaan Saya.

## 4. Integrasi dengan Master Data Legalitas

Data yang dibutuhkan:

```sql
legalitas.id
legalitas.naskah_id
legalitas.tipe
legalitas.tanggal_pengajuan
legalitas.status
legalitas.keterangan
```

Tambahan field yang dibutuhkan:

```sql
nomor_dokumen
tanggal_keluar
tanggal_revisi
pic_id
rejection_reason
proof_path_or_link
```

Tujuan integrasi:

1. Menampilkan status legalitas di Produksi Naskah.
2. Menghubungkan task legalitas dengan data legalitas.
3. Membuat laporan legalitas.
4. Menampilkan legalitas yang revisi, ditolak, atau selesai.

## 5. Integrasi dengan Invoice

Tambahan field yang dibutuhkan:

```sql
naskah_id
payment_status
paid_amount
remaining_amount
payment_notes
```

Tujuan integrasi:

1. Menampilkan status pembayaran per naskah.
2. Menandai naskah yang belum lunas.
3. Menampilkan invoice terkait produksi.
4. Membuat laporan invoice terkait produksi.

## 6. Integrasi dengan Smart Folders

Relasi baru:

```sql
naskah_files
```

Tujuan integrasi:

1. Menghubungkan file ke naskah.
2. Menautkan bukti pekerjaan ke task.
3. Menautkan file layout, cover, legalitas, invoice, dan resi.
4. Menampilkan file terkait dalam laporan atau timeline.

## 7. Integrasi dengan Settings

Settings dipakai untuk:

1. Status workflow.
2. Status legalitas.
3. Template deadline.
4. Backup database sebelum import.
5. Folder pantauan file.

## 8. Aturan Integrasi

1. Fitur baru tidak boleh membuat tabel master penulis baru.
2. Fitur baru tidak boleh membuat tabel master penerbit baru.
3. Fitur baru tidak boleh membuat tabel master tim baru.
4. Fitur baru harus memakai ID dari tabel existing.
5. Jika data existing belum lengkap, fitur baru harus menampilkan pesan validasi, bukan membuat data sembarangan.
