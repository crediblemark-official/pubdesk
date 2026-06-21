import React, { useState } from 'react';
import { Task } from '../../types/workflow.types';
import { useAppContext } from '../../contexts/AppContext';
import { useWorkflowContext } from '../../contexts/WorkflowContext';

interface UpdateStatusModalProps {
  task: Task;
  onClose: () => void;
  onSuccess: () => void;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({ task, onClose, onSuccess }) => {
  const { showToast } = useAppContext();
  const { updateTaskStatus } = useWorkflowContext();
  const [status, setStatus] = useState(task.status || 'Belum Mulai');
  const [notes, setNotes] = useState('');
  const [proof, setProof] = useState(task.proof_path_or_link || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    'Belum Mulai',
    'Proses',
    'Menunggu Revisi',
    'Menunggu Approval',
    'Selesai',
    'Terlambat'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === task.status && !notes && proof === task.proof_path_or_link) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTaskStatus(task.id!, status, notes, proof);
      showToast('Status berhasil diupdate!', 'success');
      onSuccess();
    } catch (err) {
      console.error('Failed to update task:', err);
      showToast('Gagal mengupdate status tugas.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--bg-panel)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        border: '1px solid var(--border)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>Update Status Pekerjaan</h3>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {task.naskah_title || `Naskah #${task.naskah_id}`} - {task.step_name}
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-primary)' }}>Status Saat Ini</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-primary)' }}>Bukti Pekerjaan (URL / Path)</label>
            <input 
              type="text" 
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              placeholder="Misal: link Google Drive atau path file"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-primary)' }}>Catatan / Kendala</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan informasi progres, alasan keterlambatan, dsb."
              rows={4}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', resize: 'vertical' }}
            />
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary"
              style={{ padding: '8px 16px' }}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
