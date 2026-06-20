import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useCrmContext } from '../../contexts/CrmContext';
import { Contact } from '../../types/contact.types';
import { TableEmptyState } from '../../ui/molecules/EmptyState';
import { Button } from '../../ui/atoms/Button';
import { Badge } from '../../ui/atoms/Badge';

const followupVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent'> = {
  'New': 'info',
  'Contacted': 'warning',
  'Interested': 'accent',
  'Deal': 'success',
  'Rejected': 'danger',
  'Pelanggan': 'success'
};

const CustomerList: React.FC = () => {
  const {
    contacts,
    deleteContact,
    showToast,
    showConfirm,
    setEditingCustomer,
    setActiveModule
  } = useAppContext();

  const { penulis } = useCrmContext();

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
    <div className="customer-list-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-dark)' }}>
      
      {/* Baris Atas: Pencarian & Tombol Tambah (Menyerupai FilterBar di File List) */}
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
        {/* Input Pencarian dengan style seragam */}
        <div style={{ position: 'relative', width: '280px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '14px' }}>🔍</span>
          <input
            type="text"
            placeholder="Cari nama, kontak WhatsApp, alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Tombol Tambah Pelanggan dihilangkan karena penambahan terpusat di Lead Penulis & Invoice */}
      </div>

      {/* Tabel Data (Membentang penuh seperti FileList) */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-card)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '6%', textAlign: 'center', userSelect: 'none' }}>Avatar</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '22%', userSelect: 'none' }}>Nama Pelanggan</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '18%', userSelect: 'none' }}>Email</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '15%', userSelect: 'none' }}>Kontak WhatsApp</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '18%', userSelect: 'none' }}>Alamat Instansi / Pengiriman</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '10%', userSelect: 'none' }}>Status</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', width: '11%', textAlign: 'center', userSelect: 'none' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <TableEmptyState
                colSpan={7}
                icon="👥"
                message="Tidak ada data pelanggan"
                description={searchQuery ? `Tidak ada hasil untuk pencarian "${searchQuery}"` : "Belum ada pelanggan terdaftar."}
              />
            ) : (
              filteredCustomers.map((customer) => {
                const customerPenulis = penulis.find(p => 
                  p.name.toLowerCase() === customer.name.toLowerCase() || 
                  (customer.wa_number && p.wa_number === customer.wa_number)
                );
                const status = customerPenulis?.followup_status || 'Pelanggan';

                return (
                  <tr
                    key={customer.id}
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
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '16px' }}>
                      👤
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      <div>{customer.name}</div>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                      {customer.email ? (
                        <div>📧 {customer.email}</div>
                      ) : (
                        <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Tidak ada email</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
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
                     <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }} title={customer.address}>
                      <div style={{ whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                        {customer.address || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Tidak ada alamat terdaftar</span>}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge 
                        label={status}
                        variant={followupVariantMap[status] || 'success'}
                      />
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => handleStartEdit(customer, e)}
                          style={{ padding: '6px 10px' }}
                          title="Edit Rincian Pelanggan"
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => customer.id && handleDeleteCustomer(customer.id, customer.name, e)}
                          style={{ padding: '6px 10px' }}
                          title="Hapus Pelanggan"
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerList;
