# Tauri Commands Baru

## 1. Tasks

```text
get_tasks
get_task_by_id
get_tasks_by_naskah
get_tasks_by_team
get_my_tasks
get_overdue_tasks
add_task
update_task
update_task_status
delete_task
```

## 2. Task History

```text
get_task_history
add_task_history
```

## 3. Blockers

```text
get_task_blockers
add_task_blocker
update_task_blocker
resolve_task_blocker
delete_task_blocker
```

## 4. Approvals

```text
get_task_approvals
request_task_approval
approve_task
reject_task
request_revision
```

## 5. Workflow Template

```text
get_workflow_templates
add_workflow_template
update_workflow_template
delete_workflow_template
get_workflow_template_steps
add_workflow_template_step
update_workflow_template_step
delete_workflow_template_step
generate_tasks_from_template
```

## 6. Import Excel

```text
read_excel_sheets
preview_excel_import
validate_excel_import
detect_import_duplicates
execute_excel_import
get_import_logs
```

## 7. Reports

```text
get_production_report
get_team_performance_report
get_legalitas_report
get_invoice_production_report
get_distribution_report
export_report_excel
export_report_pdf
```

## 8. Command Contract Example

### update_task_status

Request:

```json
{
  "task_id": 1,
  "new_status": "Proses",
  "changed_by": "Ika",
  "notes": "Mulai layout"
}
```

Behavior:

1. Ambil status lama dari tabel tasks.
2. Update status baru.
3. Isi updated_at.
4. Jika status Selesai, isi completed_date.
5. Insert ke task_history.
6. Return task terbaru.

Response:

```json
{
  "success": true,
  "task_id": 1,
  "old_status": "Belum Mulai",
  "new_status": "Proses"
}
```

### add_task

Request:

```json
{
  "naskah_id": 12,
  "step_name": "Layout Proses",
  "step_order": 5,
  "assigned_team_id": 3,
  "status": "Belum Mulai",
  "priority": "Normal",
  "start_date": "2026-06-21",
  "due_date": "2026-06-24",
  "notes": "Layout awal"
}
```

Response:

```json
{
  "success": true,
  "task_id": 101
}
```

### execute_excel_import

Request:

```json
{
  "import_type": "Naskah Masuk",
  "file_path": "C:/data/Naskah Hana.xlsx",
  "sheet_name": "Naskah Masuk",
  "mapping": {
    "Judul Buku": "naskah.title",
    "Layouter": "tasks.assigned_team_id",
    "Tanggal": "tasks.start_date"
  },
  "duplicate_strategy": "merge"
}
```

Response:

```json
{
  "success": true,
  "total_rows": 2130,
  "imported_rows": 2050,
  "invalid_rows": 30,
  "duplicate_rows": 50,
  "import_log_id": 7
}
```
