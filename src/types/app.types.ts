/**
 * Tipe data domain: Aplikasi (module routing, app state)
 */

export type AppModule =
  | 'invoice'
  | 'invoice-manager'
  | 'invoice-insight'
  | 'extractor'
  | 'files'
  | 'ledger'
  | 'settings'
  | 'books'
  | 'services'
  | 'crm-penulis'
  | 'crm-penerbit'
  | 'crm-naskah'
  | 'crm-tim'
  | 'naskah-orders'
  | 'layouters';

export interface AppState {
  activeModule: AppModule;
}
