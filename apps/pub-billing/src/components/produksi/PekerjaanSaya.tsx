import React, { useState, useMemo } from 'react';
import { Task } from '../../types/workflow.types';
import UpdateStatusModal from './UpdateStatusModal';
import { useWorkflowContext } from '../../contexts/WorkflowContext';
import { useAppContext } from '../../contexts/AppContext';
import { Badge, getStatusVariant } from '../../ui/atoms/Badge';
import { FilterBar, FilterGroup, FilterChip } from '../../ui/molecules/FilterBar';
import { DataTablePage, DataTable, DataTableHeader, DataTableBody, tableStyles } from '../../ui/molecules/DataTable';
import { formatDateLong } from '../../utils/format';

const FILTERS = ['Semua', 'Hari Ini', 'Terlambat', 'Revisi', 'Approval', 'Selesai'] as const;
type FilterType = typeof FILTERS[number];

const PekerjaanSaya: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const { tasks, isLoading, setSelectedTaskId } = useWorkflowContext();
  const { setRightPanelVisible } = useAppContext();
  const [filter, setFilter] = useState<FilterType>('Semua');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const isOverdue = (task: Task) => {
    if (task.status === 'Selesai' || !task.due_date) return false;
    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
  };

  const isHariIni = (task: Task) => {
    if (!task.due_date) return false;
    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
  };

  const filteredTasks = useMemo(() => tasks.filter(t => {
    if (searchQuery && !(t.naskah_title || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filter === 'Semua') return true;
    if (filter === 'Selesai') return t.status === 'Selesai';
    if (filter === 'Revisi') return t.status === 'Menunggu Revisi';
    if (filter === 'Approval') return t.status === 'Menunggu Approval';
    if (filter === 'Terlambat') return isOverdue(t) || t.status === 'Terlambat';
    if (filter === 'Hari Ini') return isHariIni(t);
    return true;
  }), [tasks, filter, searchQuery]);

  return (
    <DataTablePage
      filterBar={
        <FilterBar>
          <FilterGroup label="">
            {FILTERS.map(f => (
              <FilterChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
            ))}
          </FilterGroup>
        </FilterBar>
      }
    >
      <DataTable>
        <DataTableHeader columns={['Judul Naskah', 'Tahap', 'Deadline', 'Status', 'Prioritas']} />
        <DataTableBody isLoading={isLoading} isEmpty={filteredTasks.length === 0} colSpan={6} loadingMessage="Memuat data..." emptyMessage="Tidak ada tugas yang sesuai filter.">
          {filteredTasks.map(task => (
            <React.Fragment key={task.id}>
              <tr
                style={{
                  ...tableStyles.row,
                  transition: 'background 0.2s',
                }}
                onClick={() => { if (task.id) { setSelectedTaskId(task.id); setRightPanelVisible(true); } }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-panel)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={tableStyles.tdTitle}>{task.naskah_title || `Naskah #${task.naskah_id}`}</td>
                <td style={tableStyles.td}>{task.step_name}</td>
                <td style={tableStyles.tdMuted}>
                  {formatDateLong(task.due_date)}
                  {isOverdue(task) && <span style={{ color: '#ef4444', marginLeft: '6px', fontSize: '12px' }}>⚠️</span>}
                </td>
                <td style={tableStyles.td}>
                  <Badge label={task.status} variant={getStatusVariant(task.status)} />
                </td>
                <td style={tableStyles.td}>
                  <span style={{
                    fontSize: '12px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    color: task.priority === 'Tinggi' || task.priority === 'Urgent' ? '#ef4444' : 'var(--text-secondary)',
                  }}>
                    {task.priority || 'Normal'}
                  </span>
                </td>
                <td style={tableStyles.tdAction}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                    style={tableStyles.actionButton}
                    title={task.status === 'Belum Mulai' ? 'Mulai' : 'Update'}
                  >
                    {task.status === 'Belum Mulai' ? '▶️' : '✏️'}
                  </button>
                </td>
              </tr>
              {(task.notes || task.proof_path_or_link) && (
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td colSpan={6} style={{ padding: '0 20px 16px 20px' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {task.notes && (
                        <div><strong style={{ color: 'var(--text-primary)' }}>Catatan:</strong> {task.notes}</div>
                      )}
                      {task.proof_path_or_link && (
                        <div><strong style={{ color: 'var(--text-primary)' }}>Bukti/File:</strong> <a href={task.proof_path_or_link} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{task.proof_path_or_link}</a></div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </DataTableBody>
      </DataTable>

      {selectedTask && (
        <UpdateStatusModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSuccess={() => setSelectedTask(null)}
        />
      )}
    </DataTablePage>
  );
};

export default PekerjaanSaya;
