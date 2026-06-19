mod db;

use db::*;
use std::sync::Mutex;
use tauri::State;

struct AppState {
    db: Mutex<Option<Database>>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn init_database(app_handle: tauri::AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    let db_path = get_db_path(&app_handle).map_err(|e| e.to_string())?;
    init_db(&db_path).map_err(|e| e.to_string())?;
    
    let db = Database::new(&db_path).map_err(|e| e.to_string())?;
    *state.db.lock().unwrap() = Some(db);
    
    Ok(())
}

// Books commands
#[tauri::command]
fn get_books(state: State<'_, AppState>) -> Result<Vec<Book>, String> {
    let db = state.db.lock().unwrap();
    let db = db.as_ref().ok_or("Database not initialized")?;
    db.get_books().map_err(|e| e.to_string())
}

#[tauri::command]
fn add_book(state: State<'_, AppState>, book: Book) -> Result<i64, String> {
    let db = state.db.lock().unwrap();
    let db = db.as_ref().ok_or("Database not initialized")?;
    db.add_book(&book).map_err(|e| e.to_string())
}

// Contacts commands
#[tauri::command]
fn get_contacts(state: State<'_, AppState>) -> Result<Vec<Contact>, String> {
    let db = state.db.lock().unwrap();
    let db = db.as_ref().ok_or("Database not initialized")?;
    db.get_contacts().map_err(|e| e.to_string())
}

#[tauri::command]
fn add_contact(state: State<'_, AppState>, contact: Contact) -> Result<i64, String> {
    let db = state.db.lock().unwrap();
    let db = db.as_ref().ok_or("Database not initialized")?;
    db.add_contact(&contact).map_err(|e| e.to_string())
}

// Invoices commands
#[tauri::command]
fn get_invoices(state: State<'_, AppState>) -> Result<Vec<Invoice>, String> {
    let db = state.db.lock().unwrap();
    let db = db.as_ref().ok_or("Database not initialized")?;
    db.get_invoices().map_err(|e| e.to_string())
}

#[tauri::command]
fn add_invoice(state: State<'_, AppState>, invoice: Invoice) -> Result<i64, String> {
    let db = state.db.lock().unwrap();
    let db = db.as_ref().ok_or("Database not initialized")?;
    db.add_invoice(&invoice).map_err(|e| e.to_string())
}

// Files commands
#[tauri::command]
fn get_files(state: State<'_, AppState>) -> Result<Vec<File>, String> {
    let db = state.db.lock().unwrap();
    let db = db.as_ref().ok_or("Database not initialized")?;
    db.get_files().map_err(|e| e.to_string())
}

#[tauri::command]
fn add_file(state: State<'_, AppState>, file: File) -> Result<i64, String> {
    let db = state.db.lock().unwrap();
    let db = db.as_ref().ok_or("Database not initialized")?;
    db.add_file(&file).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_file(state: State<'_, AppState>, id: i64) -> Result<(), String> {
    let db = state.db.lock().unwrap();
    let db = db.as_ref().ok_or("Database not initialized")?;
    db.delete_file(id).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_physical_file(app_handle: tauri::AppHandle, filename: String) -> Result<String, String> {
    use tauri::Manager;
    use std::fs::File as StdFile;
    use std::io::Write;

    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    
    let invoices_dir = app_data_dir.join("invoices");
    std::fs::create_dir_all(&invoices_dir).map_err(|e| e.to_string())?;
    
    let file_path = invoices_dir.join(&filename);
    
    let mut file = StdFile::create(&file_path).map_err(|e| e.to_string())?;
    // Tulis byte minimal PDF yang valid agar pdf viewer sistem tidak crash saat dibuka
    file.write_all(b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 48 >>\nstream\nBT\n/F1 14 Tf\n50 750 Td\n(PubDesk - Pratinjau Invoice Fisik) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000113 00000 n\n0000000244 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n341\n%%EOF").map_err(|e| e.to_string())?;
    
    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
fn open_file_physically(path: String) -> Result<(), String> {
    use std::process::Command;
    
    Command::new("xdg-open")
        .arg(&path)
        .spawn()
        .map_err(|e| e.to_string())?;
        
    Ok(())
}

#[tauri::command]
fn open_file_location_physically(path: String) -> Result<(), String> {
    use std::process::Command;
    use std::path::Path;
    
    let path_ref = Path::new(&path);
    let parent = path_ref.parent().ok_or("No parent directory")?;
    
    // Coba buka dengan nautilus --select agar menyorot file terpilih (khusus Linux GNOME)
    let nautilus_status = Command::new("nautilus")
        .arg("--select")
        .arg(&path)
        .spawn();
        
    if nautilus_status.is_err() {
        // Fallback membuka folder induk menggunakan xdg-open
        Command::new("xdg-open")
            .arg(parent)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            db: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            init_database,
            get_books,
            add_book,
            get_contacts,
            add_contact,
            get_invoices,
            add_invoice,
            get_files,
            add_file,
            delete_file,
            create_physical_file,
            open_file_physically,
            open_file_location_physically
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
