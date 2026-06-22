use rusqlite::{Connection, Result};

pub fn create_tables(conn: &Connection) -> Result<()> {
    pubhub_db_shared::schema::build_schema(conn)?;

    // ==========================================
    // LOCAL-FIRST SYNC (P2P)
    // ==========================================
    crate::sync::engine::init_sync_schema(conn)?;
    let _ = crate::sync::engine::ensure_device_id(conn);

    // WAL mode + busy timeout for concurrent access from multiple PubHub apps.
    let _ = conn.execute("PRAGMA journal_mode=WAL;", []);
    let _ = conn.execute("PRAGMA busy_timeout = 5000;", []);

    // Dynamically create sync triggers for all tracked tables.
    crate::sync::engine::create_sync_triggers(conn)?;

    Ok(())
}
