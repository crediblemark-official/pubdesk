import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Task } from '../../types/workflow.types';
import { useUniqueValues } from '../../hooks/useUniqueValues';

// Assuming Legalitas structure has status
interface Legalitas {
  id: number;
  naskah_id: number;
  naskah_title?: string;
  legal_type: string;
  status: string;
}

const LaporanOperasional: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [legalitasList, setLegalitasList] = useState<Legalitas[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [periode, setPeriode] = useState('Bulan Ini');
  const [filterPic, setFilterPic] = useState('');
  const [filterPenerbit, setFilterPenerbit] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [taskData, legalitasData] = await Promise.all([
        invoke<Task[]>('get_tasks'),
        invoke<Legalitas[]>('get_legalitas').catch(() => []) // gracefully fallback if not fully implemented
      ]);
      setTasks(taskData);
      setLegalitasList(legalitasData);
    } catch (err) {
      console.error('Error fetching laporan data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isOverdue = (task: Task) => {
    if (task.status === 'Selesai') return false;
    if (!task.due_date) return false;
    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
  };

  // Metrics Calculation
  const filteredTasks = tasks.filter(t => {
    if (filterPic && t.pic_name !== filterPic) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    return true;
  });

  const activeTasks = filteredTasks.filter(t => t.status !== 'Selesai' && t.status !== 'Batal');
  const finishedTasks = filteredTasks.filter(t => t.status === 'Selesai');
  const overdueTasks = filteredTasks.filter(isOverdue);
  const prosesLegalitas = legalitasList.filter(l => l.status === 'Diajukan' || l.status === 'Revisi' || l.status === 'Proses');

  // Beban Kerja Tim
  const bebanKerja: Record<string, number> = {};
  activeTasks.forEach(t => {
    const pic = t.pic_name || 'Tanpa PIC';
    bebanKerja[pic] = (bebanKerja[pic] || 0) + 1;
  });
  const bebanKerjaArr = Object.entries(bebanKerja).sort((a, b) => b[1] - a[1]);

  const uniquePics = useUniqueValues(tasks, 'pic_name');
  const uniqueStatuses = useUniqueValues(tasks, 'status');

  const handleExport = () => {
    // Simulasi ekspor
    alert("Mengekspor data ke Excel... (Fitur segera hadir)");
  };

  return (
    <div className="module-content" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '28px', fontWeight: '700' }}>Laporan Operasional</h2>
        <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '15px' }}>
          Dasbor analitik untuk metrik produksi, kinerja tim, dan legalitas.
        </p>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center', background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <select value={periode} onChange={e => setPeriode(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-primary)' }}>
          <option value="Semua">Semua Waktu</option>
          <option value="Bulan Ini">Bulan Ini</option>
          <option value="Tahun Ini">Tahun Ini</option>
        </select>
        <select value={filterPic} onChange={e => setFilterPic(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-primary)' }}>
          <option value="">[Semua PIC]</option>
          {uniquePics.map(pic => <option key={pic as string} value={pic as string}>{pic}</option>)}
        </select>
        <select value={filterPenerbit} onChange={e => setFilterPenerbit(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-primary)' }}>
          <option value="">[Semua Penerbit]</option>
          <option value="penerbit_a">Penerbit A</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-primary)' }}>
          <option value="">[Semua Status]</option>
          {uniqueStatuses.map(s => <option key={s as string} value={s as string}>{s}</option>)}
        </select>
        
        <div style={{ flex: 1 }}></div>
        <button onClick={handleExport} style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
          📥 Export Excel
        </button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat laporan...</div>
        ) : (
          <>
            {/* Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderTop: '4px solid #3b82f6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Naskah Aktif</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{activeTasks.length}</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderTop: '4px solid #22c55e', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Tugas Selesai</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{finishedTasks.length}</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderTop: '4px solid #ef4444', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Tugas Overdue</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{overdueTasks.length}</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderTop: '4px solid #a855f7', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Legalitas Diproses</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{prosesLegalitas.length}</div>
          </div>
        </div>

        {/* Beban Kerja Tim */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-primary)' }}>Beban Kerja Tim (Tugas Aktif)</h3>
          {bebanKerjaArr.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Tidak ada beban kerja saat ini.</div>
          ) : (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {bebanKerjaArr.map(([pic, count]) => (
                <div key={pic} style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-panel)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)', marginRight: '8px' }}>{pic}:</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{count} tugas</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task Terlambat */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>Task Terlambat (Overdue)</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>Judul Naskah</th>
                <th style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>Tahap</th>
                <th style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>PIC</th>
                <th style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>Deadline</th>
              </tr>
            </thead>
            <tbody>
              {overdueTasks.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Hebat! Tidak ada tugas yang terlambat.</td>
                </tr>
              ) : (
                overdueTasks.map(task => (
                  <tr key={task.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 20px', fontWeight: '500', color: 'var(--text-primary)' }}>{task.naskah_title || `Naskah #${task.naskah_id}`}</td>
                    <td style={{ padding: '12px 20px', color: 'var(--text-primary)' }}>{task.step_name}</td>
                    <td style={{ padding: '12px 20px', color: 'var(--text-primary)' }}>{task.pic_name || '-'}</td>
                    <td style={{ padding: '12px 20px', color: '#ef4444', fontWeight: '600' }}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default LaporanOperasional;
