# Migration Checklist

## 1. Sebelum Implementasi

- [ ] Backup database existing.
- [ ] Pastikan tabel naskah sudah stabil.
- [ ] Pastikan tabel tim sudah berisi data karyawan aktif.
- [ ] Pastikan tabel legalitas sudah punya relasi naskah_id.
- [ ] Pastikan invoice dapat ditambah field naskah_id.
- [ ] Pastikan Smart Folders memiliki tabel files yang stabil.

## 2. Migrasi Database

- [ ] Create workflow_templates.
- [ ] Create workflow_template_steps.
- [ ] Create tasks.
- [ ] Create task_history.
- [ ] Create task_blockers.
- [ ] Create task_approvals.
- [ ] Create naskah_files.
- [ ] Create cetak_distribusi.
- [ ] Create import_logs.
- [ ] Alter legalitas.
- [ ] Alter invoices.

## 3. Implementasi Backend

- [ ] Implement command tasks.
- [ ] Implement command task_history.
- [ ] Implement command blockers.
- [ ] Implement command approvals.
- [ ] Implement command workflow templates.
- [ ] Implement command import Excel.
- [ ] Implement command reports.

## 4. Implementasi Frontend

- [ ] Tambah sidebar Pekerjaan Saya.
- [ ] Tambah sidebar Produksi Naskah.
- [ ] Tambah sidebar Import Excel Lama.
- [ ] Tambah sidebar Laporan Operasional.
- [ ] Buat page Pekerjaan Saya.
- [ ] Buat page Board Produksi.
- [ ] Buat page Daftar Tugas.
- [ ] Buat page Revisi dan Kendala.
- [ ] Buat page Approval.
- [ ] Buat page Timeline Produksi.
- [ ] Buat page Import Excel Lama.
- [ ] Buat page Laporan Operasional.

## 5. Testing

- [ ] Test create task.
- [ ] Test update task status.
- [ ] Test task_history.
- [ ] Test overdue logic.
- [ ] Test blocker.
- [ ] Test approval.
- [ ] Test import preview.
- [ ] Test duplicate detection.
- [ ] Test report.
- [ ] Test export.

## 6. Go-Live

- [ ] Import data sample.
- [ ] Validasi hasil import.
- [ ] Training admin.
- [ ] Training PIC.
- [ ] Mulai input pekerjaan baru dari aplikasi.
- [ ] Bekukan Excel lama sebagai arsip.

## 7. Rollback Plan

- [ ] Simpan backup database sebelum import.
- [ ] Simpan import log.
- [ ] Sediakan tombol undo import per import_log jika memungkinkan.
- [ ] Jika undo belum tersedia, gunakan restore database dari backup.
- [ ] Jangan hapus file Excel lama sebelum validasi hasil migrasi selesai.
