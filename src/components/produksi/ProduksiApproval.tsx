import React, { useState, useMemo } from 'react';
import { Task } from '../../types/workflow.types';
import UpdateStatusModal from './UpdateStatusModal';
import { useWorkflowContext } from '../../contexts/WorkflowContext';
import { useAppContext } from '../../contexts/AppContext';
import { Badge, getStatusVariant } from '../../ui/atoms/Badge';
import { Button } from '../../ui/atoms/Button';
import { FilterBar, FilterGroup, FilterChip, FilterDivider } from '../../ui/molecules/FilterBar';
import { DataTablePage, DataTable, DataTableHeader, DataTableBody, HoverRow, tableStyles } from '../../ui/molecules/DataTable';
import { useUniqueValues } from '../../hooks/useUniqueValues';

const ProduksiApproval: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const { tasks, isLoading, setSelectedTaskId } = useWorkflowContext();
  const { setRightPanelVisible } = useAppContext();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterJenis, setFilterJenis] = useState('');
  const [filterPic, setFilterPic] = useState('');

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(t => t.status === 'Menunggu Approval');
    if (searchQuery) {
      filtered = filtered.filter(t => (t.naskah_title || '').toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (filterPic) filtered = filtered.filter(t => t.pic_name === filterPic);
    if (filterJenis) filtered = filtered.filter(t => t.step_name === filterJenis);
    return filtered;
  }, [tasks, searchQuery, filterPic, filterJenis]);

  const uniquePics = useUniqueValues(tasks, 'pic_name');
  const uniqueJenis = useUniqueValues(tasks, 'step_name');

  return (
    <DataTablePage
      filterBar={
        <FilterBar>
          <FilterGroup label="Jenis Approval:">
            <FilterChip label="Semua" active={filterJenis === ''} onClick={() => setFilterJenis('')} />
            {uniqueJenis.map(jenis => (
              <FilterChip key={jenis as string} label={jenis as string} active={filterJenis === jenis} onClick={() => setFilterJenis(jenis as string)} />
            ))}
          </FilterGroup>

          <FilterDivider />

          <FilterGroup label="PIC:">
            <FilterChip label="Semua" active={filterPic === ''} onClick={() => setFilterPic('')} />
            {uniquePics.map(pic => (
              <FilterChip key={pic as string} label={pic as string} active={filterPic === pic} onClick={() => setFilterPic(pic as string)} />
            ))}
          </FilterGroup>
        </FilterBar>
      }
    >
      <DataTable>
        <DataTableHeader columns={['Judul', 'Approval', 'Diminta Oleh', 'Status']} />
        <DataTableBody isLoading={isLoading} isEmpty={filteredTasks.length === 0} colSpan={5} emptyIcon="✅" emptyMessage="Tidak ada data yang butuh approval.">
          {filteredTasks.map(task => (
            <HoverRow
              key={task.id}
              onClick={() => { if (task.id) { setSelectedTaskId(task.id); setRightPanelVisible(true); } }}
            >
              <td style={tableStyles.tdTitle}>{task.naskah_title || '-'}</td>
              <td style={tableStyles.td}>{task.step_name}</td>
              <td style={tableStyles.td}>{task.pic_name || '-'}</td>
              <td style={tableStyles.td}>
                <Badge label={task.status} variant={getStatusVariant(task.status)} />
              </td>
              <td style={tableStyles.tdAction}>
                <Button
                  onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                  variant="primary"
                  size="sm"
                >
                  Review
                </Button>
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

export default ProduksiApproval;
