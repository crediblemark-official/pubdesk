use super::{Database, DbError};
use crate::db::models::{Contact, Penulis};
use rusqlite::params;

impl Database {
    // Contacts (unified — sebelumnya terpisah contacts + penulis)
    pub fn add_contact(&self, contact: &Contact) -> Result<i64, DbError> {
        let now = chrono::Local::now().to_rfc3339();
        self.conn.execute(
            "INSERT INTO contacts (name, wa_number, email, address, province, city, job, institution, data_source, email_valid, wa_valid, needs_review, followup_status, notes, type, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)",
            params![
                contact.name,
                contact.wa_number,
                contact.email,
                contact.address,
                contact.province,
                contact.city,
                contact.job,
                contact.institution,
                contact.data_source,
                contact.email_valid,
                contact.wa_valid,
                contact.needs_review,
                contact.followup_status,
                contact.notes,
                contact.r#type,
                contact.created_at,
                now
            ]
        )?;
        let id = self.conn.last_insert_rowid();
        self.log_activity("contact", Some(id), "CREATE", &format!("Menambahkan kontak '{}'", contact.name))?;
        Ok(id)
    }

    pub fn get_contacts(&self) -> Result<Vec<Contact>, DbError> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, name, wa_number, email, address, province, city, job, institution, data_source, email_valid, wa_valid, needs_review, followup_status, notes, type, created_at, updated_at FROM contacts")?;
        let contacts = stmt.query_map([], |row| {
            Ok(Contact {
                id: row.get(0)?,
                name: row.get(1)?,
                wa_number: row.get(2)?,
                email: row.get(3)?,
                address: row.get(4)?,
                province: row.get(5)?,
                city: row.get(6)?,
                job: row.get(7)?,
                institution: row.get(8)?,
                data_source: row.get(9)?,
                email_valid: row.get(10)?,
                wa_valid: row.get(11)?,
                needs_review: row.get(12)?,
                followup_status: row.get(13)?,
                notes: row.get(14)?,
                r#type: row.get(15)?,
                created_at: row.get(16)?,
                updated_at: row.get(17)?,
            })
        })?;

        let mut result = Vec::new();
        for contact in contacts {
            result.push(contact?);
        }
        Ok(result)
    }

    pub fn update_contact(&self, contact: &Contact) -> Result<(), DbError> {
        let now = chrono::Local::now().to_rfc3339();
        self.conn.execute(
            "UPDATE contacts SET name = ?1, wa_number = ?2, email = ?3, address = ?4, province = ?5, city = ?6, job = ?7, institution = ?8, data_source = ?9, email_valid = ?10, wa_valid = ?11, needs_review = ?12, followup_status = ?13, notes = ?14, type = ?15, updated_at = ?16 WHERE id = ?17",
            params![
                contact.name,
                contact.wa_number,
                contact.email,
                contact.address,
                contact.province,
                contact.city,
                contact.job,
                contact.institution,
                contact.data_source,
                contact.email_valid,
                contact.wa_valid,
                contact.needs_review,
                contact.followup_status,
                contact.notes,
                contact.r#type,
                now,
                contact.id
            ],
        )?;
        self.log_activity("contact", contact.id, "UPDATE", &format!("Memperbarui kontak '{}'", contact.name))?;
        Ok(())
    }

    pub fn delete_contact(&self, id: i64) -> Result<(), DbError> {
        self.conn
            .execute("DELETE FROM contacts WHERE id = ?1", params![id])?;
        self.log_activity("contact", Some(id), "DELETE", &format!("Menghapus kontak id={}", id))?;
        Ok(())
    }

    // Penulis CRUD
    pub fn add_penulis(&self, p: &Penulis) -> Result<i64, DbError> {
        let now = chrono::Local::now().to_rfc3339();
        self.conn.execute(
            "INSERT INTO contacts (name, email, wa_number, province, city, address, job, institution, data_source, email_valid, wa_valid, followup_status, notes, type, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, 'penulis', ?14, ?15)",
            params![
                p.name, p.email, p.wa_number, p.province, p.city, p.address, p.job, p.institution,
                p.data_source, p.email_valid, p.wa_valid, p.followup_status, p.notes, p.created_at, now
            ]
        )?;
        let id = self.conn.last_insert_rowid();
        self.log_activity("contact", Some(id), "CREATE", &format!("Menambahkan penulis '{}'", p.name))?;
        Ok(id)
    }

    pub fn get_penulis(&self) -> Result<Vec<Penulis>, DbError> {
        let mut stmt = self.conn.prepare("SELECT id, name, email, wa_number, province, city, address, job, institution, data_source, email_valid, wa_valid, followup_status, notes, created_at, updated_at FROM contacts WHERE type IN ('penulis','both') ORDER BY name ASC")?;
        let rows = stmt.query_map([], |row| {
            Ok(Penulis {
                id: row.get(0)?,
                name: row.get(1)?,
                email: row.get(2)?,
                wa_number: row.get(3)?,
                province: row.get(4)?,
                city: row.get(5)?,
                address: row.get(6)?,
                job: row.get(7)?,
                institution: row.get(8)?,
                data_source: row.get(9)?,
                email_valid: row.get(10)?,
                wa_valid: row.get(11)?,
                followup_status: row.get(12)?,
                notes: row.get(13)?,
                created_at: row.get(14)?,
                updated_at: row.get(15)?,
            })
        })?;
        let mut res = Vec::new();
        for r in rows {
            res.push(r?);
        }
        Ok(res)
    }

    pub fn update_penulis(&self, p: &Penulis) -> Result<(), DbError> {
        let now = chrono::Local::now().to_rfc3339();
        self.conn.execute(
            "UPDATE contacts SET name = ?1, email = ?2, wa_number = ?3, province = ?4, city = ?5, address = ?6, job = ?7, institution = ?8, data_source = ?9, email_valid = ?10, wa_valid = ?11, followup_status = ?12, notes = ?13, updated_at = ?14 WHERE id = ?15",
            params![
                p.name, p.email, p.wa_number, p.province, p.city, p.address, p.job, p.institution,
                p.data_source, p.email_valid, p.wa_valid, p.followup_status, p.notes, now, p.id
            ]
        )?;
        self.log_activity("contact", p.id, "UPDATE", &format!("Memperbarui penulis '{}'", p.name))?;
        Ok(())
    }

    pub fn delete_penulis(&self, id: i64) -> Result<(), DbError> {
        self.conn
            .execute("DELETE FROM contacts WHERE id = ?1", params![id])?;
        self.log_activity("contact", Some(id), "DELETE", &format!("Menghapus penulis id={}", id))?;
        Ok(())
    }
}
