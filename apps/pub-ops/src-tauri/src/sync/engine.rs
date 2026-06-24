use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use pbkdf2::pbkdf2_hmac;
use rusqlite::{params, Connection};
use sha2::{Digest, Sha256};

use super::types::{SyncConfig, SyncStatus};

pub const VAULT_KEY_MASTER: &str = "master_key_sealed";
pub const VAULT_SALT_SIZE: usize = 16;
pub const KEY_SIZE: usize = 32;
pub const NONCE_SIZE: usize = 12;

// ---------------------------------------------------------------------------
// Crypto helpers (inlined from deleted crypto.rs)
// ---------------------------------------------------------------------------

fn derive_key_from_pin(pin: &str, salt: &[u8]) -> [u8; KEY_SIZE] {
    let mut key = [0u8; KEY_SIZE];
    pbkdf2_hmac::<Sha256>(pin.as_bytes(), salt, 200_000, &mut key);
    key
}

pub fn generate_master_key() -> [u8; KEY_SIZE] {
    let mut key = [0u8; KEY_SIZE];
    rand::RngCore::fill_bytes(&mut rand::thread_rng(), &mut key);
    key
}

fn encrypt_with_key(key: &[u8; KEY_SIZE], plaintext: &[u8]) -> Result<Vec<u8>, String> {
    let cipher = Aes256Gcm::new_from_slice(key).map_err(|e| format!("Invalid key length: {:?}", e))?;
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let ciphertext = cipher
        .encrypt(&nonce, plaintext)
        .map_err(|e| format!("Encryption failed: {:?}", e))?;
    let mut out = Vec::with_capacity(NONCE_SIZE + ciphertext.len());
    out.extend_from_slice(nonce.as_slice());
    out.extend_from_slice(&ciphertext);
    Ok(out)
}

fn decrypt_with_key(key: &[u8; KEY_SIZE], encrypted: &[u8]) -> Result<Vec<u8>, String> {
    if encrypted.len() < NONCE_SIZE {
        return Err("Encrypted payload too short".to_string());
    }
    let nonce = Nonce::from_slice(&encrypted[..NONCE_SIZE]);
    let ciphertext = &encrypted[NONCE_SIZE..];
    let cipher = Aes256Gcm::new_from_slice(key).map_err(|e| format!("Invalid key length: {:?}", e))?;
    cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("Decryption failed (wrong PIN/key?): {:?}", e))
}

fn seal_master_key_with_pin(master_key: &[u8; KEY_SIZE], pin: &str) -> String {
    let mut salt = [0u8; VAULT_SALT_SIZE];
    rand::RngCore::fill_bytes(&mut rand::thread_rng(), &mut salt);
    let kek = derive_key_from_pin(pin, &salt);
    let encrypted = encrypt_with_key(&kek, master_key).expect("encrypt master key");
    let mut combined = Vec::with_capacity(VAULT_SALT_SIZE + encrypted.len());
    combined.extend_from_slice(&salt);
    combined.extend_from_slice(&encrypted);
    base64::Engine::encode(&base64::prelude::BASE64_STANDARD, &combined)
}

fn unseal_master_key_with_pin(sealed: &str, pin: &str) -> Result<[u8; KEY_SIZE], String> {
    let combined = base64::Engine::decode(&base64::prelude::BASE64_STANDARD, sealed)
        .map_err(|e| format!("Invalid base64: {}", e))?;
    if combined.len() < VAULT_SALT_SIZE + NONCE_SIZE + 1 {
        return Err("Sealed key too short".to_string());
    }
    let salt = &combined[..VAULT_SALT_SIZE];
    let encrypted = &combined[VAULT_SALT_SIZE..];
    let kek = derive_key_from_pin(pin, salt);
    let plaintext = decrypt_with_key(&kek, encrypted)?;
    if plaintext.len() != KEY_SIZE {
        return Err("Decrypted master key has wrong length".to_string());
    }
    let mut key = [0u8; KEY_SIZE];
    key.copy_from_slice(&plaintext);
    Ok(key)
}

fn workspace_id_from_master_key(master_key: &[u8; KEY_SIZE]) -> String {
    let hash = Sha256::digest(master_key);
    hex::encode(&hash[..16])
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

pub fn init_sync_schema(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS crypto_vault (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS sync_meta (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )",
        [],
    )?;

    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM sync_meta WHERE key = 'device_id'",
        [],
        |row| row.get(0),
    ).unwrap_or(0);

    if count == 0 {
        let mut bytes = [0u8; 16];
        rand::RngCore::fill_bytes(&mut rand::thread_rng(), &mut bytes);
        let new_id = format!("dev_{}", hex::encode(bytes));
        let _ = conn.execute(
            "INSERT INTO sync_meta (key, value) VALUES ('device_id', ?1)",
            [new_id],
        );
    }

    Ok(())
}

