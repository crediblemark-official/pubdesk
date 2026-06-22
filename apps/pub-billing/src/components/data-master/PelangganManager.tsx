import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Contact } from '../../types/contact.types';
import { Button } from '../../ui/atoms/Button';
import { TableEmptyState } from '../../ui/molecules/EmptyState';
import { FilterBar, FilterGroup, FilterDivider } from '../../ui/molecules/FilterBar';
import PelangganForm from './PelangganForm';
import * as XLSX from 'xlsx';
import { save } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

interface PelangganManagerProps {
  searchQuery?: string;
}

const PelangganManager: React.FC<PelangganManagerProps> = ({ searchQuery = '' }) => {
  const { contacts, addContact, updateContact, deleteContact, showConfirm, showToast, setRightPanelVisible, selectedCustomerId, setSelectedCustomerId, addFile, files, registerImportExportActions, directAddNewModule, setDirectAddNewModule } = useAppContext();

  useEffect(() => {
    const actions = {
      onImport: () => document.getElementById('pelanggan-excel-import-input')?.click(),
      onExport: handleExportExcel,
      onDownloadTemplate: handleDownloadTemplate
    };
    registerImportExportActions('pelanggan', actions);
    return () => {
      registerImportExportActions('pelanggan', null);
    };
  }, [contacts]);

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        if (data.length === 0) {
          showToast('File Excel kosong!', 'error');
          return;
        }

        let importedCount = 0;
        let errorCount = 0;

        for (const row of data) {
          const name = row["Nama Pelanggan"] || row.Nama || row.nama || row.Name || row.name || row["Nama Lengkap"];
          if (!name) {
            errorCount++;
            continue;
          }

          const wa_number = row["No WA"] || row["No. WA"] || row.WhatsApp || row.whatsapp || row.wa || row.Phone || row.phone;
          const email = row.Email || row.email || row.Mail || row.mail;
          const address = row.Alamat || row.alamat || row.Address || row.address;

          try {
            await addContact({
              name: String(name).trim(),
              wa_number: wa_number ? String(wa_number).trim() : undefined,
              email: email ? String(email).trim() : undefined,
              address: address ? String(address).trim() : undefined,
              type: 'customer',
              created_at: new Date().toISOString()
            });
            importedCount++;
          } catch (err) {
            console.error('Gagal mengimpor pelanggan:', err);
            errorCount++;
          }
        }

        showToast(`Impor pelanggan berhasil! ${importedCount} data dimasukkan.${errorCount > 0 ? ` Gagal: ${errorCount}` : ''}`, 'success');
        e.target.value = '';
      } catch (err) {
        console.error(err);
        showToast('Gagal memproses file Excel!', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExportExcel = async () => {
    try {
      if (pelanggan.length === 0) {
        showToast('Tidak ada data pelanggan untuk diekspor!', 'info');
        return;
      }

      const exportData = pelanggan.map((p, idx) => ({
        "No": idx + 1,
        "Nama Pelanggan": p.name,
        "No. WhatsApp": p.wa_number || '',
        "Email": p.email || '',
        "Alamat": p.address || '',
        "Tanggal Dibuat": p.created_at ? p.created_at.substring(0, 10) : ''
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      const maxLens = Object.keys(exportData[0] || {}).map(key => {
        return Math.max(
          key.length,
          ...exportData.map(row => String((row as any)[key] || '').length)
        );
      });
      ws['!cols'] = maxLens.map(len => ({ wch: Math.min(len + 3, 50) }));

      XLSX.utils.book_append_sheet(wb, ws, "Pelanggan");

      const filePath = await save({
        filters: [{ name: 'Excel Workbook', extensions: ['xlsx'] }],
        defaultPath: 'Pelanggan_Export.xlsx'
      });

      if (!filePath) return;

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const bytes = new Uint8Array(wbout);
      await invoke('write_binary_file', { path: filePath, bytes: Array.from(bytes) });

      showToast('Data Pelanggan berhasil diekspor!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengekspor data pelanggan!', 'error');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const templateData = [
        {
          "Nama Pelanggan": "Rasyiqi",
          "No WA": "081234567890",
          "Email": "rasyiqi@example.com",
          "Alamat": "Jl. Gajah Mada No. 10, Jakarta"
        }
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(templateData);

      const maxLens = Object.keys(templateData[0] || {}).map(key => {
        return Math.max(
          key.length,
          ...templateData.map(row => String((row as any)[key] || '').length)
        );
      });
      ws['!cols'] = maxLens.map(len => ({ wch: Math.min(len + 3, 50) }));

      XLSX.utils.book_append_sheet(wb, ws, "Template Pelanggan");

      const filePath = await save({
        filters: [{ name: 'Excel Workbook', extensions: ['xlsx'] }],
        defaultPath: 'Template_Pelanggan.xlsx'
      });

      if (!filePath) return;

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const bytes = new Uint8Array(wbout);
      await invoke('write_binary_file', { path: filePath, bytes: Array.from(bytes) });

      showToast('Template Excel Pelanggan berhasil diunduh!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengunduh template!', 'error');
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'review'>('all');

  useEffect(() => {
    if (directAddNewModule === 'pelanggan') {
      setCurrentContact(null);
      setIsEditing(true);
      setDirectAddNewModule(null);
    }
  }, [directAddNewModule]);

  // Ambil hanya pelanggan (type === 'customer')
  const pelanggan = contacts.filter(c => c.type === 'customer');
  const reviewCount = pelanggan.filter(p => p.needs_review === 1).length;

  // Filter & Search
  const filteredPelanggan = pelanggan.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(query) ||
      (p.email || '').toLowerCase().includes(query) ||
      (p.wa_number || '').toLowerCase().includes(query);
    const matchTab = activeTab === 'all' || p.needs_review === 1;
    return matchSearch && matchTab;
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

  const handleVerify = async (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateContact({
        ...contact,
        needs_review: 0
      });
      showToast('Kontak berhasil diverifikasi!', 'success');
    } catch (err) {
      showToast('Gagal memverifikasi kontak!', 'error');
    }
  };

  const registerPelangganFile = async (contactId: number, contactData: Contact) => {
    try {
      const filename = `Pelanggan-${contactId}.json`;
      const jsonString = JSON.stringify(contactData);
      const bytes = new TextEncoder().encode(jsonString);
      const { invoke: tauriInvoke } = await import('@tauri-apps/api/core');
      const physicalPath = await tauriInvoke<string>('create_physical_file', {
        filename,
        bytes: Array.from(bytes),
        folder: 'pelanggan'
      });
      const alreadyExists = files.some(f => f.filename === filename && f.type === 'pelanggan');
      if (!alreadyExists) {
        await addFile({
          filename,
          path: physicalPath,
          type: 'pelanggan',
          project_id: undefined,
          version_label: String(contactId),
          status: 'Tersimpan',
          last_modified: new Date().toISOString(),
          is_readonly: false
        });
      }
    } catch (err) {
      console.error('Gagal mendaftarkan file pelanggan:', err);
    }
  };

  const handleFormSubmit = async (data: Omit<Contact, 'created_at' | 'id'> & { id?: number }) => {
    try {
      if (data.id) {
        const existing = pelanggan.find(p => p.id === data.id);
        if (existing) {
          await updateContact({ ...existing, ...data });
          showToast('Data pelanggan berhasil diperbarui', 'success');
          await registerPelangganFile(data.id, { ...existing, ...data } as Contact);
        }
      } else {
        const newId = await addContact({
          ...data,
          created_at: new Date().toISOString()
        });
        if (!newId) throw new Error('Gagal menyimpan pelanggan');
        showToast('Data pelanggan berhasil ditambahkan', 'success');
        await registerPelangganFile(newId, { ...data, id: newId, created_at: new Date().toISOString() } as Contact);
      }
      setIsEditing(false);
      setCurrentContact(null);
    } catch (err) {
      console.error(err);
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
        onCancel={() => { setIsEditing(false); setCurrentContact(null); }}
      />
    );
  }

  return (
    <div className="customer-list-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-dark)' }}>
      <input
        type="file"
        id="pelanggan-excel-import-input"
        accept=".xlsx, .xls"
        style={{ display: 'none' }}
        onChange={handleImportExcel}
      />

      <FilterBar>
        <div style={{ display: 'flex', gap: '8px', marginRight: 'auto' }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              background: activeTab === 'all' ? 'var(--accent, #c01c1c)' : 'transparent',
              color: activeTab === 'all' ? '#fff' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Semua ({pelanggan.length})
          </button>
          <button
            onClick={() => setActiveTab('review')}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              background: activeTab === 'review' ? 'var(--accent, #c01c1c)' : 'transparent',
              color: activeTab === 'review' ? '#fff' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            Review Queue
            {reviewCount > 0 && (
              <span style={{
                background: activeTab === 'review' ? '#fff' : 'var(--accent, #c01c1c)',
                color: activeTab === 'review' ? 'var(--accent, #c01c1c)' : '#fff',
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '10px',
                fontWeight: 'bold'
              }}>
                {reviewCount}
              </span>
            )}
          </button>
        </div>

        <FilterDivider />

        <FilterGroup label="">
          <Button variant="primary" size="sm" onClick={handleAddNew} icon="➕">
            Tambah Pelanggan
          </Button>
        </FilterGroup>
      </FilterBar>

      {/* Tabel */}
      <div style={{ flex: 1, overflowX: 'auto', background: 'var(--bg-card)' }}>
        <table style={{ minWidth: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>No.</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Nama Lengkap</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>No. WhatsApp</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Email</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Alamat</th>
              <th style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--text-secondary)', textAlign: 'left', whiteSpace: 'nowrap', position: 'sticky', right: 0, background: 'var(--bg-panel)', zIndex: 3, boxShadow: '-2px 0 4px rgba(0,0,0,0.06)' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPelanggan.length === 0 ? (
              <TableEmptyState
                colSpan={6}
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
                    background: selectedCustomerId === p.id ? 'rgba(192, 28, 28, 0.08)' : 'transparent',
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
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: '500', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {p.name}
                    {p.needs_review === 1 && (
                      <span style={{
                        fontSize: '9px',
                        background: '#fef3c7',
                        color: '#d97706',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        border: '1px solid #fcd34d'
                      }}>
                        Review
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {p.wa_number || '-'}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {p.email || '-'}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.address}>
                    {p.address || '-'}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'left', whiteSpace: 'nowrap', position: 'sticky', right: 0, background: 'var(--bg-card)', zIndex: 2, boxShadow: '-2px 0 4px rgba(0,0,0,0.06)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {p.needs_review === 1 && (
                        <button onClick={(e) => handleVerify(p, e)} style={{background:'none',border:'none',cursor:'pointer',padding:'2px',fontSize:'16px',lineHeight:1}} title="Setujui & Verifikasi">✓</button>
                      )}
                      <button onClick={(e) => handleEdit(p, e)} style={{background:'none',border:'none',cursor:'pointer',padding:'2px',fontSize:'16px',lineHeight:1}} title="Edit">✏️</button>
                      <button onClick={(e) => p.id && handleDelete(p.id, p.name, e)} style={{background:'none',border:'none',cursor:'pointer',padding:'2px',fontSize:'16px',lineHeight:1}} title="Hapus">🗑️</button>
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

export default PelangganManager;
