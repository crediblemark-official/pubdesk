export interface Tim {
  id?: number;
  name: string;
  role: string;
  department?: string;
  is_active: number;
  weekly_target?: number;
  notes?: string;
  pin?: string;
  wa_number?: string;
  email?: string;
  address?: string;
  app?: string;
  created_at: string;
  updated_at?: string;
}

export interface ActivityLogEntry {
  id?: number;
  entity_type: string;
  entity_id?: number;
  action: string;
  description: string;
  performed_by?: number;
  performed_by_name?: string;
  old_value?: string;
  new_value?: string;
  module?: string;
  created_at: string;
}

export interface AppSession {
  id?: number;
  tim_id: number;
  tim_name: string;
  tim_role: string;
  login_at: string;
  logout_at?: string;
  is_active: number;
}
