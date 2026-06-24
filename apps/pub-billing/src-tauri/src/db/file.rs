use super::{Database, DbError};
use crate::db::models::{File, WatchFolder};
use rusqlite::params;

impl Database {
    // Files
    pub fn add_file(&self, file: &File) -> Result<i64, DbError> {
        let now = chrono::Local::now().to_rfc3339();
        self.conn.execute(
            "INSERT INTO files (path, filename, type, project_id, status, version_label, last_modified, modified_by, is_readonly, description, responsible_parties, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
            params![
                file.path,
                file.filename,
                file.r#type,
                file.project_id,
                file.status,
                file.version_label,
                file.last_modified,
                file.modified_by,
                file.is_readonly,
                file.description,
                file.responsible_parties,
                now,
                now
            ]
        )?;
        let id = self.conn.last_insert_rowid();
        self.log_activity("file", Some(id), "CREATE", &format!("Menambahkan file '{}'", file.filename))?;
        Ok(id)
    }

    pub fn get_files(&self) -> Result<Vec<File>, DbError> {
        let mut stmt = self.conn.prepare("SELECT id, path, filename, type, project_id, status, version_label, last_modified, modified_by, is_readonly, description, responsible_parties, created_at, updated_at FROM files")?;
        let files = stmt.query_map([], |row| {
            Ok(File {
                id: row.get(0)?,
                path: row.get(1)?,
                filename: row.get(2)?,
                r#type: row.get(3)?,
                project_id: row.get(4)?,
                status: row.get(5)?,
                version_label: row.get(6)?,
                last_modified: row.get(7)?,
                modified_by: row.get(8)?,
                is_readonly: row.get(9)?,
                description: row.get(10)?,
                responsible_parties: row.get(11)?,
                created_at: row.get(12)?,
                updated_at: row.get(13)?,
            })
        })?;

        let mut result = Vec::new();
        for file in files {
            result.push(file?);
        }
        Ok(result)
    }

    pub fn delete_file(&self, id: i64) -> Result<(), DbError> {
        self.conn
            .execute("DELETE FROM files WHERE id = ?1", params![id])?;
        self.log_activity("file", Some(id), "DELETE", &format!("Menghapus file id={}", id))?;
        Ok(())
    }

    pub fn update_file(&self, file: &File) -> Result<(), DbError> {
        let now = chrono::Local::now().to_rfc3339();
        self.conn.execute(
            "UPDATE files SET filename = ?1, type = ?2, project_id = ?3, status = ?4, version_label = ?5, last_modified = ?6, modified_by = ?7, is_readonly = ?8, description = ?9, responsible_parties = ?10, updated_at = ?11 WHERE id = ?12",
            params![
                file.filename,
                file.r#type,
                file.project_id,
                file.status,
                file.version_label,
                file.last_modified,
                file.modified_by,
                file.is_readonly,
                file.description,
                file.responsible_parties,
                now,
                file.id
            ]
        )?;
        self.log_activity("file", file.id, "UPDATE", &format!("Memperbarui file '{}'", file.filename))?;
        Ok(())
    }

    // Watch Folders
    #[allow(dead_code)]
    pub fn add_watch_folder(&self, path: &str) -> Result<i64, DbError> {
        let now = chrono::Local::now().to_rfc3339();
        self.conn.execute(
            "INSERT INTO watch_folders (path, created_at, updated_at) VALUES (?1, ?2, ?3)",
            params![path, now, now],
        )?;
        Ok(self.conn.last_insert_rowid())
    }

    #[allow(dead_code)]
    pub fn get_watch_folders(&self) -> Result<Vec<WatchFolder>, DbError> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, path, created_at, updated_at FROM watch_folders")?;
        let folders = stmt.query_map([], |row| {
            Ok(WatchFolder {
                id: row.get(0)?,
                path: row.get(1)?,
                created_at: row.get(2)?,
                updated_at: row.get(3)?,
            })
        })?;

