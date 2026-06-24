use tauri::State;
use crate::AppState;
use crate::db::{AppSession, WorkSession, ActivityLog, Tim};

#[tauri::command]
pub async fn get_tim(state: State<'_, AppState>) -> Result<Vec<Tim>, String> {
    let db = state.db.lock().unwrap();
    let db = db.as_ref().ok_or("Database tidak diinisialisasi")?;
    db.get_all_tim().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn login_user(state: State<'_, AppState>, tim_id: i64, pin: String) -> Result<AppSession, String> {
    let db_guard = state.db.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database tidak diinisialisasi")?;
    let tim_list = db.get_all_tim().map_err(|e| e.to_string())?;
    let member = tim_list.into_iter().find(|t| t.id == Some(tim_id))
        .ok_or_else(|| "Anggota tim tidak ditemukan".to_string())?;
    if let Some(expected_pin) = &member.pin {
        if !expected_pin.is_empty() && *expected_pin != pin {
            return Err("PIN salah".to_string());
        }
    }
    let session = db.login_session(tim_id, &member.name, &member.role).map_err(|e| e.to_string())?;
    let _ = db.log_activity_audit("session", None, "LOGIN", &format!("Karyawan '{}' login ke sistem", member.name), Some(tim_id), Some(&member.name), None, None, Some("auth"));
    drop(db_guard);
    let mut active = state.active_session.lock().unwrap();
    *active = Some(session.clone());
    Ok(session)
}

#[tauri::command]
pub async fn logout_user(state: State<'_, AppState>) -> Result<(), String> {
    let db_guard = state.db.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database tidak diinisialisasi")?;
    {
        let active = state.active_session.lock().unwrap();
        if let Some(ref session) = *active {
            let _ = db.log_activity_audit("session", None, "LOGOUT", &format!("Karyawan '{}' logout dari sistem", session.tim_name), Some(session.tim_id), Some(&session.tim_name), None, None, Some("auth"));
        }
    }
    db.logout_session().map_err(|e| e.to_string())?;
    drop(db_guard);
    let mut active = state.active_session.lock().unwrap();
    *active = None;
    Ok(())
}

#[tauri::command]
pub async fn get_current_user(state: State<'_, AppState>) -> Result<Option<AppSession>, String> {
    {
        let active = state.active_session.lock().unwrap();
        if active.is_some() {
            return Ok(active.clone());
        }
    }
    let db_guard = state.db.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database tidak diinisialisasi")?;
    let session = db.get_active_session().map_err(|e| e.to_string())?;

    drop(db_guard);

    if let Some(ref s) = session {
        let mut active = state.active_session.lock().unwrap();
        *active = Some(s.clone());
    }
    Ok(session)
}

#[tauri::command]
pub async fn start_work_session(state: State<'_, AppState>, start_time: String) -> Result<i64, String> {
    let current_tim_id = {
        let active = state.active_session.lock().unwrap();
        active.as_ref().map(|s| s.tim_id).ok_or_else(|| "Pengguna belum login".to_string())?
    };
    let db = state.db.lock().unwrap();
    let db = db.as_ref().ok_or("Database tidak diinisialisasi")?;
    db.start_work_session(current_tim_id, &start_time).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn stop_work_session(state: State<'_, AppState>, id: i64, end_time: String, duration_seconds: i64, notes: Option<String>) -> Result<(), String> {
    let current_tim_id = {
        let active = state.active_session.lock().unwrap();
        active.as_ref().map(|s| s.tim_id).ok_or_else(|| "Pengguna belum login".to_string())?
    };
    let db = state.db.lock().unwrap();
    let db = db.as_ref().ok_or("Database tidak diinisialisasi")?;
    db.stop_work_session(id, current_tim_id, &end_time, duration_seconds, notes.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_active_work_session(state: State<'_, AppState>) -> Result<Option<WorkSession>, String> {
    let current_tim_id = {
        let active = state.active_session.lock().unwrap();
        active.as_ref().map(|s| s.tim_id).ok_or_else(|| "Pengguna belum login".to_string())?
    };
    let db = state.db.lock().unwrap();
    let db = db.as_ref().ok_or("Database tidak diinisialisasi")?;
    db.get_active_work_session(current_tim_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_work_sessions(state: State<'_, AppState>, limit: i64) -> Result<Vec<WorkSession>, String> {
    let current_tim_id = {
        let active = state.active_session.lock().unwrap();
        active.as_ref().map(|s| s.tim_id).ok_or_else(|| "Pengguna belum login".to_string())?
    };
    let db = state.db.lock().unwrap();
    let db = db.as_ref().ok_or("Database tidak diinisialisasi")?;
    db.get_work_sessions(current_tim_id, limit).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_activity_log(state: State<'_, AppState>, limit: i64) -> Result<Vec<ActivityLog>, String> {
    let db = state.db.lock().unwrap();
    let db = db.as_ref().ok_or("Database tidak diinisialisasi")?;
    db.get_activity_log(limit).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_activity_log_filtered(
    state: State<'_, AppState>,
    limit: i64,
    performed_by: Option<i64>,
    entity_type: Option<String>,
    action: Option<String>,
) -> Result<Vec<ActivityLog>, String> {
    let db = state.db.lock().unwrap();
    let db = db.as_ref().ok_or("Database tidak diinisialisasi")?;
    db.get_activity_log_filtered(
        limit,
        performed_by,
        entity_type.as_deref(),
        action.as_deref(),
    ).map_err(|e| e.to_string())
}
