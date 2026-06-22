import React, { useState, useMemo } from 'react';
import { Task } from '../../types/workflow.types';
import UpdateStatusModal from './UpdateStatusModal';
import { useWorkflowContext } from '../../contexts/WorkflowContext';
import { useAppContext } from '../../contexts/AppContext';
import { Badge, getStatusVariant } from '../../ui/atoms/Badge';
import { FilterBar, FilterGroup, FilterChip, FilterDivider } from '../../ui/molecules/FilterBar';
import { DataTablePage, DataTable, DataTableHeader, DataTableBody, HoverRow, tableStyles } from '../../ui/molecules/DataTable';
import { useUniqueValues } from '../../hooks/useUniqueValues';

const ProduksiKendala: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const { tasks, isLoading, setSelectedTaskId } = useWorkflowContext();
  const { setRightPanelVisible } = useAppContext();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterType, setFilterType] = useState<'status' | 'pic'>('status');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPic, setFilterPic] = useState('');

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(t => t.status === 'Menunggu Revisi' || t.notes);
    if (searchQuery) filtered = filtered.filter(t => (t.naskah_title || '').toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterPic) filtered = filtered.filter(t => t.pic_name === filterPic);
    if (filterStatus) filtered = filtered.filter(t => t.status === filterStatus);
    return filtered;
  }, [tasks, searchQuery, filterPic, filterStatus]);

  const uniquePics = useUniqueValues(tasks, 'pic_name');
  const uniqueStatuses = useUniqueValues(tasks, 'status');

  return (
    <DataTablePage
      filterBar={
        <FilterBar>
          <FilterGroup label="🔍 FILTER:">
            <FilterChip 
              label="Status" 
              active={filterType === 'status'} 
              onClick={() => { setFilterType('status'); setFilterStatus(''); setFilterPic(''); }} 
            />
            <FilterChip 
              label="PJ" 
              active={filterType === 'pic'} 
              onClick={() => { setFilterType('pic'); setFilterStatus(''); setFilterPic(''); }} 
            />
          </FilterGroup>

          {filterType === 'status' && uniqueStatuses.length > 0 && (
            <>
              <FilterDivider />
              <FilterGroup label="📋 STATUS:">
                <FilterChip label="Semua" active={filterStatus === ''} onClick={() => setFilterStatus('')} />
                {uniqueStatuses.map(status => (
                  <FilterChip key={status as string} label={status as string} active={filterStatus === status} onClick={() => setFilterStatus(status as string)} />
                ))}
              </FilterGroup>
            </>
          )}

          {filterType === 'pic' && uniquePics.length > 0 && (
            <>
              <FilterDivider />
              <FilterGroup label="👤 PJ:">
                <FilterChip label="Semua" active={filterPic === ''} onClick={() => setFilterPic('')} />
                {uniquePics.map(pic => (
                  <FilterChip key={pic as string} label={pic as string} active={filterPic === pic} onClick={() => setFilterPic(pic as string)} />
                ))}
              </FilterGroup>
            </>
          )}
        </FilterBar>
      }
    >
      <DataTable>
        <DataTableHeader columns={['Judul', 'Task', 'Kendala', 'Status']} />
        <DataTableBody isLoading={isLoading} isEmpty={filteredTasks.length === 0} colSpan={5} emptyIcon="⚠️" emptyMessage="Tidak ada data kendala atau revisi.">
          {filteredTasks.map(task => (
            <HoverRow
              key={task.id}
              onClick={() => { if (task.id) { setSelectedTaskId(task.id); setRightPanelVisible(true); } }}
            >
              <td style={tableStyles.tdTitle}>{task.naskah_title || '-'}</td>
              <td style={tableStyles.td}>{task.step_name}</td>
              <td style={{ ...tableStyles.td, color: '#ef4444' }}>{task.notes || 'Menunggu Revisi'}</td>
              <td style={tableStyles.td}>
                <Badge label={task.status} variant={getStatusVariant(task.status)} />
              </td>
              <td style={tableStyles.tdAction}>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                  style={tableStyles.actionButton}
                  title="Detail"
                >
                  ✏️
                </button>
              </td>
            </HoverRow>
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

export default ProduksiKendala;
