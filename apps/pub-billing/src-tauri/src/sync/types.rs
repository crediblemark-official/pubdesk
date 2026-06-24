use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncOperation {
    pub op_id: String,
    pub timestamp: String,
    pub device_id: String,
    pub table: String,
    pub row_id: String,
    pub action: SyncAction,
    pub data: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum SyncAction {
    Insert,
    Update,
    Delete,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncStatus {
    pub enabled: bool,
    pub workspace_id: Option<String>,
    pub pending_outbox_count: i64,
    pub last_sync_at: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SyncConfig {
    pub enabled: bool,
    pub device_id: Option<String>,
    pub workspace_id: Option<String>,
    pub admin_setup_complete: bool,
}
