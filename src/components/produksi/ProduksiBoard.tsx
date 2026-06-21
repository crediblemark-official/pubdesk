import React, { useState, useMemo } from 'react';
import { useWorkflowContext } from '../../contexts/WorkflowContext';
import { useAppContext } from '../../contexts/AppContext';
import { Badge } from '../../ui/atoms/Badge';
import { FilterBar, FilterGroup, FilterChip, FilterDivider } from '../../ui/molecules/FilterBar';
import { tableStyles } from '../../ui/molecules/DataTable';
import { formatDateLong } from '../../utils/format';
import { useUniqueValues } from '../../hooks/useUniqueValues';

const COLUMNS = [
  { id: 'Belum Mulai', label: 'Belum Mulai', color: '#64748b', bg: '#f1f5f9' },
  { id: 'Proses', label: 'Proses', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'Menunggu Revisi', label: 'Menunggu Revisi', color: '#f59e0b', bg: '#fffbeb' },
  { id: 'Menunggu Approval', label: 'Approval', color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'Selesai', label: 'Done', color: '#22c55e', bg: '#f0fdf4' },
];

const ProduksiBoard: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const { tasks, isLoading, setSelectedTaskId } = useWorkflowContext();
  const { setRightPanelVisible } = useAppContext();

  const [filterPic, setFilterPic] = useState('');
  const [filterTahap, setFilterTahap] = useState('');

  const uniquePics = useUniqueValues(tasks, 'pic_name');
  const uniqueTahap = useUniqueValues(tasks, 'step_name');

  const filteredTasks = useMemo(() => tasks.filter(t => {
    if (searchQuery && !(t.naskah_title || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterPic && t.pic_name !== filterPic) return false;
    if (filterTahap && t.step_name !== filterTahap) return false;
    return true;
  }), [tasks, searchQuery, filterPic, filterTahap]);

  const maxTasksCount = useMemo(() => {
    return Math.max(...COLUMNS.map(col => filteredTasks.filter(t => t.status === col.id).length), 0);
  }, [filteredTasks]);

  return (
    <div style={tableStyles.container}>
      <FilterBar>
        <FilterGroup label="PIC:">
          <FilterChip label="Semua" active={filterPic === ''} onClick={() => setFilterPic('')} />
          {uniquePics.map(pic => (
            <FilterChip key={pic as string} label={pic as string} active={filterPic === pic} onClick={() => setFilterPic(pic as string)} />
          ))}
        </FilterGroup>

        <FilterDivider />

        <FilterGroup label="Tahap:">
          <FilterChip label="Semua" active={filterTahap === ''} onClick={() => setFilterTahap('')} />
          {uniqueTahap.map(tahap => (
            <FilterChip key={tahap as string} label={tahap as string} active={filterTahap === tahap} onClick={() => setFilterTahap(tahap as string)} />
          ))}
        </FilterGroup>
      </FilterBar>

      <div style={{ flex: 1, overflowX: 'auto', background: 'var(--bg-card)' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', tableLayout: 'fixed', width: 'max-content' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
            <tr style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)' }}>
              {COLUMNS.map(col => {
                const colTasks = filteredTasks.filter(t => t.status === col.id);
                return (
                  <th
                    key={col.id}
                    style={{
                      ...tableStyles.th,
                      width: '300px',
                      color: col.color,
                      borderRight: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{col.label}</span>
                      <span style={{ background: col.bg, color: col.color, padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                        {colTasks.length}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={COLUMNS.length} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Memuat board...
                </td>
              </tr>
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Tidak ada data tugas
                </td>
              </tr>
            ) : (
              Array.from({ length: maxTasksCount }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {COLUMNS.map(col => {
                    const colTasks = filteredTasks.filter(t => t.status === col.id);
                    const task = colTasks[rowIndex];

                    if (!task) {
                      return <td key={`${col.id}-${rowIndex}`} style={{ padding: '0', borderRight: '1px solid var(--border)' }} />;
                    }

                    return (
                      <td
                        key={`${col.id}-${rowIndex}`}
                        style={{
                          padding: '0',
                          verticalAlign: 'top',
                          borderRight: '1px solid var(--border)',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        <div
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            transition: 'background 0.1s ease',
                            color: 'var(--text-primary)',
                          }}
                          onClick={() => { if (task.id) { setSelectedTaskId(task.id); setRightPanelVisible(true); } }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <div style={{ fontWeight: '500', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {task.naskah_title || `Naskah #${task.naskah_id}`}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                            <Badge label={task.step_name} variant="neutral" />
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              PIC: {task.pic_name || '-'}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '16px' }}>
                            <span>Mulai: {formatDateLong(task.start_date)}</span>
                            <span>Deadline: {formatDateLong(task.due_date)}</span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProduksiBoard;
