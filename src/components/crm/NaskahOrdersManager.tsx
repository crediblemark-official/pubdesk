import React, { useState, useMemo } from 'react';
import { useCrmContext } from '../../contexts/CrmContext';
import { useAppContext } from '../../contexts/AppContext';
import { NaskahOrder } from '../../types/crm.types';
import NaskahOrderForm from './NaskahOrderForm';
import { TableEmptyState } from '../../ui/molecules/EmptyState';
import { Button } from '../../ui/atoms/Button';
import { Badge } from '../../ui/atoms/Badge';

interface NaskahOrdersManagerProps {
  searchQuery?: string;
}

const statusVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent'> = {
  'Belum Dimulai': 'neutral',
  'Sedang Dikerjakan': 'warning',
  'Selesai': 'success',
  'Batal': 'danger'
};

const STATUS_LIST = ['Belum Dimulai', 'Sedang Dikerjakan', 'Selesai', 'Batal'];

const NaskahOrdersManager: React.FC<NaskahOrdersManagerProps> = ({ searchQuery = '' }) => {
  const { naskahOrders, penulis, penerbit, addNaskahOrder, updateNaskahOrder, deleteNaskahOrder } = useCrmContext();
  const { showConfirm, showToast, setSelectedNaskahId } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<NaskahOrder | null>(null);

  // Filter badge state (bisa multi-pilih status)
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);
  const [genreFilter, setGenreFilter] = useState('');

  // Daftar genre unik dari data yang ada
  const genres = useMemo(() => {
    const set = new Set(naskahOrders.map((o) => o.genre).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [naskahOrders]);

  const getPenulisName = (id?: number) => {
    if (!id) return '-';
    const found = penulis.find((p) => p.id === id);
    return found ? found.name : `Penulis #${id}`;
  };

  const getPenerbitName = (id?: number) => {
    if (!id) return '-';
    const found = penerbit.find((p) => p.id === id);
    return found ? found.name : `Penerbit #${id}`;
  };

  // Toggle status badge filter
  const toggleStatus = (status: string) => {
    setActiveStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  // Filter naskah
  const filteredOrders = useMemo(() => {
    return naskahOrders.filter((o) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        o.title.toLowerCase().includes(q) ||
        (o.naskah_id_code && o.naskah_id_code.toLowerCase().includes(q)) ||
        getPenulisName(o.penulis_id).toLowerCase().includes(q) ||
        getPenerbitName(o.penerbit_id).toLowerCase().includes(q) ||
        (o.genre && o.genre.toLowerCase().includes(q));
      const matchStatus = activeStatuses.length === 0 || activeStatuses.includes(o.status);
      const matchGenre = genreFilter ? o.genre === genreFilter : true;
      return matchSearch && matchStatus && matchGenre;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naskahOrders, searchQuery, activeStatuses, genreFilter, penulis, penerbit]);

  // Hitung per-status untuk badge info
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STATUS_LIST.forEach((s) => { counts[s] = 0; });
    naskahOrders.forEach((o) => { if (counts[o.status] !== undefined) counts[o.status]++; });
    return counts;
  }, [naskahOrders]);

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
          await updateNaskahOrder({ ...original, ...data } as NaskahOrder);
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
        onCancel={() => { setIsEditing(false); setCurrentOrder(null); }}
      />
    );
  }

  const hasActiveFilter = activeStatuses.length > 0 || !!genreFilter || !!searchQuery;

  return (
    <div className="customer-list-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-dark)' }}>

      {/* Toolbar: filter badge + info + tombol tambah */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-panel)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>

          {/* Info jumlah */}
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginRight: '4px' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{filteredOrders.length}</strong>
            {' '}dari{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{naskahOrders.length}</strong>
            {' '}naskah
          </span>

          {/* Separator */}
          <span style={{ color: 'var(--border)', fontSize: '16px' }}>|</span>

          {/* Badge filter Status */}
          {STATUS_LIST.map((status) => {
            const isActive = activeStatuses.includes(status);
            const variant = statusVariantMap[status] || 'neutral';
            return (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: isActive ? '700' : '500',
                  border: `1.5px solid ${isActive ? 'currentColor' : 'var(--border)'}`,
                  background: isActive ? undefined : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  opacity: isActive ? 1 : 0.75
                }}
              >
                <Badge label={`${status} (${statusCounts[status]})`} variant={isActive ? variant : 'neutral'} />
              </button>
            );
          })}

          {/* Filter Genre (dropdown kecil jika ada data) */}
          {genres.length > 0 && (
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              style={{
                padding: '4px 10px',
                border: `1.5px solid ${genreFilter ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '20px',
                fontSize: '11px',
                background: genreFilter ? 'rgba(99,102,241,0.08)' : 'transparent',
                color: genreFilter ? 'var(--accent)' : 'var(--text-secondary)',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: genreFilter ? '600' : '400'
              }}
            >
              <option value="">Semua Genre</option>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          )}

          {/* Reset filter */}
          {hasActiveFilter && (
            <button
              onClick={() => { setActiveStatuses([]); setGenreFilter(''); }}
              style={{
                padding: '3px 8px',
                borderRadius: '20px',
                fontSize: '11px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                opacity: 0.75
              }}
            >
              ✕ Reset
            </button>
          )}
        </div>

        <Button onClick={handleAddNew} variant="primary" size="sm" icon="➕">
          Tambah Naskah
        </Button>
      </div>

      {/* Tabel */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', background: 'var(--bg-card)' }}>
        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '32%', userSelect: 'none' }}>Judul &amp; Identitas</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '22%', userSelect: 'none' }}>Penulis &amp; Penerbit</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '13%', userSelect: 'none' }}>Genre</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '10%', userSelect: 'none' }}>Paket</th>
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
                description={hasActiveFilter ? 'Tidak ada hasil untuk filter yang dipilih.' : 'Belum ada naskah terdaftar. Klik Tambah Naskah untuk menambahkan.'}
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
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: '600' }}>{o.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {o.naskah_id_code && <span>ID: {o.naskah_id_code}</span>}
                      {o.total_pages && <span style={{ marginLeft: '8px' }}>· {o.total_pages} hlm</span>}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    <div>👤 {getPenulisName(o.penulis_id)}</div>
                    <div style={{ marginTop: '2px' }}>🏢 {getPenerbitName(o.penerbit_id)}</div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {o.genre ? (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: 'rgba(6,182,212,0.1)',
                        color: '#22d3ee'
                      }}>
                        {o.genre}
                      </span>
                    ) : <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>-</span>}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {o.package_type || 'Standar'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <Badge
                      label={o.status}
                      variant={statusVariantMap[o.status] || 'neutral'}
                    />
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <Button variant="secondary" size="sm" onClick={(e) => handleEdit(o, e)}>
                        ✏️ Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={(e) => o.id && handleDelete(o.id, o.title, e)}>
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
  );
};

export default NaskahOrdersManager;
