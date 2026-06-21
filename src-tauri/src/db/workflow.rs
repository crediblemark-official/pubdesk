use super::{Database, DbError};
use crate::db::models::*;
use rusqlite::params;

impl Database {
    // ==========================================
    // TASKS
    // ==========================================
    pub fn add_task(&self, task: &Task) -> Result<i64, DbError> {
        let now = chrono::Local::now().to_rfc3339();
        self.conn.execute(
            "INSERT INTO tasks (naskah_id, step_name, step_order, assigned_team_id, status, priority, start_date, due_date, completed_date, notes, proof_path_or_link, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
            params![
                task.naskah_id,
                task.step_name,
                task.step_order,
                task.assigned_team_id,
                task.status,
                task.priority,
                task.start_date,
                task.due_date,
                task.completed_date,
                task.notes,
                task.proof_path_or_link,
                now,
                now
            ]
        )?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn get_tasks(&self) -> Result<Vec<Task>, DbError> {
        let mut stmt = self.conn.prepare(
            "SELECT t.id, t.naskah_id, t.step_name, t.step_order, t.assigned_team_id, \
             t.status, t.priority, t.start_date, t.due_date, t.completed_date, \
             t.notes, t.proof_path_or_link, t.created_at, t.updated_at, \
             n.title AS naskah_title, tim.name AS pic_name \
             FROM tasks t \
             LEFT JOIN naskah n ON t.naskah_id = n.id \
             LEFT JOIN tim ON t.assigned_team_id = tim.id"
        )?;
        let rows = stmt.query_map([], |row| {
            Ok(Task {
                id: row.get(0)?,
                naskah_id: row.get(1)?,
                step_name: row.get(2)?,
                step_order: row.get(3)?,
                assigned_team_id: row.get(4)?,
                status: row.get(5)?,
                priority: row.get(6)?,
                start_date: row.get(7)?,
                due_date: row.get(8)?,
                completed_date: row.get(9)?,
                notes: row.get(10)?,
                proof_path_or_link: row.get(11)?,
                created_at: row.get(12)?,
                updated_at: row.get(13)?,
                naskah_title: row.get(14)?,
                pic_name: row.get(15)?,
            })
        })?;
        let mut res = Vec::new();
        for r in rows {
            res.push(r?);
        }
        Ok(res)
    }

    pub fn update_task(&self, task: &Task) -> Result<(), DbError> {
        let now = chrono::Local::now().to_rfc3339();
        self.conn.execute(
            "UPDATE tasks SET naskah_id = ?1, step_name = ?2, step_order = ?3, assigned_team_id = ?4, status = ?5, priority = ?6, start_date = ?7, due_date = ?8, completed_date = ?9, notes = ?10, proof_path_or_link = ?11, updated_at = ?12 WHERE id = ?13",
            params![
                task.naskah_id,
                task.step_name,
                task.step_order,
                task.assigned_team_id,
                task.status,
                task.priority,
                task.start_date,
                task.due_date,
                task.completed_date,
                task.notes,
                task.proof_path_or_link,
                now,
                task.id
            ]
        )?;
        Ok(())
    }

    pub fn delete_task(&self, id: i64) -> Result<(), DbError> {
        self.conn.execute("DELETE FROM tasks WHERE id = ?1", params![id])?;
        Ok(())
    }

    // ==========================================
    // WORKFLOW TEMPLATES
    // ==========================================
    pub fn add_workflow_template(&self, tpl: &WorkflowTemplate) -> Result<i64, DbError> {
        let now = chrono::Local::now().to_rfc3339();
        self.conn.execute(
            "INSERT INTO workflow_templates (name, description, is_active, created_at) VALUES (?1, ?2, ?3, ?4)",
            params![tpl.name, tpl.description, tpl.is_active, now]
        )?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn get_workflow_templates(&self) -> Result<Vec<WorkflowTemplate>, DbError> {
        let mut stmt = self.conn.prepare("SELECT id, name, description, is_active, created_at FROM workflow_templates")?;
        let rows = stmt.query_map([], |row| {
            Ok(WorkflowTemplate {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                is_active: row.get(3)?,
                created_at: row.get(4)?,
            })
        })?;
        let mut res = Vec::new();
        for r in rows {
            res.push(r?);
        }
        Ok(res)
    }

    // Task History
    pub fn add_task_history(&self, history: &TaskHistory) -> Result<i64, DbError> {
        self.conn.execute(
            "INSERT INTO task_history (task_id, old_status, new_status, changed_by, changed_at, notes) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                history.task_id,
                history.old_status,
                history.new_status,
                history.changed_by,
                history.changed_at,
                history.notes
            ]
        )?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn get_task_history(&self, task_id: i64) -> Result<Vec<TaskHistory>, DbError> {
        let mut stmt = self.conn.prepare(
            r#"SELECT h.id, h.task_id, h.old_status, h.new_status, h.changed_by, h.changed_at, h.notes,
                      n.title, ws.step_name
               FROM task_history h
               JOIN tasks t ON h.task_id = t.id
               JOIN naskah n ON t.naskah_id = n.id
               JOIN workflow_steps ws ON t.step_id = ws.id
               WHERE h.task_id = ?1
               ORDER BY h.changed_at DESC"#
        )?;

        let iter = stmt.query_map(params![task_id], |row| {
            Ok(TaskHistory {
                id: row.get(0)?,
                task_id: row.get(1)?,
                old_status: row.get(2)?,
                new_status: row.get(3)?,
                changed_by: row.get(4)?,
                changed_at: row.get(5)?,
                notes: row.get(6)?,
                naskah_title: row.get(7)?,
                step_name: row.get(8)?,
            })
        })?;

        let mut histories = Vec::new();
        for h in iter {
            histories.push(h?);
        }
        Ok(histories)
    }

    pub fn get_all_task_history(&self) -> Result<Vec<TaskHistory>, DbError> {
        let mut stmt = self.conn.prepare(
            r#"SELECT h.id, h.task_id, h.old_status, h.new_status, h.changed_by, h.changed_at, h.notes,
                      n.title, ws.step_name
               FROM task_history h
               JOIN tasks t ON h.task_id = t.id
               JOIN naskah n ON t.naskah_id = n.id
               JOIN workflow_steps ws ON t.step_id = ws.id
               ORDER BY h.changed_at DESC
               LIMIT 100"#
        )?;

        let iter = stmt.query_map([], |row| {
            Ok(TaskHistory {
                id: row.get(0)?,
                task_id: row.get(1)?,
                old_status: row.get(2)?,
                new_status: row.get(3)?,
                changed_by: row.get(4)?,
                changed_at: row.get(5)?,
                notes: row.get(6)?,
                naskah_title: row.get(7)?,
                step_name: row.get(8)?,
            })
        })?;

        let mut histories = Vec::new();
        for h in iter {
            histories.push(h?);
        }
        Ok(histories)
    }

    pub fn import_alur_naskah_batch(&mut self, payloads: Vec<ImportTaskPayload>) -> Result<usize, DbError> {
        let tx = self.conn.transaction()?;
        let now = chrono::Local::now().to_rfc3339();
        let mut count = 0;

        for p in payloads {
            // Find or create Naskah by title
            let naskah_id: i64;
            let mut stmt = tx.prepare("SELECT id FROM naskah WHERE title = ?1 LIMIT 1")?;
            let mut rows = stmt.query(params![p.judul])?;
            if let Some(row) = rows.next()? {
                naskah_id = row.get(0)?;
            } else {
                tx.execute(
                    "INSERT INTO naskah (title, created_at) VALUES (?1, ?2)",
                    params![p.judul, now]
                )?;
                naskah_id = tx.last_insert_rowid();
            }

            // Simple insert into tasks
            tx.execute(
                "INSERT INTO tasks (naskah_id, step_name, status, start_date, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![naskah_id, "Produksi", p.status, p.tanggal, now, now]
            )?;
            count += 1;
        }

        tx.commit()?;
        Ok(count)
    }
}

