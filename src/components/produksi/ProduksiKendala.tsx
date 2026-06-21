import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Task } from '../../types/workflow.types';
import UpdateStatusModal from './UpdateStatusModal';

const ProduksiKendala: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKendala, setFilterKendala] = useState('');
  const [filterPic, setFilterPic] = useState('');

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await invoke<Task[]>('get_tasks');
      // Only keep tasks that are 'Menunggu Revisi' or have notes
      setTasks(data?.filter(t => t.status === 'Menunggu Revisi' || t.notes) || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(t => {
    if (searchTerm && !(t.naskah_title || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterPic && t.pic_name !== filterPic) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selesai': return { bg: '#dcfce7', text: '#166534' };
      case 'Proses': return { bg: '#dbeafe', text: '#1e40af' };
      case 'Menunggu Revisi': return { bg: '#fef3c7', text: '#92400e' };
      case 'Menunggu Approval': return { bg: '#ede9fe', text: '#5b21b6' };
      case 'Terlambat': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const uniquePics = Array.from(new Set(tasks.map(t => t.pic_name).filter(Boolean)));
  const uniqueStatus = Array.from(new Set(tasks.map(t => t.status).filter(Boolean)));

  return (
    <div className="module-content" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '28px', fontWeight: '700' }}>Produksi Naskah &gt; Revisi dan Kendala</h2>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <option value="">[Status]</option>
          {uniqueStatus.map(status => <option key={status as string} value={status as string}>{status}</option>)}
        </select>
        <select value={filterKendala} onChange={e => setFilterKendala(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <option value="">[Jenis Kendala]</option>
          <option value="revisi">Revisi</option>
          <option value="surat">Kendala Surat</option>
        </select>
        <select value={filterPic} onChange={e => setFilterPic(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <option value="">[PIC]</option>
          {uniquePics.map(pic => <option key={pic as string} value={pic as string}>{pic}</option>)}
        </select>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
          <input type="text" placeholder="Cari naskah..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 100px', gap: '16px', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '13px' }}>
          <div>Judul</div>
          <div>Task</div>
          <div>Kendala</div>
          <div>Status</div>
          <div style={{ textAlign: 'right' }}>Aksi</div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat...</div>
          ) : filteredTasks.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Tidak ada data kendala atau revisi.</div>
          ) : (
            filteredTasks.map(task => {
              const statusStyle = getStatusColor(task.status);
              return (
                <div key={task.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 100px', gap: '16px', alignItems: 'center', fontSize: '14px', color: 'var(--text-primary)' }}>
                  <div style={{ fontWeight: '500' }}>{task.naskah_title || '-'}</div>
                  <div>{task.step_name}</div>
                  <div style={{ color: '#ef4444' }}>{task.notes || 'Menunggu Revisi'}</div>
                  <div>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', background: statusStyle.bg, color: statusStyle.text, fontSize: '11px', fontWeight: '600' }}>{task.status}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => setSelectedTask(task)}
                      style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Detail
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedTask && (
        <UpdateStatusModal 
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSuccess={() => {
            setSelectedTask(null);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
};

export default ProduksiKendala;
