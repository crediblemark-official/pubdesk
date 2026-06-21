# Data Model

## 1. Tabel Baru

### 1.1 workflow_templates

Menyimpan template alur kerja produksi.

```sql
CREATE TABLE workflow_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);
```

### 1.2 workflow_template_steps

Menyimpan daftar tahap dari setiap template workflow.

```sql
CREATE TABLE workflow_template_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    default_role TEXT,
    default_duration_days INTEGER DEFAULT 0,
    is_required INTEGER NOT NULL DEFAULT 1
);
```

### 1.3 tasks

Menyimpan pekerjaan harian produksi.

```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    naskah_id INTEGER NOT NULL REFERENCES naskah(id) ON DELETE CASCADE,
    step_name TEXT NOT NULL,
    step_order INTEGER,
    assigned_team_id INTEGER REFERENCES tim(id),
    status TEXT NOT NULL DEFAULT 'Belum Mulai',
    priority TEXT NOT NULL DEFAULT 'Normal',
    start_date TEXT,
    due_date TEXT,
    completed_date TEXT,
    notes TEXT,
    proof_path_or_link TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT
);
```

### 1.4 task_history

Menyimpan riwayat perubahan status tugas.

```sql
CREATE TABLE task_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT,
    changed_at TEXT NOT NULL,
    notes TEXT
);
```

### 1.5 task_blockers

Menyimpan kendala yang menghambat tugas.

```sql
CREATE TABLE task_blockers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    naskah_id INTEGER REFERENCES naskah(id) ON DELETE CASCADE,
    blocker_type TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Aktif',
    created_at TEXT NOT NULL,
    resolved_at TEXT
);
```

### 1.6 task_approvals

Menyimpan approval tugas.

```sql
CREATE TABLE task_approvals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    approval_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Menunggu Approval',
    requested_at TEXT NOT NULL,
    decided_at TEXT,
    decided_by TEXT,
    notes TEXT
);
```

### 1.7 naskah_files

Menghubungkan file existing dengan naskah.

```sql
CREATE TABLE naskah_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    naskah_id INTEGER NOT NULL REFERENCES naskah(id) ON DELETE CASCADE,
    file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    file_role TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL
);
```

### 1.8 cetak_distribusi

Menyimpan data cetak, upload, pengiriman, dan resi.

```sql
CREATE TABLE cetak_distribusi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    naskah_id INTEGER NOT NULL REFERENCES naskah(id) ON DELETE CASCADE,
    acc_cetak_date TEXT,
    naik_cetak_date TEXT,
    jumlah_cetak INTEGER,
    status_cetak TEXT DEFAULT 'Belum Mulai',
    link_playbook TEXT,
    link_shopee TEXT,
    link_omp TEXT,
    ekspedisi TEXT,
    resi TEXT,
    tanggal_kirim TEXT,
    status_kirim TEXT DEFAULT 'Belum Dikirim',
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT
);
```

### 1.9 import_logs

Menyimpan riwayat import Excel.

```sql
CREATE TABLE import_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    import_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    sheet_name TEXT,
    total_rows INTEGER DEFAULT 0,
    valid_rows INTEGER DEFAULT 0,
    invalid_rows INTEGER DEFAULT 0,
    duplicate_rows INTEGER DEFAULT 0,
    imported_rows INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    notes TEXT
);
```

## 2. Alter Table Existing

### 2.1 Alter legalitas

```sql
ALTER TABLE legalitas ADD COLUMN nomor_dokumen TEXT;
ALTER TABLE legalitas ADD COLUMN tanggal_keluar TEXT;
ALTER TABLE legalitas ADD COLUMN tanggal_revisi TEXT;
ALTER TABLE legalitas ADD COLUMN pic_id INTEGER REFERENCES tim(id);
ALTER TABLE legalitas ADD COLUMN rejection_reason TEXT;
ALTER TABLE legalitas ADD COLUMN proof_path_or_link TEXT;
```

### 2.2 Alter invoices

```sql
ALTER TABLE invoices ADD COLUMN naskah_id INTEGER REFERENCES naskah(id);
ALTER TABLE invoices ADD COLUMN payment_status TEXT DEFAULT 'Draft';
ALTER TABLE invoices ADD COLUMN paid_amount REAL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN remaining_amount REAL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN payment_notes TEXT;
```

## 3. Status Standar

### 3.1 Status Task

```text
Belum Mulai
Proses
Menunggu Revisi
Menunggu Approval
Selesai
Ditolak
Batal
```

### 3.2 Status Blocker

```text
Aktif
Selesai
Batal
```

### 3.3 Status Approval

```text
Menunggu Approval
Disetujui
Revisi Diminta
Ditolak
Batal
```

### 3.4 Status Distribusi

```text
Belum Dikirim
Dikirim
Selesai
Kendala
```

## 4. Index yang Disarankan

```sql
CREATE INDEX idx_tasks_naskah_id ON tasks(naskah_id);
CREATE INDEX idx_tasks_assigned_team_id ON tasks(assigned_team_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_task_history_task_id ON task_history(task_id);
CREATE INDEX idx_task_blockers_task_id ON task_blockers(task_id);
CREATE INDEX idx_task_approvals_task_id ON task_approvals(task_id);
CREATE INDEX idx_naskah_files_naskah_id ON naskah_files(naskah_id);
CREATE INDEX idx_cetak_distribusi_naskah_id ON cetak_distribusi(naskah_id);
CREATE INDEX idx_import_logs_import_type ON import_logs(import_type);
```
