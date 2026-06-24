/**
 * Tipe data domain: Aplikasi (module routing, app state)
 */

export type AppModule =
  | 'home'
  | 'invoice'
  | 'invoice-manager'
  | 'invoice-insight'
  | 'settings-invoice'
  | 'services'
  | 'pelanggan'
  | 'activity-log'
  | 'laporan-operasional'
  | 'master-data-parent'
  | 'invoice-parent'


export interface AppState {
  activeModule: AppModule;
}
