import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Contact } from '../../types/contact.types';
import { TableEmptyState } from '../../ui/molecules/EmptyState';

const CustomerManager: React.FC = () => {
  const {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    showToast,
    showConfirm
  } = useAppContext();

  // State untuk form input tambah / edit
  const [isEditing, setIsEditing] = useState(false);
  const [currentContactId, setCurrentContactId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [waNumber, setWaNumber] = useState('');
  const [address, setAddress] = useState('');
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

  // Fungsi reset form
  const resetForm = () => {
    setIsEditing(false);
    setCurrentContactId(null);
    setName('');
    setWaNumber('');
    setAddress('');
  };

  // Mulai mode edit
  const handleStartEdit = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setCurrentContactId(contact.id || null);
    setName(contact.name);
    setWaNumber(contact.wa_number || '');
    setAddress(contact.address || '');
  };

  // Simpan tambah atau edit pelanggan
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama pelanggan tidak boleh kosong!', 'error');
      return;
    }

    const customerData: Contact = {
      id: currentContactId || undefined,
      name: name.trim(),
      wa_number: waNumber.trim() || undefined,
      address: address.trim() || undefined,
      type: 'customer',
      created_at: isEditing && currentContactId !== null
        ? (contacts.find(c => c.id === currentContactId)?.created_at || new Date().toISOString())
        : new Date().toISOString()
    };

    try {
      if (isEditing && currentContactId !== null) {
        await updateContact(customerData);
        showToast('Data pelanggan berhasil diperbarui!', 'success');
      } else {
        await addContact(customerData);
        showToast('Pelanggan baru berhasil ditambahkan!', 'success');
      }
      resetForm();
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan data pelanggan!', 'error');
    }
  };

  // Hapus pelanggan
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
    <div className="customer-manager" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', overflow: 'auto' }}>
      
      {/* Header Modul */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
          👥 Manajemen Data Pelanggan
        </h1>
        {(isEditing || name || waNumber || address) && (
          <button className="btn-secondary" onClick={resetForm} style={{ padding: '6px 12px', fontSize: '13px' }}>
            Batal / Reset
          </button>
        )}
      </div>

      {/* Grid Layout: Kiri Form, Kanan Tabel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Form Box */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', alignSelf: 'start' }}>
          <form onSubmit={handleSaveCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', paddingBottom: '6px', borderBottom: '1px solid var(--border)', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
              {isEditing ? '✏️ Edit Rincian Pelanggan' : '➕ Tambah Pelanggan Baru'}
            </h2>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Nama Pelanggan</label>
              <input
                type="text"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap pelanggan..."
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Nomor WhatsApp / Kontak</label>
              <input
                type="text"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }}
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                placeholder="Contoh: 08123456789 atau +62812..."
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Alamat Pengiriman / Instansi (Opsional)</label>
              <textarea
                style={{ width: '100%', height: '80px', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-primary)', resize: 'vertical', outline: 'none' }}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat lengkap tujuan pengiriman berkas atau invoice..."
              />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px', fontWeight: '600', width: '100%', marginTop: '6px' }}>
              {isEditing ? '💾 Simpan Perubahan' : '➕ Daftarkan Pelanggan'}
            </button>
          </form>
        </div>

        {/* List Box & Table */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
              📋 Daftar Pelanggan ({customers.length})
            </h2>
            
            {/* Input Pencarian */}
            <div style={{ position: 'relative', width: '220px' }}>
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '12px' }}>🔍</span>
              <input
                type="text"
                placeholder="Cari nama, kontak, alamat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '6px 12px 6px 30px', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '12px', background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: '600' }}>
                  <th style={{ padding: '12px 16px', width: '40px', textAlign: 'center' }}>👤</th>
                  <th style={{ padding: '12px 16px' }}>Nama Pelanggan</th>
                  <th style={{ padding: '12px 16px' }}>Kontak WA</th>
                  <th style={{ padding: '12px 16px' }}>Alamat</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', width: '120px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <TableEmptyState
                    colSpan={5}
                    icon="👥"
                    message="Tidak ada data pelanggan"
                    description={searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Daftarkan pelanggan baru melalui form sebelah kiri"}
                  />
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        transition: 'background 0.15s ease',
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '8px 16px', textAlign: 'center', fontSize: '16px' }}>
                        👤
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {customer.name}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {customer.wa_number ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{customer.wa_number}</span>
                            <button
                              onClick={(e) => handleCopyWa(customer.wa_number!, e)}
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', padding: '2px', opacity: 0.6 }}
                              title="Salin nomor WhatsApp"
                            >
                              📋
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Tidak ada</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={customer.address}>
                        {customer.address || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Tidak ada alamat</span>}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            className="btn-secondary"
                            onClick={(e) => handleStartEdit(customer, e)}
                            style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Edit Pelanggan"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn-danger"
                            onClick={(e) => customer.id && handleDeleteCustomer(customer.id, customer.name, e)}
                            style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
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
    </div>
  );
};

export default CustomerManager;
