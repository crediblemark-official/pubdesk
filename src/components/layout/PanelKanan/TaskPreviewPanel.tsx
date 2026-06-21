import React from 'react';
import { useWorkflowContext } from '../../../contexts/WorkflowContext';
import { Badge } from '../../../ui/atoms/Badge';
import { Button } from '../../../ui/atoms/Button';
import UpdateStatusModal from '../../produksi/UpdateStatusModal';
import TaskModal from '../../produksi/TaskModal';

// Baris info — label + value dengan border bawah opsional
const InfoRow = ({
  label,
  value,
  noBorder = false,
}: {
  label: string;
  value: React.ReactNode;
  noBorder?: boolean;
}) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    ...(noBorder ? {} : { borderBottom: '1px solid var(--border)', paddingBottom: '8px' })
  }}>
    <span style={{ color: 'var(--text-secondary)', fontSize: '12px', flexShrink: 0 }}>{label}</span>
    <strong style={{ color: 'var(--text-primary)', fontSize: '12px', textAlign: 'right' }}>{value}</strong>
  </div>
);

// Kartu section standar
const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h5 style={{
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      color: 'var(--text-secondary)',
      marginBottom: '8px'
    }}>
      {title}
    </h5>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      background: 'var(--bg-card)',
      padding: '12px 14px',
      borderRadius: '10px',
      border: '1px solid var(--border)',
    }}>
      {children}
    </div>
  </div>
);

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

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent' => {
    switch (status) {
      case 'Selesai': return 'success';
      case 'Proses': return 'info';
      case 'Menunggu Revisi': return 'warning';
      case 'Menunggu Approval': return 'accent';
      case 'Terlambat': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-panel)', padding: '20px', overflowY: 'auto', gap: '16px' }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
          Detail Task
        </h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
          {selectedTask.naskah_title || `Naskah #${selectedTask.naskah_id}`}
        </p>
      </div>

      {/* Status & Step Badges */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Badge label={selectedTask.status} variant={getStatusBadgeVariant(selectedTask.status)} />
        <Badge label={selectedTask.step_name} variant="neutral" />
      </div>

      {/* Info Section */}
      <SectionCard title="Informasi Task">
        <InfoRow label="PIC" value={selectedTask.pic_name || '-'} />
        <InfoRow label="Tanggal Mulai" value={selectedTask.start_date ? new Date(selectedTask.start_date).toLocaleDateString('id-ID') : '-'} />
        <InfoRow label="Deadline" value={selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString('id-ID') : '-'} />
        {selectedTask.completed_date && (
          <InfoRow label="Tanggal Selesai" value={new Date(selectedTask.completed_date).toLocaleDateString('id-ID')} />
        )}
      </SectionCard>

      {/* Catatan */}
      {selectedTask.notes && (
        <SectionCard title="Catatan">
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            {selectedTask.notes}
          </p>
        </SectionCard>
      )}

      {/* Bukti / File */}
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

      {/* Action Buttons */}
      <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
        <Button
          fullWidth
          onClick={() => setShowUpdateModal(true)}
          variant="primary"
        >
          Update Status
        </Button>
        <Button
          fullWidth
          onClick={() => setShowEditModal(true)}
          variant="secondary"
        >
          Edit Task
        </Button>
      </div>

      {/* Modals */}
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