        let mut result = Vec::new();
        for folder in folders {
            result.push(folder?);
        }
        Ok(result)
    }

    #[allow(dead_code)]
    pub fn delete_watch_folder(&self, id: i64) -> Result<(), DbError> {
        self.conn
            .execute("DELETE FROM watch_folders WHERE id = ?1", params![id])?;
        Ok(())
    }

    #[allow(dead_code)]
    pub fn delete_files_by_prefix(&self, prefix: &str) -> Result<(), DbError> {
        self.conn.execute(
            "DELETE FROM files WHERE path LIKE ?1",
            params![format!("{}%", prefix)],
        )?;
        Ok(())
    }

    #[allow(dead_code)]
    pub fn get_file_by_path(&self, path: &str) -> Result<Option<File>, DbError> {
        let mut stmt = self.conn.prepare("SELECT id, path, filename, type, project_id, status, version_label, last_modified, modified_by, is_readonly, description, responsible_parties, created_at, updated_at FROM files WHERE path = ?1")?;
        let mut rows = stmt.query(params![path])?;
        if let Some(row) = rows.next()? {
            Ok(Some(File {
                id: row.get(0)?,
                path: row.get(1)?,
                filename: row.get(2)?,
                r#type: row.get(3)?,
                project_id: row.get(4)?,
                status: row.get(5)?,
                version_label: row.get(6)?,
                last_modified: row.get(7)?,
                modified_by: row.get(8)?,
                is_readonly: row.get(9)?,
                description: row.get(10)?,
                responsible_parties: row.get(11)?,
                created_at: row.get(12)?,
                updated_at: row.get(13)?,
            }))
        } else {
            Ok(None)
        }
    }

    #[allow(dead_code)]
    pub fn delete_file_by_path(&self, path: &str) -> Result<(), DbError> {
        self.conn
            .execute("DELETE FROM files WHERE path = ?1", params![path])?;
        Ok(())
    }

    // Tags Management
    #[allow(dead_code)]
    pub fn add_file_tag(&self, file_id: i64, tag: &str) -> Result<(), DbError> {
        self.conn.execute(
            "INSERT OR IGNORE INTO tags (name, created_at) VALUES (?1, datetime('now'))",
            params![tag],
        )?;

        let tag_id: i64 =
            self.conn
                .query_row("SELECT id FROM tags WHERE name = ?1", params![tag], |row| {
                    row.get(0)
                })?;

        self.conn.execute(
            "INSERT OR IGNORE INTO file_tags (file_id, tag_id) VALUES (?1, ?2)",
            params![file_id, tag_id],
        )?;
        Ok(())
    }

    #[allow(dead_code)]
    pub fn remove_file_tag(&self, file_id: i64, tag: &str) -> Result<(), DbError> {
        let tag_id_res =
            self.conn
                .query_row("SELECT id FROM tags WHERE name = ?1", params![tag], |row| {
                    row.get::<_, i64>(0)
                });
        if let Ok(tag_id) = tag_id_res {
            self.conn.execute(
                "DELETE FROM file_tags WHERE file_id = ?1 AND tag_id = ?2",
                params![file_id, tag_id],
            )?;
        }
        Ok(())
    }

    #[allow(dead_code)]
    pub fn get_file_tags(&self, file_id: i64) -> Result<Vec<String>, DbError> {
        let mut stmt = self.conn.prepare(
            "SELECT t.name FROM tags t 
             JOIN file_tags ft ON t.id = ft.tag_id 
             WHERE ft.file_id = ?1",
        )?;
        let rows = stmt.query_map(params![file_id], |row| row.get(0))?;
        let mut tags = Vec::new();
        for r in rows {
            tags.push(r?);
        }
        Ok(tags)
    }

    #[allow(dead_code)]
    pub fn get_all_tags(&self) -> Result<Vec<String>, DbError> {
        let mut stmt = self
            .conn
            .prepare("SELECT name FROM tags ORDER BY name ASC")?;
        let rows = stmt.query_map([], |row| row.get(0))?;
        let mut tags = Vec::new();
        for r in rows {
            tags.push(r?);
        }
        Ok(tags)
    }

    #[allow(dead_code)]
    pub fn get_all_file_tags(
        &self,
    ) -> Result<std::collections::HashMap<i64, Vec<String>>, DbError> {
        let mut stmt = self.conn.prepare(
            "SELECT ft.file_id, t.name FROM file_tags ft 
             JOIN tags t ON ft.tag_id = t.id",
        )?;
        let rows = stmt.query_map([], |row| {
            Ok((row.get::<_, i64>(0)?, row.get::<_, String>(1)?))
        })?;

        let mut map = std::collections::HashMap::new();
        for r in rows {
            let (file_id, tag_name) = r?;
            map.entry(file_id).or_insert_with(Vec::new).push(tag_name);
        }
        Ok(map)
    }
}
