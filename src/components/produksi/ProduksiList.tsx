import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Task } from '../../types/workflow.types';
import TaskModal from './TaskModal';

const ProduksiList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  
  // Filters
  const [filterPic, setFilterPic] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDeadline, setFilterDeadline] = useState('');

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await invoke<Task[]>('get_tasks');
      setTasks(data || []);
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
      default: return { bg: '#f1f5f9', text: '#475569' }; // Belum Mulai
    }
  };

  const uniquePics = Array.from(new Set(tasks.map(t => t.pic_name).filter(Boolean)));
  const uniqueStatus = Array.from(new Set(tasks.map(t => t.status).filter(Boolean)));

  return (
    <div className="module-content" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '28px', fontWeight: '700' }}>Produksi Naskah &gt; Daftar Tugas</h2>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', minWidth: '200px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
          <input type="text" placeholder="Cari..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
        </div>
        <select value={filterPic} onChange={e => setFilterPic(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <option value="">[PIC]</option>
          {uniquePics.map(pic => <option key={pic as string} value={pic as string}>{pic}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <option value="">[Status]</option>
          {uniqueStatus.map(status => <option key={status as string} value={status as string}>{status}</option>)}
        </select>
        <select value={filterDeadline} onChange={e => setFilterDeadline(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <option value="">[Deadline]</option>
        </select>
        <div style={{ flex: 1 }}></div>
        <button 
          onClick={() => { setSelectedTask(undefined); setIsModalOpen(true); }}
          style={{ padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
        >
          + Task
        </button>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '70px 85px 2fr 1fr 1fr 100px 100px 100px 120px 80px', gap: '12px', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '13px', overflowX: 'auto' }}>
          <div>ID Task</div>
          <div>ID Naskah</div>
          <div>Judul</div>
          <div>Tahap</div>
          <div>PIC</div>
          <div>Mulai</div>
          <div>Deadline</div>
          <div>Selesai</div>
          <div>Status</div>
          <div style={{ textAlign: 'right' }}>Aksi</div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat...</div>
          ) : filteredTasks.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Tidak ada data tugas.</div>
          ) : (
            filteredTasks.map(task => {
              const statusStyle = getStatusColor(task.status);
              const formatDate = (dateStr?: string) => {
                if (!dateStr) return '-';
                try {
                  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                } catch {
                  return '-';
                }
              };
              return (
                <div key={task.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '70px 85px 2fr 1fr 1fr 100px 100px 100px 120px 80px', gap: '12px', alignItems: 'center', fontSize: '13px', color: 'var(--text-primary)', overflowX: 'auto' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>#{task.id}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>#{task.naskah_id}</div>
                  <div style={{ fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={task.naskah_title || ''}>
                    {task.naskah_title || '-'}
                  </div>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.step_name}</div>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.pic_name || '-'}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{formatDate(task.start_date)}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{formatDate(task.due_date)}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{formatDate(task.completed_date)}</div>
                  <div>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', background: statusStyle.bg, color: statusStyle.text, fontSize: '11px', fontWeight: '600', display: 'inline-block', textAlign: 'center', width: '100%' }}>
                      {task.status}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
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

      {isModalOpen && (
        <TaskModal 
          task={selectedTask}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
};

export default ProduksiList;
