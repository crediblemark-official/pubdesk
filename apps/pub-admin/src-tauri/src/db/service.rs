use super::{Database, DbError};
use crate::db::models::Service;
use rusqlite::params;

impl Database {
    pub fn add_service(&self, service: &Service) -> Result<i64, DbError> {
        let now = chrono::Local::now().to_rfc3339();
        self.conn.execute(
            "INSERT INTO services (name, price, description, category, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                service.name,
                service.price,
                service.description,
                service.category,
                now,
                now
            ],
        )?;
        let id = self.conn.last_insert_rowid();
        self.log_activity("service", Some(id), "CREATE", &format!("Menambahkan layanan '{}'", service.name))?;
        Ok(id)
    }

    pub fn get_services(&self) -> Result<Vec<Service>, DbError> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, name, price, description, category, created_at, updated_at FROM services")?;
        let services = stmt.query_map([], |row| {
            Ok(Service {
                id: row.get(0)?,
                name: row.get(1)?,
                price: row.get(2)?,
                description: row.get(3)?,
                category: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })?;

        let mut result = Vec::new();
        for service in services {
            result.push(service?);
        }
        Ok(result)
    }

    pub fn update_service(&self, service: &Service) -> Result<(), DbError> {
        let now = chrono::Local::now().to_rfc3339();
        self.conn.execute(
            "UPDATE services SET name = ?1, price = ?2, description = ?3, category = ?4, updated_at = ?5 WHERE id = ?6",
            params![
                service.name,
                service.price,
                service.description,
                service.category,
                now,
                service.id
            ]
        )?;
        self.log_activity("service", service.id, "UPDATE", &format!("Memperbarui layanan '{}'", service.name))?;
        Ok(())
    }

    pub fn delete_service(&self, id: i64) -> Result<(), DbError> {
        self.conn
            .execute("DELETE FROM services WHERE id = ?1", params![id])?;
        self.log_activity("service", Some(id), "DELETE", &format!("Menghapus layanan id={}", id))?;
        Ok(())
    }
}
