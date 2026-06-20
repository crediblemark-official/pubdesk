import React, { useState, useMemo } from 'react';
import { useCrmContext } from '../../contexts/CrmContext';
import { useAppContext } from '../../contexts/AppContext';
import { Layouter } from '../../types/crm.types';
import LayouterForm from './LayouterForm';
import { TableEmptyState } from '../../ui/molecules/EmptyState';
import { Button } from '../../ui/atoms/Button';
import { Badge } from '../../ui/atoms/Badge';

interface TimManagerProps {
  searchQuery?: string;
}

// Format tanggal singkat ke ID locale
const formatTanggal = (isoString: string) => {
  if (!isoString) return '-';
  try {
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '-';
  }
};

const TimManager: React.FC<TimManagerProps> = ({ searchQuery = '' }) => {
  const { layouters, addLayouter, updateLayouter, deleteLayouter } = useCrmContext();
  const { showConfirm, showToast, setSelectedLayouterId, setRightPanelVisible } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [currentMember, setCurrentMember] = useState<Layouter | null>(null);

  // ID baris yang sedang terseleksi (highlight lokal)
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Filter state — badge multi-select untuk status
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Daftar departemen unik dari data
  const departments = useMemo(() => {
    const set = new Set(layouters.map((l) => l.department).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [layouters]);

  // Toggle status badge filter
  const toggleStatus = (status: string) => {
    setActiveStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  // Filter anggota tim
  const filteredMembers = useMemo(() => {
    return layouters.filter((l) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.role.toLowerCase().includes(q) ||
        (l.department && l.department.toLowerCase().includes(q));

      const statusLabel = l.is_active === 1 ? 'Aktif' : 'Nonaktif';
      const matchStatus = activeStatuses.length === 0 || activeStatuses.includes(statusLabel);
      const matchDept = departmentFilter ? l.department === departmentFilter : true;
      return matchSearch && matchStatus && matchDept;
    });
  }, [layouters, searchQuery, activeStatuses, departmentFilter]);

  // Hitung statistik
  const totalAktif = layouters.filter((l) => l.is_active === 1).length;
  const totalNonaktif = layouters.length - totalAktif;

  const handleAddNew = () => {
    setCurrentMember(null);
    setIsEditing(true);
  };

  const handleEdit = (l: Layouter, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMember(l);
    setIsEditing(true);
  };

  // Single click — seleksi baris saja
  const handleRowClick = (id?: number) => {
    if (id) {
      setSelectedId(id);
      setSelectedLayouterId(id);
    }
  };

  // Double click — buka panel preview kanan
  const handleRowDoubleClick = (id?: number) => {
    if (id) {
      setSelectedId(id);
      setSelectedLayouterId(id);
      setRightPanelVisible(true);
    }
  };

  const handleDelete = (id: number, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm({
      title: 'Hapus Anggota Tim',
      message: `Apakah Anda yakin ingin menghapus anggota tim "${name}"?`,
      confirmText: 'Hapus',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteLayouter(id);
          showToast('Anggota tim berhasil dihapus!', 'success');
        } catch (err) {
          console.error(err);
          showToast('Gagal menghapus anggota tim!', 'error');
        }
      }
    });
  };

  const handleFormSubmit = async (data: Omit<Layouter, 'created_at' | 'id'> & { id?: number }) => {
    try {
      if (data.id) {
        const original = layouters.find((l) => l.id === data.id);
        if (original) {
          await updateLayouter({ ...original, ...data } as Layouter);
          showToast('Data anggota tim berhasil diperbarui!', 'success');
        }
      } else {
        await addLayouter(data as Omit<Layouter, 'created_at'>);
        showToast('Anggota tim baru berhasil ditambahkan!', 'success');
      }
      setIsEditing(false);
      setCurrentMember(null);
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan data anggota tim!', 'error');
    }
  };

  if (isEditing) {
    return (
      <LayouterForm
        initialData={currentMember}
        onSubmit={handleFormSubmit}
        onCancel={() => { setIsEditing(false); setCurrentMember(null); }}
      />
    );
  }

  const hasActiveFilter = activeStatuses.length > 0 || !!departmentFilter || !!searchQuery;

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
            <strong style={{ color: 'var(--text-primary)' }}>{filteredMembers.length}</strong>
            {' '}dari{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{layouters.length}</strong>
            {' '}anggota
          </span>

          {/* Separator */}
          <span style={{ color: 'var(--border)', fontSize: '16px' }}>|</span>

          {/* Badge filter Aktif */}
          {[
            { label: 'Aktif', count: totalAktif, variant: 'success' as const },
            { label: 'Nonaktif', count: totalNonaktif, variant: 'neutral' as const }
          ].map(({ label, count, variant }) => {
            const isActive = activeStatuses.includes(label);
            return (
              <button
                key={label}
                onClick={() => toggleStatus(label)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: isActive ? '700' : '500',
                  border: `1.5px solid ${isActive ? 'currentColor' : 'var(--border)'}`,
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  opacity: isActive ? 1 : 0.75
                }}
              >
                <Badge label={`${label} (${count})`} variant={isActive ? variant : 'neutral'} />
              </button>
            );
          })}

          {/* Filter Departemen */}
          {departments.length > 0 && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{
                padding: '4px 10px',
                border: `1.5px solid ${departmentFilter ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '20px',
                fontSize: '11px',
                background: departmentFilter ? 'rgba(99,102,241,0.08)' : 'transparent',
                color: departmentFilter ? 'var(--accent)' : 'var(--text-secondary)',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: departmentFilter ? '600' : '400'
              }}
            >
              <option value="">Semua Divisi</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}

          {/* Reset filter */}
          {hasActiveFilter && (
            <button
              onClick={() => { setActiveStatuses([]); setDepartmentFilter(''); }}
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
          Tambah Anggota Tim
        </Button>
      </div>

      {/* Tabel */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', background: 'var(--bg-card)' }}>
        <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '22%', userSelect: 'none' }}>Nama Anggota</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '20%', userSelect: 'none' }}>Peran</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '18%', userSelect: 'none' }}>Divisi</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '16%', userSelect: 'none' }}>Tanggal Masuk</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '12%', userSelect: 'none' }}>Status</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '12%', textAlign: 'center', userSelect: 'none' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <TableEmptyState
                colSpan={6}
                icon="👥"
                message="Tidak ada data anggota tim"
                description={hasActiveFilter ? 'Tidak ada hasil untuk filter yang dipilih.' : 'Belum ada anggota tim terdaftar. Klik Tambah Anggota Tim untuk menambahkan.'}
              />
            ) : (
              filteredMembers.map((l) => (
                <tr
                  key={l.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: selectedId === l.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.1s ease',
                    color: 'var(--text-primary)'
                  }}
                  onClick={() => handleRowClick(l.id)}
                  onDoubleClick={() => handleRowDoubleClick(l.id)}
                  onMouseEnter={(e) => {
                    if (selectedId !== l.id) e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedId !== l.id) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '10px 12px', fontWeight: '600' }}>
                    <div>{l.name}</div>
                    {l.notes && (
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '400', marginTop: '2px', fontStyle: 'italic' }}>
                        &ldquo;{l.notes}&rdquo;
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '12px' }}>
                    {l.role}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {l.department ? (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: 'rgba(99,102,241,0.1)',
                        color: '#818cf8'
                      }}>
                        {l.department}
                      </span>
                    ) : <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>-</span>}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    📅 {formatTanggal(l.created_at)}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <Badge
                      label={l.is_active === 1 ? 'Aktif' : 'Nonaktif'}
                      variant={l.is_active === 1 ? 'success' : 'neutral'}
                    />
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <Button variant="secondary" size="sm" onClick={(e) => handleEdit(l, e)}>
                        ✏️ Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={(e) => l.id && handleDelete(l.id, l.name, e)}>
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

export default TimManager;
