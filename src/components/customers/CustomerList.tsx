import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Contact } from '../../types/contact.types';
import { TableEmptyState } from '../../ui/molecules/EmptyState';

const CustomerList: React.FC = () => {
  const {
    contacts,
    deleteContact,
    showToast,
    showConfirm,
    setEditingCustomer,
    setActiveModule
  } = useAppContext();

  // State pencarian lokal
  const [searchQuery, setSearchQuery] = useState('');

  // Saring kontak yang bertipe 'customer'
  const customers = useMemo(() => {
    return contacts.filter(c => c.type === 'customer');
  }, [contacts]);

  // Saring berdasarkan input pencarian
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(query) ||
      (c.wa_number || '').toLowerCase().includes(query) ||
      (c.address || '').toLowerCase().includes(query)
    );
  }, [customers, searchQuery]);

  // Fungsi untuk memulai pengeditan pelanggan
  const handleStartEdit = (customer: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCustomer(customer);
    setActiveModule('customer-form');
  };

  // Fungsi untuk menghapus pelanggan
  const handleDeleteCustomer = (id: number, customerName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm({
      title: 'Hapus Pelanggan',
      message: `Apakah Anda yakin ingin menghapus pelanggan "${customerName}"?`,
      confirmText: 'Hapus',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteContact(id);
          showToast('Pelanggan berhasil dihapus!', 'success');
        } catch (err) {
          console.error(err);
          showToast('Gagal menghapus pelanggan!', 'error');
        }
      }
    });
  };

  // Salin nomor WA ke clipboard
  const handleCopyWa = (num: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(num);
    showToast('Nomor WhatsApp disalin!', 'success');
  };

  return (
    <div className="customer-list-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflow: 'auto' }}>
      
      {/* Header Halaman */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🗃️ Daftar Pelanggan Terdaftar
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Kelola semua profil pelanggan, detail kontak, dan alamat pengiriman di sini.
          </p>
        </div>
        
        {/* Tombol pintasan tambah pelanggan */}
        <button 
          onClick={() => {
            setEditingCustomer(null);
            setActiveModule('customer-form');
          }}
          className="btn-primary" 
          style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', cursor: 'pointer' }}
        >
          <span>➕</span> Tambah Pelanggan Baru
        </button>
      </div>

      {/* Box Panel Konten */}
      <div style={{ 
        background: 'var(--bg-panel)', 
        border: '1px solid var(--border)', 
        borderRadius: '16px', 
        padding: '24px', 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px' 
      }}>
        
        {/* Toolbar Pencarian */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📋</span> Pelanggan ({customers.length})
          </h2>
          
          {/* Input Pencarian */}
          <div style={{ position: 'relative', width: '280px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '14px' }}>🔍</span>
            <input
              type="text"
              placeholder="Cari nama, kontak WhatsApp, alamat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px 16px 8px 36px', 
                border: '1px solid var(--border)', 
                borderRadius: '24px', 
                fontSize: '13px', 
                background: 'var(--bg-card)', 
                color: 'var(--text-primary)', 
                outline: 'none',
                transition: 'border-color 0.15s ease'
              }}
            />
          </div>
        </div>

        {/* Tabel Data */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-card)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: '600' }}>
                <th style={{ padding: '14px 20px', width: '50px', textAlign: 'center' }}>Avatar</th>
                <th style={{ padding: '14px 20px' }}>Nama Pelanggan</th>
                <th style={{ padding: '14px 20px' }}>Kontak WhatsApp</th>
                <th style={{ padding: '14px 20px' }}>Alamat Instansi / Pengiriman</th>
                <th style={{ padding: '14px 20px', textAlign: 'center', width: '160px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <TableEmptyState
                  colSpan={5}
                  icon="👥"
                  message="Tidak ada data pelanggan"
                  description={searchQuery ? `Tidak ada hasil untuk pencarian "${searchQuery}"` : "Belum ada pelanggan terdaftar. Tambahkan pelanggan baru untuk memulai."}
                />
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      transition: 'all 0.15s ease',
                    }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '12px 20px', textAlign: 'center', fontSize: '16px' }}>
                      👤
                    </td>
                    <td style={{ padding: '12px 20px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {customer.name}
                    </td>
                    <td style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>
                      {customer.wa_number ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{customer.wa_number}</span>
                          <button
                            onClick={(e) => handleCopyWa(customer.wa_number!, e)}
                            style={{ 
                              border: 'none', 
                              background: 'transparent', 
                              cursor: 'pointer', 
                              fontSize: '12px', 
                              padding: '4px', 
                              opacity: 0.6,
                              borderRadius: '4px',
                              transition: 'opacity 0.15s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseOut={(e) => e.currentTarget.style.opacity = '0.6'}
                            title="Salin nomor WhatsApp"
                          >
                            📋
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Tidak ada</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 20px', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={customer.address}>
                      {customer.address || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Tidak ada alamat terdaftar</span>}
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          className="btn-secondary"
                          onClick={(e) => handleStartEdit(customer, e)}
                          style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
                          title="Edit Rincian Pelanggan"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-danger"
                          onClick={(e) => customer.id && handleDeleteCustomer(customer.id, customer.name, e)}
                          style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
                          title="Hapus Pelanggan"
                        >
                          🗑️ Hapus
                        </button>
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

export default CustomerList;
