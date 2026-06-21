export interface WorkflowTemplate {
  id?: number;
  name: string;
  description?: string;
  is_active: number; // 0 = false, 1 = true
  created_at: string;
}

export interface WorkflowTemplateStep {
  id?: number;
  template_id: number;
  step_order: number;
  step_name: string;
  default_role?: string;
  default_duration_days: number;
  is_required: number; // 0 = false, 1 = true
}

export interface Task {
  id?: number;
  naskah_id: number;
  step_name: string;
  step_order?: number;
  assigned_team_id?: number;
  status: string; // "Belum Mulai", "Proses", "Menunggu Revisi", "Menunggu Approval", "Selesai", "Terlambat"
  priority: string; // "Rendah", "Normal", "Tinggi", "Urgent"
  start_date?: string;
  due_date?: string;
  completed_date?: string;
  notes?: string;
  proof_path_or_link?: string;
  created_at: string;
  updated_at?: string;
  
  // Custom joined fields for frontend display
  naskah_title?: string;
  pic_name?: string;
}

export interface TaskHistory {
  id?: number;
  task_id: number;
  old_status?: string;
  new_status: string;
  changed_by?: string;
  changed_at: string;
  notes?: string;
  naskah_title?: string;
  step_name?: string;
}

export interface TaskBlocker {
  id?: number;
  task_id?: number;
  naskah_id?: number;
  blocker_type: string;
  description?: string;
  status: string;
  created_at: string;
  resolved_at?: string;
}

export interface TaskApproval {
  id?: number;
  task_id: number;
  approval_type: string;
  status: string;
  requested_at: string;
  decided_at?: string;
  decided_by?: string;
  notes?: string;
}