pub fn get_sync_config(conn: &Connection) -> Result<SyncConfig, rusqlite::Error> {
    let enabled: String = conn
        .query_row(
            "SELECT value FROM p2p_config WHERE key = 'sync_enabled'",
            [],
            |row| row.get(0),
        )
        .unwrap_or_else(|_| "false".to_string());

    let device_id: Option<String> = conn
        .query_row(
            "SELECT value FROM sync_meta WHERE key = 'device_id'",
            [],
            |row| row.get(0),
        )
        .ok();

    let workspace_id: Option<String> = conn
        .query_row(
            "SELECT value FROM p2p_config WHERE key = 'sync_workspace_id'",
            [],
            |row| row.get(0),
        )
        .ok();

    let admin_setup: String = conn
        .query_row(
            "SELECT value FROM p2p_config WHERE key = 'sync_admin_setup'",
            [],
            |row| row.get(0),
        )
        .unwrap_or_else(|_| "false".to_string());

    Ok(SyncConfig {
        enabled: enabled == "true",
        device_id,
        workspace_id,
        admin_setup_complete: admin_setup == "true",
    })
}

pub fn create_workspace(conn: &Connection, admin_pin: &str) -> Result<String, String> {
    let master = generate_master_key();
    let sealed = seal_master_key_with_pin(&master, admin_pin);

    conn.execute(
        "INSERT OR REPLACE INTO crypto_vault (key, value) VALUES (?1, ?2)",
        params![VAULT_KEY_MASTER, sealed],
    )
    .map_err(|e| format!("Gagal menyimpan master key: {}", e))?;

    let workspace_id = workspace_id_from_master_key(&master);
    conn.execute(
        "INSERT OR REPLACE INTO p2p_config (key, value) VALUES ('sync_workspace_id', ?1)",
        [&workspace_id],
    )
    .map_err(|e| format!("Gagal menyimpan workspace id: {}", e))?;

    conn.execute(
        "INSERT OR REPLACE INTO p2p_config (key, value) VALUES ('sync_admin_setup', 'true')",
        [],
    )
    .map_err(|e| e.to_string())?;

    Ok(workspace_id)
}

pub fn unlock_master_key(conn: &Connection, pin: &str) -> Result<[u8; KEY_SIZE], String> {
    let sealed: String = conn
        .query_row(
            "SELECT value FROM crypto_vault WHERE key = ?1",
            [VAULT_KEY_MASTER],
            |row| row.get(0),
        )
        .map_err(|_| "Master key belum di-setup.".to_string())?;
    unseal_master_key_with_pin(&sealed, pin)
}

pub fn has_master_key(conn: &Connection) -> Result<bool, rusqlite::Error> {
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM crypto_vault WHERE key = ?1",
        [VAULT_KEY_MASTER],
        |row| row.get(0),
    )?;
    Ok(count > 0)
}

pub fn create_employee_invite(
    conn: &Connection,
    admin_pin: &str,
    employee_pin: &str,
) -> Result<String, String> {
    let master = unlock_master_key(conn, admin_pin)?;
    let invite = seal_master_key_with_pin(&master, employee_pin);
    Ok(invite)
}

pub fn join_workspace(conn: &Connection, invite_code: &str, employee_pin: &str) -> Result<String, String> {
    let master = unseal_master_key_with_pin(invite_code, employee_pin)?;
    let sealed = seal_master_key_with_pin(&master, employee_pin);

    conn.execute(
        "INSERT OR REPLACE INTO crypto_vault (key, value) VALUES (?1, ?2)",
        params![VAULT_KEY_MASTER, sealed],
    )
    .map_err(|e| format!("Gagal menyimpan master key: {}", e))?;

    let workspace_id = workspace_id_from_master_key(&master);
    conn.execute(
        "INSERT OR REPLACE INTO p2p_config (key, value) VALUES ('sync_workspace_id', ?1)",
        [&workspace_id],
    )
    .map_err(|e| format!("Gagal menyimpan workspace id: {}", e))?;

    Ok(workspace_id)
}

pub fn build_sync_status(
    conn: &Connection,
    enabled: bool,
    workspace_id: Option<String>,
    last_sync_at: Option<String>,
    error: Option<String>,
) -> Result<SyncStatus, rusqlite::Error> {
    let pending_outbox_count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM sync_outbox WHERE sent_at IS NULL",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    Ok(SyncStatus {
        enabled,
        workspace_id,
        pending_outbox_count,
        last_sync_at,
        error,
    })
}
