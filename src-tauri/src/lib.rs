// ============================================================
// SECOND BRAIN — Tauri Backend (lib.rs)
// Registers plugins: SQL (SQLite), Dialog, FS, Opener
// Custom commands for database import/export/backup
// ============================================================

use tauri_plugin_sql::{Migration, MigrationKind};

/// Database migrations — run automatically on first connection.
/// The plugin tracks which migrations have already been applied.
fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_initial_schema",
            sql: include_str!("../migrations/001_initial_schema.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "seed_default_data",
            sql: include_str!("../migrations/002_seed_data.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "add_drawing_board",
            sql: include_str!("../migrations/003_add_drawing.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add_profile_stats",
            sql: include_str!("../migrations/004_add_profile_stats.sql"),
            kind: MigrationKind::Up,
        },
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        // SQLite database with automatic migrations
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:second_brain.db", get_migrations())
                .build(),
        )
        // Native file dialog (open/save)
        .plugin(tauri_plugin_dialog::init())
        // Filesystem access (for import/export)
        .plugin(tauri_plugin_fs::init())
        // Open URLs in default browser
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
