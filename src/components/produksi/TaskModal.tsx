import React, { useState, useEffect } from 'react';
import { Task } from '../../types/workflow.types';
import { useAppContext } from '../../contexts/AppContext';
import { useWorkflowContext } from '../../contexts/WorkflowContext';
import { Modal } from '../../ui/molecules/Modal';
import { TextField } from '../../ui/atoms/TextField';
import { TextArea } from '../../ui/atoms/TextArea';
import { Select } from '../../ui/atoms/Select';
import { Button } from '../../ui/atoms/Button';
import { DatePicker } from '../../ui/atoms/DatePicker';
import { useAuth } from '../../contexts/AuthContext';

interface TaskModalProps {
  task?: Task; // if provided, it's edit mode
  onClose: () => void;
  onSuccess: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { showToast } = useAppContext();
  const { addTask, updateTask } = useWorkflowContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!task;
  // Form states
  const [naskahId, setNaskahId] = useState(task?.naskah_id || '');
  const [stepName, setStepName] = useState(task?.step_name || '');
  const [picName, setPicName] = useState(task?.pic_name || (currentUser ? currentUser.tim_name : ''));
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.split('T')[0] : '');
  const [priority, setPriority] = useState(task?.priority || 'Normal');
  const [status, setStatus] = useState(task?.status || 'Belum Mulai');
  const [notes, setNotes] = useState(task?.notes || '');

  useEffect(() => {
    if (!isEdit && currentUser) {
      setPicName(currentUser.tim_name);
    }
  }, [currentUser, isEdit]);

  const statusOptions = [
    { value: 'Belum Mulai', label: 'Belum Mulai' },
    { value: 'Proses', label: 'Proses' },
    { value: 'Menunggu Revisi', label: 'Menunggu Revisi' },
    { value: 'Menunggu Approval', label: 'Menunggu Approval' },
    { value: 'Selesai', label: 'Selesai' },
    { value: 'Batal', label: 'Batal' }
  ];

  const priorityOptions = [
    { value: 'Normal', label: 'Normal' },
    { value: 'Tinggi', label: 'Tinggi' },
    { value: 'Urgent', label: 'Urgent' },
    { value: 'Rendah', label: 'Rendah' }
  ];



  const modalTitle = isEdit ? 'Edit Tugas' : 'Tambah Tugas Baru';

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
        await updateTask(updatedTask);
        showToast('Tugas berhasil diupdate', 'success');
      } else {
        // Create mode
        const newTask = {
          naskah_id: Number(naskahId),
          step_name: stepName,
          status: 'Belum Mulai',
          priority: priority,
          due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
          notes: notes,
          assigned_team_id: currentUser?.tim_id
        };
        await addTask(newTask);
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
    <Modal open={true} onClose={onClose} title={modalTitle} width="500px">
      {isEdit && task && (
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '-8px', marginBottom: '8px' }}>
          {task.naskah_title || `Naskah #${task.naskah_id}`} - {task.step_name}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {!isEdit && (
          <>
            <TextField 
              required 
              type="number" 
              label="ID Naskah" 
              value={naskahId} 
              onChange={e => setNaskahId(e.target.value)} 
              fullWidth
            />
            <TextField 
              required 
              type="text" 
              label="Nama Tahap Workflow" 
              value={stepName} 
              onChange={e => setStepName(e.target.value)} 
              fullWidth
            />
          </>
        )}

         <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
           <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Penanggung Jawab (PJ)</label>
           <div style={{ 
             padding: '10px 14px', 
             background: 'var(--bg-panel)', 
             border: '1px solid var(--border)', 
             borderRadius: '8px', 
             fontSize: '14px', 
             color: 'var(--text-secondary)' 
           }}>
             👤 {isEdit ? (picName || '-') : (currentUser?.tim_name || '-')} {!isEdit && '(Sesuai Sesi Aktif)'}
           </div>
         </div>

        <DatePicker 
          label="Deadline" 
          value={dueDate} 
          onChange={setDueDate} 
          fullWidth
        />

        <Select
          label="Prioritas"
          value={priority}
          onChange={e => setPriority(e.target.value)}
          options={priorityOptions}
          fullWidth
        />

        {isEdit && (
          <Select
            label="Status"
            value={status}
            onChange={e => setStatus(e.target.value)}
            options={statusOptions}
            fullWidth
          />
        )}

        <TextArea
          label="Catatan"
          value={notes}
          onChange={e => setNotes(e.target.value)}
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
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
