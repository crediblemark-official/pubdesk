// Modul sample data untuk pengujian dan demo fitur produksi naskah
#![allow(dead_code)]
use rusqlite::{params, Connection};
use crate::db::error::DbError;

/// Menyisipkan data sample untuk keperluan demo/testing
pub fn seed_sample_data(conn: &Connection) -> Result<String, DbError> {
    let now = chrono::Local::now().to_rfc3339();

    // Temporarily disable foreign key constraints
    conn.execute("PRAGMA foreign_keys = OFF", [])?;

    // ─── 1. Cek apakah sudah ada data sample ───
    let existing_tasks: i64 = conn.query_row(
        "SELECT COUNT(*) FROM tasks", [], |row| row.get(0)
    )?;
    if existing_tasks > 0 {
        conn.execute("PRAGMA foreign_keys = ON", [])?;
        return Ok("Data sample sudah ada. Reset terlebih dahulu jika ingin memuat ulang.".to_string());
    }

    // ─── 2. Workflow Template ───
    println!("[SAMPLE SEED] Menyisipkan workflow_templates...");
    conn.execute(
        "INSERT INTO workflow_templates (name, description, is_active, created_at) VALUES (?1, ?2, 1, ?3)",
        params!["Alur Produksi Standar", "Template alur kerja produksi naskah lengkap", now]
    ).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, format!("Gagal di workflow_templates: {}", e)))?;
    let template_id = conn.last_insert_rowid();

    let steps = vec![
        (1, "Naskah Masuk", "Admin Produksi", 1),
        (2, "Layout", "Layouter", 5),
        (3, "Desain Cover", "Desainer Cover", 3),
        (4, "Proofreading", "Proofreader", 3),
        (5, "ACC Cetak", "Admin Produksi", 1),
        (6, "Cetak & Distribusi", "Admin Cetak", 7),
        (7, "Upload & Pengiriman", "Admin Upload", 2),
    ];

    println!("[SAMPLE SEED] Menyisipkan workflow_template_steps...");
    for (order, name, role, duration) in &steps {
        conn.execute(
            "INSERT INTO workflow_template_steps (template_id, step_order, step_name, default_role, default_duration_days, is_required) VALUES (?1, ?2, ?3, ?4, ?5, 1)",
            params![template_id, order, name, role, duration]
        ).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, format!("Gagal di workflow_template_steps (step {}): {}", order, e)))?;
    }

    // ─── 3. Penulis (disimpan di tabel contacts dan penulis dengan ID yang sama untuk kompatibilitas) ───
    let penulis_data = vec![
        ("Ahmad Fauzi", "081234567890"),
        ("Siti Nurhaliza", "082345678901"),
        ("Budi Santoso", "083456789012"),
    ];
    let mut penulis_ids = Vec::new();
    println!("[SAMPLE SEED] Menyisipkan penulis...");
    for (i, (name, wa)) in penulis_data.iter().enumerate() {
        let id = (i + 1) as i64; // Use explicit IDs starting from 1
        
        // Insert into contacts with explicit ID
        conn.execute(
            "INSERT INTO contacts (id, name, wa_number, type, created_at) VALUES (?1, ?2, ?3, 'penulis', ?4)",
            params![id, name, wa, now]
        ).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, format!("Gagal di contacts/penulis ({}): {}", name, e)))?;
        
        // Insert into penulis with the same explicit ID
        conn.execute(
            "INSERT INTO penulis (id, name, wa_number, created_at) VALUES (?1, ?2, ?3, ?4)",
            params![id, name, wa, now]
        ).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, format!("Gagal di penulis ({}): {}", name, e)))?;
        
        penulis_ids.push(id);
    }

    // ─── 4. Penerbit ───
    println!("[SAMPLE SEED] Menyisipkan penerbit...");
    conn.execute(
        "INSERT INTO penerbit (name, created_at) VALUES (?1, ?2)",
        params!["Pustaka Ilmu Nusantara", now]
    ).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, format!("Gagal di penerbit: {}", e)))?;
    let penerbit_id = conn.last_insert_rowid();

    // ─── 5. Naskah ───
    let naskah_data = vec![
        ("Panduan Lengkap Rust Programming", penulis_ids[0], penerbit_id),
        ("Kecerdasan Buatan untuk Pemula", penulis_ids[1], penerbit_id),
        ("Strategi Digital Marketing 2026", penulis_ids[2], penerbit_id),
    ];
    let mut naskah_ids = Vec::new();
    println!("[SAMPLE SEED] Menyisipkan naskah...");
    for (title, pid, pubid) in &naskah_data {
        conn.execute(
            "INSERT INTO naskah (title, penulis_id, penerbit_id, status, created_at) VALUES (?1, ?2, ?3, 'Proses', ?4)",
            params![title, pid, pubid, now]
        ).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, format!("Gagal di naskah ({}): {}", title, e)))?;
        naskah_ids.push(conn.last_insert_rowid());
    }

    // ─── 6. Tim ───
    let tim_data = vec![
        ("Ika Rahmawati", "Layouter", "Tim Produksi"),
        ("Dini Septiani", "Desainer Cover", "Tim Produksi"),
        ("Admin Produksi", "Admin Produksi", "Tim Manajemen"),
    ];
    let mut tim_ids = Vec::new();
    println!("[SAMPLE SEED] Menyisipkan tim...");
    for (name, role, notes) in &tim_data {
        conn.execute(
            "INSERT INTO tim (name, role, notes, created_at) VALUES (?1, ?2, ?3, ?4)",
            params![name, role, notes, now]
        ).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, format!("Gagal di tim ({}): {}", name, e)))?;
        tim_ids.push(conn.last_insert_rowid());
    }

    // ─── 7. Tasks (12 task tersebar) ───
    // Format: (naskah_idx, step_name, step_order, tim_idx, status, priority, days_offset_start, days_offset_due, notes)
    let task_data: Vec<(usize, &str, i64, usize, &str, &str, i64, i64, Option<&str>)> = vec![
        // Naskah 1: Rust Programming - sedang proses layout
        (0, "Naskah Masuk", 1, 2, "Selesai", "Normal", -10, -9, None),
        (0, "Layout", 2, 0, "Proses", "Tinggi", -5, 3, Some("Sedang mengerjakan bab 5-8")),
        (0, "Desain Cover", 3, 1, "Belum Mulai", "Normal", 0, 5, None),
        (0, "ACC Cetak", 5, 2, "Belum Mulai", "Normal", 5, 6, None),

        // Naskah 2: AI untuk Pemula - menunggu revisi
        (1, "Naskah Masuk", 1, 2, "Selesai", "Normal", -15, -14, None),
        (1, "Layout", 2, 0, "Menunggu Revisi", "Tinggi", -10, -3, Some("Layout perlu diperbaiki: margin terlalu sempit")),
        (1, "Desain Cover", 3, 1, "Proses", "Normal", -8, -1, Some("Mengerjakan revisi warna cover")),
        (1, "Proofreading", 4, 2, "Belum Mulai", "Normal", 0, 3, None),

        // Naskah 3: Digital Marketing - menunggu approval
        (2, "Naskah Masuk", 1, 2, "Selesai", "Normal", -20, -19, None),
        (2, "Layout", 2, 0, "Selesai", "Urgent", -15, -10, None),
        (2, "Desain Cover", 3, 1, "Selesai", "Normal", -12, -7, None),
        (2, "ACC Cetak", 5, 2, "Menunggu Approval", "Tinggi", -5, 0, Some("Menunggu persetujuan cetak dari penerbit")),
    ];

    let mut task_ids = Vec::new();
    println!("[SAMPLE SEED] Menyisipkan tasks...");
    for (naskah_idx, step_name, step_order, tim_idx, status, priority, start_off, due_off, notes) in &task_data {
        let start_date = chrono::Local::now() + chrono::Duration::days(*start_off);
        let due_date = chrono::Local::now() + chrono::Duration::days(*due_off);
        let completed_date = if *status == "Selesai" {
            Some((chrono::Local::now() + chrono::Duration::days(*due_off)).to_rfc3339())
        } else {
            None
        };

        conn.execute(
            "INSERT INTO tasks (naskah_id, step_name, step_order, assigned_team_id, status, priority, start_date, due_date, completed_date, notes, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            params![
                naskah_ids[*naskah_idx],
                step_name,
                step_order,
                tim_ids[*tim_idx],
                status,
                priority,
                start_date.to_rfc3339(),
                due_date.to_rfc3339(),
                completed_date,
                notes,
                now
            ]
        ).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, format!("Gagal di tasks (step {}): {}", step_name, e)))?;
        task_ids.push(conn.last_insert_rowid());
    }

    // ─── 8. Task History ───
    let history_data = vec![
        (task_ids[0], None, "Selesai", "Admin Produksi", "Naskah diterima lengkap"),
        (task_ids[1], Some("Belum Mulai"), "Proses", "Ika Rahmawati", "Mulai layout bab 1-4"),
        (task_ids[4], None, "Selesai", "Admin Produksi", "Naskah AI diterima"),
        (task_ids[5], Some("Proses"), "Menunggu Revisi", "Ika Rahmawati", "Margin perlu diperbaiki, feedback dari editor"),
        (task_ids[6], Some("Belum Mulai"), "Proses", "Dini Septiani", "Mulai desain cover"),
        (task_ids[8], None, "Selesai", "Admin Produksi", "Naskah marketing diterima"),
        (task_ids[9], Some("Proses"), "Selesai", "Ika Rahmawati", "Layout selesai, siap proofreading"),
        (task_ids[11], Some("Proses"), "Menunggu Approval", "Admin Produksi", "Mengajukan ACC cetak ke penerbit"),
    ];

    println!("[SAMPLE SEED] Menyisipkan task_history...");
    for (tid, old_status, new_status, changed_by, notes) in &history_data {
        let changed_at = (chrono::Local::now() - chrono::Duration::days(1)).to_rfc3339();
        conn.execute(
            "INSERT INTO task_history (task_id, old_status, new_status, changed_by, changed_at, notes) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![tid, old_status, new_status, changed_by, changed_at, notes]
        ).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, format!("Gagal di task_history (task_id {}): {}", tid, e)))?;
    }

    // ─── 9. Task Blockers ───
    println!("[SAMPLE SEED] Menyisipkan task_blockers...");
    conn.execute(
        "INSERT INTO task_blockers (task_id, naskah_id, blocker_type, description, status, created_at) VALUES (?1, ?2, ?3, ?4, 'Aktif', ?5)",
        params![task_ids[5], naskah_ids[1], "Menunggu revisi layout", "Layout margin terlalu sempit, perlu penyesuaian ulang sesuai template penerbit", now]
    ).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, format!("Gagal di task_blockers 1: {}", e)))?;

    conn.execute(
        "INSERT INTO task_blockers (task_id, naskah_id, blocker_type, description, status, created_at) VALUES (?1, ?2, ?3, ?4, 'Aktif', ?5)",
        params![task_ids[6], naskah_ids[1], "Menunggu revisi cover", "Warna cover tidak sesuai guideline penerbit, perlu revisi palet warna", now]
    ).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, format!("Gagal di task_blockers 2: {}", e)))?;

    // ─── 10. Task Approvals ───
    println!("[SAMPLE SEED] Menyisipkan task_approvals...");
    conn.execute(
        "INSERT INTO task_approvals (task_id, approval_type, status, requested_at, notes) VALUES (?1, ?2, 'Menunggu Approval', ?3, ?4)",
        params![task_ids[11], "ACC Cetak", now, "Menunggu persetujuan cetak dari penerbit sebelum naik cetak"]
    ).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, format!("Gagal di task_approvals: {}", e)))?;

    // Re-enable foreign key constraints
    conn.execute("PRAGMA foreign_keys = ON", [])?;

    Ok(format!(
        "Sample data berhasil dimuat: {} naskah, {} tim, {} tugas, {} riwayat, 2 kendala, 1 approval",
        naskah_ids.len(), tim_ids.len(), task_ids.len(), history_data.len()
    ))
}

/// Menghapus semua data workflow (tasks, history, blockers, approvals, template)
/// tanpa menghapus data master (naskah, tim, penulis, penerbit)
pub fn reset_workflow_data(conn: &Connection) -> Result<String, DbError> {
    // Urutan penting karena foreign key constraints
    conn.execute("DELETE FROM task_approvals", [])?;
    conn.execute("DELETE FROM task_blockers", [])?;
    conn.execute("DELETE FROM task_history", [])?;
    conn.execute("DELETE FROM tasks", [])?;
    conn.execute("DELETE FROM workflow_template_steps", [])?;
    conn.execute("DELETE FROM workflow_templates", [])?;
    conn.execute("DELETE FROM cetak_distribusi", [])?;
    conn.execute("DELETE FROM import_logs", [])?;

    Ok("Semua data workflow berhasil direset.".to_string())
}
