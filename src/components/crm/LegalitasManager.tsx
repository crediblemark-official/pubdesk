import React, { useState, useMemo } from 'react';
import { useCrmContext } from '../../contexts/CrmContext';
import { useAppContext } from '../../contexts/AppContext';
import { Legalitas } from '../../types/crm.types';
import { Button } from '../../ui/atoms/Button';
import { Badge } from '../../ui/atoms/Badge';
import LegalitasForm from './LegalitasForm';

const TableEmptyState = ({
  colSpan,
  icon,
  message,
  description
}: {
  colSpan: number;
  icon: string;
  message: string;
  description: string;
}) => (
  <tr>
    <td colSpan={colSpan} style={{ padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>{icon}</div>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--text-primary)', fontWeight: '600' }}>{message}</h3>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.5' }}>
        {description}
      </p>
    </td>
  </tr>
);

interface LegalitasManagerProps {
  searchQuery?: string;
}

const TIPE_LEGALITAS = ['E-ISBN', 'ISBN', 'QRCBN', 'QRSBN', 'HAKI'];

const LegalitasManager: React.FC<LegalitasManagerProps> = ({ searchQuery = '' }) => {
  const { legalitas, addLegalitas, updateLegalitas, deleteLegalitas } = useCrmContext();
  const { showConfirm, showToast, setRightPanelVisible, selectedLegalitasId, setSelectedLegalitasId } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [currentLegalitas, setCurrentLegalitas] = useState<Legalitas | null>(null);

  const [activeTipe, setActiveTipe] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('');

  const statuses = useMemo(() => {
    const set = new Set(legalitas.map((l) => l.status).filter(Boolean));
    return Array.from(set).sort();
  }, [legalitas]);

  const toggleTipe = (tipe: string) => {
    setActiveTipe((prev) =>
      prev.includes(tipe) ? prev.filter((t) => t !== tipe) : [...prev, tipe]
    );
  };

  const filteredData = useMemo(() => {
    return legalitas.filter((l) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        l.judul_buku.toLowerCase().includes(q) ||
        l.nama_penulis.toLowerCase().includes(q);

      const matchTipe = activeTipe.length === 0 || activeTipe.includes(l.tipe);
      const matchStatus = statusFilter ? l.status === statusFilter : true;
      return matchSearch && matchTipe && matchStatus;
    });
  }, [legalitas, searchQuery, activeTipe, statusFilter]);

  const tipeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    TIPE_LEGALITAS.forEach((t) => { counts[t] = 0; });
    legalitas.forEach((l) => { if (counts[l.tipe] !== undefined) counts[l.tipe]++; });
    return counts;
  }, [legalitas]);

  const handleAddNew = () => {
    setCurrentLegalitas(null);
    setIsEditing(true);
  };

  const handleEdit = (l: Legalitas, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentLegalitas(l);
    setIsEditing(true);
  };

  const handleRowClick = (id?: number) => {
    if (id) {
      setSelectedLegalitasId(id);
    }
  };

  const handleRowDoubleClick = (id?: number) => {
    if (id) {
      setSelectedLegalitasId(id);
      setRightPanelVisible(true);
    }
  };

  const handleDelete = (id: number, judul: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm({
      title: 'Hapus Legalitas',
      message: `Apakah Anda yakin ingin menghapus data legalitas untuk buku "${judul}"?`,
      confirmText: 'Hapus',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteLegalitas(id);
          showToast('Data legalitas berhasil dihapus', 'success');
          if (selectedLegalitasId === id) {
             setSelectedLegalitasId(null);
          }
        } catch (err) {
          showToast('Gagal menghapus data legalitas', 'error');
        }
      }
    });
  };

  const handleFormSubmit = async (data: Omit<Legalitas, 'created_at' | 'id'> & { id?: number }) => {
    try {
      if (data.id) {
        await updateLegalitas(data as Legalitas);
        showToast('Data legalitas berhasil diperbarui', 'success');
      } else {
        await addLegalitas(data);
        showToast('Data legalitas berhasil ditambahkan', 'success');
      }
      setIsEditing(false);
    } catch (err) {
      showToast('Gagal menyimpan data legalitas', 'error');
    }
  };

  const formatTanggal = (iso: string) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  if (isEditing) {
    return (
      <LegalitasForm
        initialData={currentLegalitas}
        onSubmit={handleFormSubmit}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const hasActiveFilter = activeTipe.length > 0 || statusFilter !== '' || searchQuery !== '';

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Database Legalitas Buku
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
            Kelola pengajuan ISBN, QRCBN, HAKI, dan legalitas lainnya.
          </p>
        </div>
        <Button variant="primary" onClick={handleAddNew}>
          + Tambah Pengajuan
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {TIPE_LEGALITAS.map((t) => (
          <button
            key={t}
            onClick={() => toggleTipe(t)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              border: activeTipe.includes(t) ? '1px solid transparent' : '1px solid var(--border)',
              background: activeTipe.includes(t) ? 'var(--button-primary)' : 'var(--bg-panel)',
              color: activeTipe.includes(t) ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {t}
            <span style={{
              background: activeTipe.includes(t) ? 'rgba(255,255,255,0.2)' : 'var(--bg-surface)',
              color: activeTipe.includes(t) ? '#fff' : 'var(--text-primary)',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '10px'
            }}>
              {tipeCounts[t] || 0}
            </span>
          </button>
        ))}

        <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }} />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            border: '1px solid var(--border)',
            background: 'var(--bg-panel)',
            color: 'var(--text-primary)',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="">Semua Status</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
              <tr style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '8px 12px', fontWeight: '600', width: '5%', userSelect: 'none' }}>No.</th>
                <th style={{ padding: '8px 12px', fontWeight: '600', width: '30%', userSelect: 'none' }}>Judul Buku</th>
                <th style={{ padding: '8px 12px', fontWeight: '600', width: '15%', userSelect: 'none' }}>Penulis</th>
                <th style={{ padding: '8px 12px', fontWeight: '600', width: '10%', userSelect: 'none' }}>Tipe</th>
                <th style={{ padding: '8px 12px', fontWeight: '600', width: '15%', userSelect: 'none' }}>Tgl Pengajuan</th>
                <th style={{ padding: '8px 12px', fontWeight: '600', width: '15%', userSelect: 'none' }}>Status</th>
                <th style={{ padding: '8px 12px', fontWeight: '600', width: '10%', textAlign: 'center', userSelect: 'none' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <TableEmptyState
                  colSpan={7}
                  icon="⚖️"
                  message="Tidak ada data legalitas"
                  description={hasActiveFilter ? 'Tidak ada hasil untuk filter yang dipilih.' : 'Belum ada pengajuan legalitas terdaftar. Klik Tambah Pengajuan untuk memulai.'}
                />
              ) : (
                filteredData.map((l, index) => (
                  <tr
                    key={l.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: selectedLegalitasId === l.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.1s ease',
                      color: 'var(--text-primary)'
                    }}
                    onClick={() => handleRowClick(l.id)}
                    onDoubleClick={() => handleRowDoubleClick(l.id)}
                    onMouseEnter={(e) => {
                      if (selectedLegalitasId !== l.id) e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedLegalitasId !== l.id) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: '600' }}>
                      <div style={{ wordBreak: 'break-word' }}>{l.judul_buku}</div>
                      {l.keterangan && (
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '400', marginTop: '2px', fontStyle: 'italic' }}>
                          {l.keterangan}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px' }}>
                      {l.nama_penulis}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: 'rgba(99,102,241,0.1)',
                        color: '#818cf8'
                      }}>
                        {l.tipe}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      📅 {formatTanggal(l.tanggal_pengajuan || '')}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge
                        label={l.status}
                        variant={l.status === 'Selesai' ? 'success' : l.status === 'Ditolak' ? 'danger' : 'neutral'}
                      />
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <Button variant="secondary" size="sm" onClick={(e) => handleEdit(l, e)}>
                          ✏️
                        </Button>
                        <Button variant="danger" size="sm" onClick={(e) => l.id && handleDelete(l.id, l.judul_buku, e)}>
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LegalitasManager;
