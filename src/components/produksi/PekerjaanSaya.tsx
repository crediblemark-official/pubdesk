import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Task } from '../../types/workflow.types';
import UpdateStatusModal from './UpdateStatusModal';

const PekerjaanSaya: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'Semua' | 'Hari Ini' | 'Terlambat' | 'Revisi' | 'Approval' | 'Selesai'>('Semua');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await invoke<Task[]>('get_tasks');
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Proses': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' };
      case 'Belum Mulai': return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' };
      case 'Selesai': return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' };
      case 'Terlambat': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' };
      case 'Menunggu Revisi': return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' };
      case 'Menunggu Approval': return { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7' };
      default: return { bg: 'var(--bg-panel)', text: 'var(--text-secondary)' };
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isOverdue = (task: Task) => {
    if (task.status === 'Selesai') return false;
    if (!task.due_date) return false;
    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
  };

  const isDeadlineDekat = (task: Task) => {
    if (task.status === 'Selesai') return false;
    if (!task.due_date) return false;
    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
    const completed = new Date(task.completed_date);
    const diffTime = today.getTime() - completed.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'Semua') return true;
    if (filter === 'Selesai') return t.status === 'Selesai';
    if (filter === 'Revisi') return t.status === 'Menunggu Revisi';
    if (filter === 'Approval') return t.status === 'Menunggu Approval';
    if (filter === 'Terlambat') return isOverdue(t) || t.status === 'Terlambat';
    if (filter === 'Hari Ini') return isHariIni(t);
    return true;
  });

  return (
    <div className="module-content" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '28px', fontWeight: '700' }}>Pekerjaan Saya</h2>
        <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '15px' }}>
          Kelola dan update status tugas yang ditugaskan kepada Anda.
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Aktif', count: tasks.filter(t => t.status === 'Proses' || t.status === 'Belum Mulai').length, color: '#3b82f6' },
          { label: 'Deadline Dekat', count: tasks.filter(isDeadlineDekat).length, color: '#f59e0b' },
          { label: 'Terlambat', count: tasks.filter(t => isOverdue(t) || t.status === 'Terlambat').length, color: '#ef4444' },
          { label: 'Menunggu Revisi', count: tasks.filter(t => t.status === 'Menunggu Revisi').length, color: '#f97316' },
          { label: 'Menunggu Approval', count: tasks.filter(t => t.status === 'Menunggu Approval').length, color: '#a855f7' },
          { label: 'Selesai Minggu Ini', count: tasks.filter(isSelesaiMingguIni).length, color: '#22c55e' }
        ].map((stat, i) => (
          <div key={i} style={{ 
            background: 'var(--bg-card)', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid var(--border)',
            borderLeft: `4px solid ${stat.color}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>{stat.count}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        {(['Semua', 'Hari Ini', 'Terlambat', 'Revisi', 'Approval', 'Selesai'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: filter === f ? 'none' : '1px solid var(--border)',
              background: filter === f ? 'var(--accent)' : 'var(--bg-card)',
              color: filter === f ? '#fff' : 'var(--text-secondary)',
              fontWeight: filter === f ? '600' : '500',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1fr 100px', gap: '16px', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '13px' }}>
          <div>Judul Naskah</div>
          <div>Tahap</div>
          <div>Deadline</div>
          <div>Status</div>
          <div>Prioritas</div>
          <div style={{ textAlign: 'right' }}>Aksi</div>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data...</div>
          ) : filteredTasks.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Tidak ada tugas yang sesuai filter.</div>
          ) : (
            filteredTasks.map(task => {
              const statusStyle = getStatusColor(task.status);
              return (
                <div key={task.id} style={{ 
                  borderBottom: '1px solid var(--border)', 
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-panel)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Baris Utama */}
                  <div style={{ 
                    padding: '16px 20px', 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1fr 100px', 
                    gap: '16px', 
                    alignItems: 'center',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    cursor: 'default'
                  }}>
                    <div style={{ fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.naskah_title || `Naskah #${task.naskah_id}`}
                    </div>
                    <div>{task.step_name}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString('id-ID') : '-'}
                      {isOverdue(task) && <span style={{ color: '#ef4444', marginLeft: '6px', fontSize: '12px' }}>⚠️</span>}
                    </div>
                    <div>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        background: statusStyle.bg, 
                        color: statusStyle.text,
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {task.status}
                      </span>
                    </div>
                    <div>
                      <span style={{ 
                        fontSize: '12px', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        border: '1px solid var(--border)',
                        color: task.priority === 'Tinggi' || task.priority === 'Urgent' ? '#ef4444' : 'var(--text-secondary)'
                      }}>
                        {task.priority || 'Normal'}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <button 
                        style={{ 
                          padding: '6px 12px', 
                          background: 'transparent', 
                          border: '1px solid var(--border)', 
                          borderRadius: '6px', 
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent)';
                          e.currentTarget.style.color = 'var(--accent)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onClick={() => setSelectedTask(task)}
                      >
                        {task.status === 'Belum Mulai' ? 'Mulai' : 'Update'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Detail Tugas (Catatan & Bukti) */}
                  {(task.notes || task.proof_path_or_link) && (
                    <div style={{ padding: '0 20px 16px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {task.notes && (
                          <div><strong style={{ color: 'var(--text-primary)' }}>Catatan:</strong> {task.notes}</div>
                        )}
                        {task.proof_path_or_link && (
                          <div><strong style={{ color: 'var(--text-primary)' }}>Bukti/File:</strong> <a href={task.proof_path_or_link} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{task.proof_path_or_link}</a></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Update Status */}
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

export default PekerjaanSaya;
