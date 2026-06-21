import React from 'react';
import { useWorkflowContext } from '../../../contexts/WorkflowContext';
import { Badge, getStatusVariant } from '../../../ui/atoms/Badge';
import { Button } from '../../../ui/atoms/Button';
import { InfoRow } from '../../../ui/molecules/InfoRow';
import { SectionCard } from '../../../ui/molecules/SectionCard';
import { formatDateLong } from '../../../utils/format';
import UpdateStatusModal from '../../produksi/UpdateStatusModal';
import TaskModal from '../../produksi/TaskModal';

const TaskPreviewPanel: React.FC = () => {
  const { tasks, selectedTaskId } = useWorkflowContext();
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  if (!selectedTask) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-panel)', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center' }}>
          Pilih task untuk melihat detail
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-panel)', padding: '20px', overflowY: 'auto', gap: '16px' }}>
      <div>
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
          Detail Task
        </h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
          {selectedTask.naskah_title || `Naskah #${selectedTask.naskah_id}`}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Badge label={selectedTask.status} variant={getStatusVariant(selectedTask.status)} />
        <Badge label={selectedTask.step_name} variant="neutral" />
      </div>

      <SectionCard title="Informasi Task">
        <InfoRow label="PIC" value={selectedTask.pic_name || '-'} />
        <InfoRow label="Tanggal Mulai" value={formatDateLong(selectedTask.start_date)} />
        <InfoRow label="Deadline" value={formatDateLong(selectedTask.due_date)} />
        {selectedTask.completed_date && (
          <InfoRow label="Tanggal Selesai" value={formatDateLong(selectedTask.completed_date)} />
        )}
      </SectionCard>

      {selectedTask.notes && (
        <SectionCard title="Catatan">
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            {selectedTask.notes}
          </p>
        </SectionCard>
      )}

      {selectedTask.proof_path_or_link && (
        <SectionCard title="Bukti / File">
          <a
            href={selectedTask.proof_path_or_link}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block',
              padding: '10px 14px',
              background: 'var(--bg-surface)',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              color: 'var(--accent)',
              textDecoration: 'none',
              fontSize: '13px',
              wordBreak: 'break-all',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
          >
            {selectedTask.proof_path_or_link}
          </a>
        </SectionCard>
      )}

      <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
        <Button fullWidth onClick={() => setShowUpdateModal(true)} variant="primary">
          Update Status
        </Button>
        <Button fullWidth onClick={() => setShowEditModal(true)} variant="secondary">
          Edit Task
        </Button>
      </div>

      {showUpdateModal && (
        <UpdateStatusModal
          task={selectedTask}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={() => setShowUpdateModal(false)}
        />
      )}

      {showEditModal && (
        <TaskModal
          task={selectedTask}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default TaskPreviewPanel;
