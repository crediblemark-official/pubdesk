import React, { useState, useMemo } from 'react';
import { useCrmContext } from '../../contexts/CrmContext';
import { useAppContext } from '../../contexts/AppContext';
import { NaskahOrder } from '../../types/crm.types';
import NaskahOrderForm from './NaskahOrderForm';
import { TableEmptyState } from '../../ui/molecules/EmptyState';
import { Button } from '../../ui/atoms/Button';
import { Badge } from '../../ui/atoms/Badge';

const statusVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent'> = {
  'Belum Dimulai': 'neutral',
  'Sedang Dikerjakan': 'warning',
  'Selesai': 'success',
  'Batal': 'danger'
};

const NaskahOrdersManager: React.FC = () => {
  const { naskahOrders, penulis, penerbit, layouters, addNaskahOrder, updateNaskahOrder, deleteNaskahOrder } = useCrmContext();
  const { showConfirm, showToast, setSelectedNaskahId } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<NaskahOrder | null>(null);

  // State filter & search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');

  // Daftar genre unik dari data yang ada
  const genres = useMemo(() => {
    const set = new Set(naskahOrders.map((o) => o.genre).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [naskahOrders]);

  // Dapatkan nama Penulis berdasarkan ID
  const getPenulisName = (id?: number) => {
    if (!id) return '-';
    const found = penulis.find((p) => p.id === id);
    return found ? found.name : `Penulis #${id}`;
  };

  // Dapatkan nama Penerbit berdasarkan ID
  const getPenerbitName = (id?: number) => {
    if (!id) return '-';
    const found = penerbit.find((p) => p.id === id);
    return found ? found.name : `Penerbit #${id}`;
  };

  // Dapatkan nama tim yang ditugaskan
  const getTeamNames = (assigned?: string): string => {
    if (!assigned) return '-';
    try {
      const ids: number[] = JSON.parse(assigned);
      const names = ids
        .map((id) => layouters.find((l) => l.id === id)?.name)
        .filter(Boolean) as string[];
      return names.length > 0 ? names.join(', ') : '-';
    } catch {
      return '-';
    }
  };

  // Filter naskah
  const filteredOrders = useMemo(() => {
    return naskahOrders.filter((o) => {
      const writerName = getPenulisName(o.penulis_id).toLowerCase();
      const pubName = getPenerbitName(o.penerbit_id).toLowerCase();
      const matchesSearch =
        o.title.toLowerCase().includes(search.toLowerCase()) ||
        (o.naskah_id_code && o.naskah_id_code.toLowerCase().includes(search.toLowerCase())) ||
        writerName.includes(search.toLowerCase()) ||
        pubName.includes(search.toLowerCase()) ||
        (o.genre && o.genre.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter ? o.status === statusFilter : true;
      const matchesGenre = genreFilter ? o.genre === genreFilter : true;
      return matchesSearch && matchesStatus && matchesGenre;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naskahOrders, search, statusFilter, genreFilter, penulis, penerbit]);

  const handleAddNew = () => {
    setCurrentOrder(null);
    setIsEditing(true);
  };

  const handleEdit = (order: NaskahOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentOrder(order);
    setIsEditing(true);
  };

  const handleRowClick = (id?: number) => {
    if (id) setSelectedNaskahId(id);
  };

  const handleDelete = (id: number, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm({
      title: 'Hapus Naskah',
      message: `Apakah Anda yakin ingin menghapus naskah "${title}"?`,
      confirmText: 'Hapus',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteNaskahOrder(id);
          showToast('Data naskah berhasil dihapus!', 'success');
        } catch (err) {
          console.error(err);
          showToast('Gagal menghapus naskah!', 'error');
        }
      }
    });
  };

  const handleFormSubmit = async (data: Omit<NaskahOrder, 'created_at' | 'id'> & { id?: number }) => {
    try {
      if (data.id) {
        const original = naskahOrders.find((o) => o.id === data.id);
        if (original) {
          await updateNaskahOrder({
            ...original,
            ...data,
          } as NaskahOrder);
          showToast('Data naskah berhasil diperbarui!', 'success');
        }
      } else {
        await addNaskahOrder(data as Omit<NaskahOrder, 'status' | 'created_at'>);
        showToast('Naskah baru berhasil ditambahkan!', 'success');
      }
      setIsEditing(false);
      setCurrentOrder(null);
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan data naskah!', 'error');
    }
  };

  if (isEditing) {
    return (
      <NaskahOrderForm
        initialData={currentOrder}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setIsEditing(false);
          setCurrentOrder(null);
        }}
      />
    );
  }

  // Statistik database naskah
  const totalSelesai = naskahOrders.filter((o) => o.status === 'Selesai').length;
  const totalDikerjakan = naskahOrders.filter((o) => o.status === 'Sedang Dikerjakan').length;

  return (
    <div className="customer-list-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-dark)' }}>

      {/* Header statistik */}
      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '10px 16px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        fontSize: '12px',
        flexWrap: 'wrap'
      }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          Total Naskah: <strong style={{ color: 'var(--text-primary)' }}>{naskahOrders.length}</strong>
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>
          Sedang Dikerjakan: <strong style={{ color: '#f59e0b' }}>{totalDikerjakan}</strong>
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>
          Selesai: <strong style={{ color: '#22c55e' }}>{totalSelesai}</strong>
        </span>
      </div>

      {/* Baris Filter & Tambah */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-panel)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Input Pencarian */}
          <div style={{ position: 'relative', width: '220px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '14px' }}>🔍</span>
            <input
              type="text"
              placeholder="Cari judul, penulis, genre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px 6px 36px',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                fontSize: '12px',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          {/* Filter Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              fontSize: '12px',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Semua Status</option>
            <option value="Belum Dimulai">Belum Dimulai</option>
            <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
            <option value="Selesai">Selesai</option>
            <option value="Batal">Batal</option>
          </select>

          {/* Filter Genre */}
          {genres.length > 0 && (
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              style={{
                padding: '6px 12px',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                fontSize: '12px',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Semua Genre</option>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          )}
        </div>

        {/* Tombol Tambah */}
        <Button onClick={handleAddNew} variant="primary" size="sm" icon="➕">
          Tambah Naskah
        </Button>
      </div>

      {/* Tabel Data */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', background: 'var(--bg-card)' }}>
        <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '28%', userSelect: 'none' }}>Judul &amp; Identitas</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '18%', userSelect: 'none' }}>Penulis &amp; Penerbit</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '13%', userSelect: 'none' }}>Genre</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '18%', userSelect: 'none' }}>Tim Ditugaskan</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '10%', userSelect: 'none' }}>Status</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '13%', textAlign: 'center', userSelect: 'none' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <TableEmptyState
                colSpan={6}
                icon="📚"
                message="Tidak ada data naskah"
                description={search || statusFilter || genreFilter ? `Tidak ada hasil untuk filter yang dipilih` : 'Belum ada naskah terdaftar. Klik Tambah Naskah untuk menambahkan.'}
              />
            ) : (
              filteredOrders.map((o) => (
                <tr
                  key={o.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.1s ease',
                    color: 'var(--text-primary)'
                  }}
                  onClick={() => handleRowClick(o.id)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>
                    <div style={{ fontWeight: '600' }}>{o.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {o.naskah_id_code && <span>ID: {o.naskah_id_code}</span>}
                      {o.total_pages && <span style={{ marginLeft: '8px' }}>· {o.total_pages} hlm</span>}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                    <div>👤 {getPenulisName(o.penulis_id)}</div>
                    <div style={{ fontSize: '11px', marginTop: '2px' }}>🏢 {getPenerbitName(o.penerbit_id)}</div>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                    {o.genre ? (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: 'rgba(6, 182, 212, 0.1)',
                        color: '#22d3ee'
                      }}>
                        {o.genre}
                      </span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {getTeamNames(o.assigned_team_ids)}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <Badge
                      label={o.status}
                      variant={statusVariantMap[o.status] || 'neutral'}
                    />
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => handleEdit(o, e)}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => o.id && handleDelete(o.id, o.title, e)}
                      >
                        🗑️ Hapus
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
  );
};

export default NaskahOrdersManager;
