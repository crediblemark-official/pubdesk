import React, { useState, useMemo } from 'react';
import { Task } from '../../types/workflow.types';
import UpdateStatusModal from './UpdateStatusModal';
import { useWorkflowContext } from '../../contexts/WorkflowContext';
import { useAppContext } from '../../contexts/AppContext';
import { Badge, getStatusVariant } from '../../ui/atoms/Badge';
import { FilterBar, FilterGroup, FilterChip } from '../../ui/molecules/FilterBar';
import { DataTablePage, DataTable, DataTableHeader, DataTableBody, tableStyles } from '../../ui/molecules/DataTable';
import { StatCard } from '../../ui/molecules/StatCard';
import { formatDateLong } from '../../utils/format';

const STAT_CARDS = [
  { key: 'aktif', label: 'Aktif', color: '#3b82f6' },
  { key: 'deadlineDekat', label: 'Deadline Dekat', color: '#f59e0b' },
  { key: 'terlambat', label: 'Terlambat', color: '#ef4444' },
  { key: 'revisi', label: 'Menunggu Revisi', color: '#f97316' },
  { key: 'approval', label: 'Menunggu Approval', color: '#8b5cf6' },
  { key: 'selesaiMingguIni', label: 'Selesai Minggu Ini', color: '#22c55e' },
] as const;

type StatKey = typeof STAT_CARDS[number]['key'];

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

  const isDeadlineDekat = (task: Task) => {
    if (task.status === 'Selesai' || !task.due_date) return false;
    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  const isHariIni = (task: Task) => {
    if (!task.due_date) return false;
    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
  };

  const isSelesaiMingguIni = (task: Task) => {
    if (task.status !== 'Selesai' || !task.completed_date) return false;
    const diffDays = Math.floor((today.getTime() - new Date(task.completed_date).getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
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

  const stats = useMemo((): Record<StatKey, number> => ({
    aktif: tasks.filter(t => t.status === 'Proses' || t.status === 'Belum Mulai').length,
    deadlineDekat: tasks.filter(isDeadlineDekat).length,
    terlambat: tasks.filter(t => isOverdue(t) || t.status === 'Terlambat').length,
    revisi: tasks.filter(t => t.status === 'Menunggu Revisi').length,
    approval: tasks.filter(t => t.status === 'Menunggu Approval').length,
    selesaiMingguIni: tasks.filter(isSelesaiMingguIni).length,
  }), [tasks]);

  return (
    <DataTablePage
      filterBar={
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', padding: '12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            {STAT_CARDS.map(card => (
              <StatCard key={card.key} label={card.label} value={stats[card.key]} color={card.color} />
            ))}
          </div>

          <FilterBar>
            <FilterGroup label="">
              {FILTERS.map(f => (
                <FilterChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
              ))}
            </FilterGroup>
          </FilterBar>
        </>
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
