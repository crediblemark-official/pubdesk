# Acceptance Criteria

## 1. Pekerjaan Saya

1. PIC dapat melihat tugas miliknya.
2. PIC dapat memfilter tugas berdasarkan status.
3. PIC dapat mengubah status tugas.
4. PIC dapat menambahkan catatan.
5. PIC dapat menambahkan bukti file atau link.
6. Task overdue tampil dengan indikator visual.
7. Setiap perubahan status masuk ke task_history.

## 2. Produksi Naskah

1. Admin dapat melihat semua task.
2. Admin dapat membuat task.
3. Admin dapat mengubah PIC.
4. Admin dapat mengubah deadline.
5. Admin dapat mengubah status.
6. Admin dapat mencatat kendala.
7. Admin dapat mengajukan approval.
8. Admin dapat menyetujui atau meminta revisi.
9. Timeline menampilkan riwayat produksi.
10. Filter PIC, status, tahap, penerbit, dan deadline berjalan.

## 3. Import Excel Lama

1. Admin dapat memilih file Excel.
2. Sistem membaca sheet.
3. Admin dapat mapping kolom.
4. Sistem menampilkan preview.
5. Sistem menandai invalid.
6. Sistem menandai duplikat.
7. Admin dapat memilih Merge, Skip, atau Create New.
8. Sistem membuat backup sebelum import.
9. Sistem menyimpan import log.
10. Import tidak overwrite tanpa konfirmasi.

## 4. Laporan Operasional

1. User dapat melihat laporan produksi.
2. User dapat melihat laporan kinerja tim.
3. User dapat melihat laporan legalitas.
4. User dapat melihat laporan invoice produksi.
5. User dapat filter periode.
6. User dapat filter PIC.
7. User dapat filter penerbit.
8. User dapat export Excel.
9. User dapat export PDF ringkasan.

## 5. Integrasi

1. Task terhubung ke naskah.
2. Task terhubung ke tim.
3. Legalitas dapat dibaca oleh laporan.
4. Invoice dapat dibaca oleh laporan.
5. File dapat ditautkan ke naskah.
6. Perubahan task tidak merusak data existing.

## 6. Data dan Validasi

1. Status task harus memakai daftar standar.
2. Status approval harus memakai daftar standar.
3. Status blocker harus memakai daftar standar.
4. `naskah_id` wajib ada pada task.
5. `assigned_team_id` wajib valid jika diisi.
6. `due_date` tidak boleh lebih awal dari `start_date`.
7. `completed_date` hanya terisi jika status Selesai.

## 7. Performance

1. Daftar task 10.000 baris dapat dimuat maksimal 2 detik pada database lokal normal.
2. Filter task berjalan tanpa reload aplikasi.
3. Import Excel menampilkan progress.
4. Import besar tidak membuat UI freeze.
