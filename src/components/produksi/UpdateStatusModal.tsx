import React, { useState } from 'react';
import { Task } from '../../types/workflow.types';
import { useAppContext } from '../../contexts/AppContext';
import { useWorkflowContext } from '../../contexts/WorkflowContext';
import { Modal } from '../../ui/molecules/Modal';
import { TextField } from '../../ui/atoms/TextField';
import { TextArea } from '../../ui/atoms/TextArea';
import { Select } from '../../ui/atoms/Select';
import { Button } from '../../ui/atoms/Button';

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
    { value: 'Belum Mulai', label: 'Belum Mulai' },
    { value: 'Proses', label: 'Proses' },
    { value: 'Menunggu Revisi', label: 'Menunggu Revisi' },
    { value: 'Menunggu Approval', label: 'Menunggu Approval' },
    { value: 'Selesai', label: 'Selesai' },
    { value: 'Terlambat', label: 'Terlambat' }
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
    <Modal open={true} onClose={onClose} title="Update Status Pekerjaan" width="500px">
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '-8px', marginBottom: '8px' }}>
        {task.naskah_title || `Naskah #${task.naskah_id}`} - {task.step_name}
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <Select
          label="Status Saat Ini"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={statusOptions}
          fullWidth
        />

        <TextField
          label="Bukti Pekerjaan (URL / Path)"
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          placeholder="Misal: link Google Drive atau path file"
          fullWidth
        />

        <TextArea
          label="Catatan / Kendala"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tambahkan informasi progres, alasan keterlambatan, dsb."
          rows={4}
          fullWidth
        />

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
          >
            Batal
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            variant="primary"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateStatusModal;
