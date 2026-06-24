/**
 * Tipe data domain: Aplikasi (module routing, app state)
 */

export type AppModule =
  | 'home'
  | 'files'
  | 'files-parent'
  | 'invoice'
  | 'activity-log'
  | 'settings-local-folders'
  | 'settings-gdrive'


export interface AppState {
  activeModule: AppModule;
}
