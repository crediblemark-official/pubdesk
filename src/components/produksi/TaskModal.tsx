import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Task, TaskHistory } from '../../types/workflow.types';
import { useAppContext } from '../../contexts/AppContext';

interface TaskModalProps {
  task?: Task; // if provided, it's edit mode
  onClose: () => void;
  onSuccess: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSuccess }) => {
  const { showToast } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!task;

  // Form states
  const [naskahId, setNaskahId] = useState(task?.naskah_id || '');
  const [stepName, setStepName] = useState(task?.step_name || '');
  const [picName, setPicName] = useState(task?.pic_name || '');
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.split('T')[0] : '');
  const [priority, setPriority] = useState(task?.priority || 'Normal');
  const [status, setStatus] = useState(task?.status || 'Belum Mulai');
  const [notes, setNotes] = useState(task?.notes || '');

  const statusOptions = [
    'Belum Mulai',
    'Proses',
    'Menunggu Revisi',
    'Menunggu Approval',
    'Selesai',
    'Batal'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEdit && task) {
        // Edit mode
        const updatedTask: Task = {
          ...task,
          pic_name: picName,
          due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
          priority,
          status,
          notes
        };
        await invoke('update_task', { task: updatedTask });
        
        if (status !== task.status) {
          const history: TaskHistory = {
            task_id: task.id!,
            old_status: task.status,
            new_status: status,
            changed_by: 'Admin',
            changed_at: new Date().toISOString(),
            notes: notes ? notes : `PIC diubah ke ${picName}, deadline ${dueDate}`,
          };
          await invoke('add_task_history', { history });
        }
        showToast('Tugas berhasil diupdate', 'success');
      } else {
        // Create mode
        const newTask: Task = {
          naskah_id: Number(naskahId),
          step_name: stepName,
          status: 'Belum Mulai',
          priority: priority,
          due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
          created_at: new Date().toISOString(),
          start_date: undefined,
          completed_date: undefined,
          notes: notes,
          proof_path_or_link: undefined,
          assigned_team_id: undefined,
        };
        const newId = await invoke<number>('add_task', { task: newTask });
        
        const history: TaskHistory = {
          task_id: newId,
          old_status: undefined,
          new_status: 'Belum Mulai',
          changed_by: 'Admin',
          changed_at: new Date().toISOString(),
          notes: 'Tugas baru dibuat.',
        };
        await invoke('add_task_history', { history });
        
        showToast('Tugas berhasil ditambahkan', 'success');
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', width: '400px', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
        <h3 style={{ margin: '0 0 16px 0' }}>{isEdit ? 'Edit Tugas' : 'Tambah Tugas Baru'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {!isEdit && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>ID Naskah</label>
                <input required type="number" value={naskahId} onChange={e => setNaskahId(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'white' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Nama Tahap Workflow</label>
                <input required type="text" value={stepName} onChange={e => setStepName(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'white' }} />
              </div>
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Nama PIC</label>
            <input type="text" value={picName} onChange={e => setPicName(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'white' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Deadline</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'white' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Prioritas</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'white' }}>
              <option value="Normal">Normal</option>
              <option value="Tinggi">Tinggi</option>
              <option value="Urgent">Urgent</option>
              <option value="Rendah">Rendah</option>
            </select>
          </div>

          {isEdit && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'white' }}>
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Catatan</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'white' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>Batal</button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
