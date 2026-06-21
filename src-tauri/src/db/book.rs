use super::{Database, DbError};
use crate::db::models::Book;
use rusqlite::params;

impl Database {
    pub fn add_book(&self, book: &Book) -> Result<i64, DbError> {
        let now = chrono::Local::now().to_rfc3339();
        self.conn.execute(
            "INSERT INTO books (title, isbn, regular_price, po_price, weight_grams, author_id, cover_path, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                book.title,
                book.isbn,
                book.regular_price,
                book.po_price,
                book.weight_grams,
                book.author_id,
                book.cover_path,
                now,
                now
            ]
        )?;
        let id = self.conn.last_insert_rowid();
        self.log_activity("book", Some(id), "CREATE", &format!("Menambahkan buku '{}'", book.title))?;
        Ok(id)
    }

    pub fn get_books(&self) -> Result<Vec<Book>, DbError> {
        let mut stmt = self.conn.prepare("SELECT id, title, isbn, regular_price, po_price, weight_grams, author_id, cover_path, created_at, updated_at FROM books")?;
        let books = stmt.query_map([], |row| {
            Ok(Book {
                id: row.get(0)?,
                title: row.get(1)?,
                isbn: row.get(2)?,
                regular_price: row.get(3)?,
                po_price: row.get(4)?,
                weight_grams: row.get(5)?,
                author_id: row.get(6)?,
                cover_path: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        })?;

        let mut result = Vec::new();
        for book in books {
            result.push(book?);
        }
        Ok(result)
    }

    pub fn delete_book(&self, id: i64) -> Result<(), DbError> {
        self.conn
            .execute("DELETE FROM books WHERE id = ?1", params![id])?;
        self.log_activity("book", Some(id), "DELETE", &format!("Menghapus buku id={}", id))?;
        Ok(())
    }

    pub fn update_book(&self, book: &Book) -> Result<(), DbError> {
        let now = chrono::Local::now().to_rfc3339();
        self.conn.execute(
            "UPDATE books SET title = ?1, isbn = ?2, regular_price = ?3, po_price = ?4, weight_grams = ?5, author_id = ?6, cover_path = ?7, updated_at = ?8 WHERE id = ?9",
            params![
                book.title,
                book.isbn,
                book.regular_price,
                book.po_price,
                book.weight_grams,
                book.author_id,
                book.cover_path,
                now,
                book.id
            ]
        )?;
        self.log_activity("book", book.id, "UPDATE", &format!("Memperbarui buku '{}'", book.title))?;
        Ok(())
    }
}
