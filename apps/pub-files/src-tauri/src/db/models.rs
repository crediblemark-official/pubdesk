#![allow(dead_code)]
use serde::{Deserialize, Serialize};
use chrono::Local;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct File {
    pub id: Option<i64>,
    pub path: String,
    pub filename: String,
    pub r#type: String,
    pub project_id: Option<i64>,
    pub status: String,
    pub version_label: Option<String>,
    pub last_modified: String,
    pub modified_by: Option<String>,
    pub is_readonly: bool,
    pub description: Option<String>,
    pub responsible_parties: Option<String>,
    #[serde(default)]
    pub created_at: Option<String>,
    #[serde(default)]
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct Tag {
    pub id: Option<i64>,
    pub name: String,
    #[serde(default)]
    pub created_at: Option<String>,
    #[serde(default)]
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct WatchFolder {
    pub id: Option<i64>,
    pub path: String,
    #[serde(default)]
    pub created_at: Option<String>,
    #[serde(default)]
    pub updated_at: Option<String>,
}

impl Default for WatchFolder {
    fn default() -> Self {
        Self {
            id: None,
            path: String::new(),
            created_at: Some(Local::now().to_rfc3339()),
            updated_at: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tim {
    pub id: Option<i64>,
    pub name: String,
    pub role: String,
    pub department: Option<String>,
    pub is_active: i32,
    pub weekly_target: i64,
    pub notes: Option<String>,
    pub pin: Option<String>,
    pub wa_number: Option<String>,
    pub email: Option<String>,
    pub address: Option<String>,
    pub app: Option<String>,
    pub created_at: String,
    pub updated_at: Option<String>,
}

impl Default for Tim {
    fn default() -> Self {
        Self {
            id: None,
            name: String::new(),
            role: "Layouter".to_string(),
            department: None,
            is_active: 1,
            weekly_target: 0,
            notes: None,
            pin: None,
            wa_number: None,
            email: None,
            address: None,
            app: None,
            created_at: Local::now().to_rfc3339(),
            updated_at: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActivityLog {
    pub id: Option<i64>,
    pub entity_type: String,
    pub entity_id: Option<i64>,
    pub action: String,
    pub description: String,
    pub performed_by: Option<i64>,
    pub performed_by_name: Option<String>,
    pub old_value: Option<String>,
    pub new_value: Option<String>,
    pub module: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSession {
    pub id: Option<i64>,
    pub tim_id: i64,
    pub tim_name: String,
    pub tim_role: String,
    pub login_at: String,
    pub logout_at: Option<String>,
    pub is_active: i32,
    pub app: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkSession {
    pub id: Option<i64>,
    pub tim_id: Option<i64>,
    pub start_time: String,
    pub end_time: Option<String>,
    pub duration_seconds: i64,
    pub notes: Option<String>,
    pub created_at: String,
}
