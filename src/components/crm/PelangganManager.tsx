import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Contact } from '../../types/contact.types';
import { Button } from '../../ui/atoms/Button';
import PelangganForm from './PelangganForm';

interface PelangganManagerProps {
  searchQuery?: string;
}

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
    <td colSpan={colSpan} style={{ padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '48px', opacity: 0.5 }}>{icon}</div>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
          {message}
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '300px' }}>
          {description}
        </p>
      </div>
    </td>
  </tr>
);

const PelangganManager: React.FC<PelangganManagerProps> = ({ searchQuery = '' }) => {
  const { contacts, addContact, updateContact, deleteContact, showConfirm, showToast, setRightPanelVisible, selectedCustomerId, setSelectedCustomerId } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);

  // Ambil hanya pelanggan (type === 'customer')
  const pelanggan = contacts.filter(c => c.type === 'customer');

  // Filter & Search
  const filteredPelanggan = pelanggan.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(query) ||
      (p.email || '').toLowerCase().includes(query) ||
      (p.wa_number || '').toLowerCase().includes(query);
    return matchSearch;
  });

  const handleAddNew = () => {
    setCurrentContact(null);
    setIsEditing(true);
  };

  const handleEdit = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentContact(contact);
    setIsEditing(true);
  };

  const handleFormSubmit = async (data: Omit<Contact, 'created_at' | 'id'> & { id?: number }) => {
    try {
      if (data.id) {
        const existing = pelanggan.find(p => p.id === data.id);
        if (existing) {
          await updateContact({ ...existing, ...data });
          showToast('Data pelanggan berhasil diperbarui', 'success');
        }
      } else {
        await addContact({
          ...data,
          created_at: new Date().toISOString()
        });
        showToast('Data pelanggan berhasil ditambahkan', 'success');
      }
      setIsEditing(false);
    } catch (err) {
      showToast('Terjadi kesalahan saat menyimpan data pelanggan', 'error');
    }
  };

  const handleRowClick = (id?: number) => {
    if (id) {
      setSelectedCustomerId(id);
    }
  };

  const handleRowDoubleClick = (id?: number) => {
    if (id) {
      setSelectedCustomerId(id);
      setRightPanelVisible(true);
    }
  };

  const handleDelete = (id: number, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm({
      title: 'Hapus Pelanggan',
      message: `Apakah Anda yakin ingin menghapus data pelanggan "${name}"?`,
      confirmText: 'Hapus',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteContact(id);
          showToast('Data pelanggan berhasil dihapus', 'success');
          if (selectedCustomerId === id) {
            setSelectedCustomerId(null);
          }
        } catch (err) {
          showToast('Gagal menghapus data pelanggan', 'error');
        }
      }
    });
  };

  if (isEditing) {
    return (
      <PelangganForm
        initialData={currentContact}
        onSubmit={handleFormSubmit}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', gap: '24px', overflowY: 'auto' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
            👥 Data Pelanggan
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Kelola data master pelanggan umum yang terpisah dari daftar penulis.
          </p>
        </div>
        <Button variant="primary" onClick={handleAddNew}>
          + Tambah Pelanggan
        </Button>
      </div>

      <div style={{ background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>No.</th>
                <th style={{ padding: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Nama Lengkap</th>
                <th style={{ padding: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>No. WhatsApp</th>
                <th style={{ padding: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Email</th>
                <th style={{ padding: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPelanggan.length === 0 ? (
                <TableEmptyState
                  colSpan={5}
                  icon={searchQuery ? '🔍' : '👥'}
                  message={searchQuery ? 'Tidak ada pelanggan yang cocok' : 'Belum ada data pelanggan'}
                  description={searchQuery ? `Pencarian "${searchQuery}" tidak membuahkan hasil.` : 'Mulai tambahkan pelanggan baru dengan menekan tombol Tambah Pelanggan di atas.'}
                />
              ) : (
                filteredPelanggan.map((p, index) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: selectedCustomerId === p.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.1s ease',
                      color: 'var(--text-primary)'
                    }}
                    onClick={() => handleRowClick(p.id)}
                    onDoubleClick={() => handleRowDoubleClick(p.id)}
                    onMouseEnter={(e) => {
                      if (selectedCustomerId !== p.id) e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCustomerId !== p.id) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: '500' }}>
                      {p.name}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {p.wa_number || '-'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {p.email || '-'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button variant="secondary" size="sm" onClick={(e) => handleEdit(p, e)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={(e) => p.id && handleDelete(p.id, p.name, e)}>
                          Hapus
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

export default PelangganManager;
