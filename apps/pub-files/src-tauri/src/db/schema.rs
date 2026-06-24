use rusqlite::{Connection, Result};

pub fn create_tables(conn: &Connection) -> Result<()> {
    pubhub_db_shared::schema::build_schema(conn)?;

    // Pastikan WAL mode + busy timeout untuk akses konkuren dari multi-app.
    let _ = conn.execute("PRAGMA journal_mode=WAL;", []);
    let _ = conn.execute("PRAGMA busy_timeout = 5000;", []);

    Ok(())
}
