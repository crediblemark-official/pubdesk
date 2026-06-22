pub mod error;
pub mod models;
pub mod sample_data;
pub mod schema;
pub mod workflow;

pub mod book;
pub mod contact;
pub mod invoice;
pub mod file;
pub mod naskah;
pub mod service;
pub mod session;

// Modul database SQLite untuk aplikasi PubDesk
pub use error::DbError;
pub use models::*;
use rusqlite::Connection;
use std::path::PathBuf;
use tauri::Manager;

pub fn get_db_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, DbError> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|_| DbError::PathError)?;

    std::fs::create_dir_all(&app_data_dir)?;
    Ok(app_data_dir.join("pubhub.db"))
}

pub fn init_db(db_path: &PathBuf) -> Result<(), DbError> {
    let conn = Connection::open(db_path)?;
    schema::create_tables(&conn)?;
    
    // Sinkronisasi data pelanggan dari invoice lama ke tabel contacts jika contacts kosong
    let _ = session::sync_contacts_from_invoices(&conn);
    
    Ok(())
}

pub struct Database {
    pub(crate) conn: Connection,
}

impl Database {
    pub fn new(db_path: &PathBuf) -> Result<Self, DbError> {
        let conn = Connection::open(db_path)?;
        Ok(Self { conn })
    }
}
