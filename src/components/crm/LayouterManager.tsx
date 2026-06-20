import React, { useState, useMemo } from 'react';
import { useCrmContext } from '../../contexts/CrmContext';
import { useAppContext } from '../../contexts/AppContext';
import { Layouter } from '../../types/crm.types';
import LayouterForm from './LayouterForm';
import { TableEmptyState } from '../../ui/molecules/EmptyState';
import { Button } from '../../ui/atoms/Button';
import { Badge } from '../../ui/atoms/Badge';

const TimManager: React.FC = () => {
  const { layouters, addLayouter, updateLayouter, deleteLayouter } = useCrmContext();
  const { showConfirm, showToast } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [currentMember, setCurrentMember] = useState<Layouter | null>(null);

  // State filter
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Daftar departemen unik dari data yang ada
  const departments = useMemo(() => {
    const set = new Set(layouters.map((l) => l.department).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [layouters]);

  // Filter anggota tim
  const filteredMembers = useMemo(() => {
    return layouters.filter((l) => {
      const matchSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.role.toLowerCase().includes(search.toLowerCase()) ||
        (l.department && l.department.toLowerCase().includes(search.toLowerCase()));
      const matchDept = departmentFilter ? l.department === departmentFilter : true;
      return matchSearch && matchDept;
    });
  }, [layouters, search, departmentFilter]);

  const handleAddNew = () => {
    setCurrentMember(null);
    setIsEditing(true);
  };

  const handleEdit = (l: Layouter, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMember(l);
    setIsEditing(true);
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
          await updateLayouter({
            ...original,
            ...data,
          } as Layouter);
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
        onCancel={() => {
          setIsEditing(false);
          setCurrentMember(null);
        }}
      />
    );
  }

  // Hitung statistik tim
  const totalAktif = layouters.filter((l) => l.is_active === 1).length;

  return (
    <div className="customer-list-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-dark)' }}>

      {/* Header statistik */}
      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '10px 16px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        fontSize: '12px'
      }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          Total Tim: <strong style={{ color: 'var(--text-primary)' }}>{layouters.length}</strong>
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>
          Aktif: <strong style={{ color: '#22c55e' }}>{totalAktif}</strong>
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>
          Nonaktif: <strong style={{ color: '#ef4444' }}>{layouters.length - totalAktif}</strong>
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
          <div style={{ position: 'relative', width: '240px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '14px' }}>🔍</span>
            <input
              type="text"
              placeholder="Cari nama, peran, divisi..."
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

          {/* Filter Departemen */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
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
            <option value="">Semua Divisi</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Tombol Tambah */}
        <Button onClick={handleAddNew} variant="primary" size="sm" icon="➕">
          Tambah Anggota Tim
        </Button>
      </div>

      {/* Tabel Data */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-card)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '25%', userSelect: 'none' }}>Nama Anggota</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '20%', userSelect: 'none' }}>Peran</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '18%', userSelect: 'none' }}>Divisi</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '14%', userSelect: 'none' }}>Target / Minggu</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '12%', userSelect: 'none' }}>Status</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '11%', textAlign: 'center', userSelect: 'none' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <TableEmptyState
                colSpan={6}
                icon="👥"
                message="Tidak ada data anggota tim"
                description={search || departmentFilter ? `Tidak ada hasil untuk filter yang dipilih` : 'Belum ada anggota tim terdaftar. Klik tombol Tambah Anggota Tim untuk menambahkan.'}
              />
            ) : (
              filteredMembers.map((l) => (
                <tr
                  key={l.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.1s ease',
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <div>{l.name}</div>
                    {l.notes && (
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '400', marginTop: '2px', fontStyle: 'italic' }}>
                        &ldquo;{l.notes}&rdquo;
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    {l.role}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                    {l.department ? (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: '#818cf8'
                      }}>
                        {l.department}
                      </span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                    🎯 {l.weekly_target} naskah
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <Badge
                      label={l.is_active === 1 ? 'Aktif' : 'Nonaktif'}
                      variant={l.is_active === 1 ? 'success' : 'neutral'}
                    />
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => handleEdit(l, e)}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => l.id && handleDelete(l.id, l.name, e)}
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

export default TimManager;
