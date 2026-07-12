import React, { useMemo, useState } from 'react';
import { useInvoiceContext } from '../../../contexts/InvoiceContext';
import { useAppContext } from '../../../contexts/AppContext';
import { SmartRelationField, SmartRelationOption, Modal } from '@pubhub/shared-ui';
import { findBestDuplicate, formatDuplicateReason } from '@pubhub/shared-utils';

export const CustomerSection: React.FC = () => {
  const { customer, setCustomer } = useInvoiceContext();
  const { 
    contacts, 
    addContact, 
    updateContact, 
    deleteContact, 
    showConfirm, 
    showToast 
  } = useAppContext();
  const [waInput, setWaInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowSuggestions(true);
    
    const exactMatch = allContactOptions.find(
      (o) => (o as any).name?.toLowerCase() === val.trim().toLowerCase()
    );
    
    if (exactMatch) {
      setCustomer((prev) => ({
        ...prev,
        name: val,
        wa_number: exactMatch.wa_number || prev.wa_number || '',
        email: exactMatch.email || prev.email || '',
        address: exactMatch.address || prev.address || '',
        isPenulis: exactMatch.isPenulis || false,
      }));
    } else {
      setCustomer((prev) => ({
        ...prev,
        name: val,
      }));
    }
  };

  const [createFormData, setCreateFormData] = useState({
    name: '',
    wa_number: '',
    email: '',
    address: '',
    isPenulis: false,
  });
  const [duplicateWarning, setDuplicateWarning] = useState<{
    matchedOption: SmartRelationOption;
    similarity: number;
    reason: string;
  } | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: 0,
    name: '',
    wa_number: '',
    email: '',
    address: '',
    isPenulis: false,
  });

  const handleEditOption = (value: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const contact = contacts.find((c) => String(c.id) === value);
    if (contact) {
      setEditFormData({
        id: contact.id || 0,
        name: contact.name,
        wa_number: contact.wa_number || '',
        email: contact.email || '',
        address: contact.address || '',
        isPenulis: contact.type === 'penulis' || contact.type === 'both',
      });
      setShowEditModal(true);
    }
  };

  const handleEditSave = async () => {
    if (!editFormData.name.trim()) {
      showToast('Nama tidak boleh kosong', 'error');
      return;
    }

    try {
      await updateContact({
        id: editFormData.id,
        name: editFormData.name.trim(),
        wa_number: editFormData.wa_number.trim(),
        email: editFormData.email.trim(),
        address: editFormData.address.trim(),
        type: editFormData.isPenulis ? 'both' : 'customer',
        created_at: new Date().toISOString(),
      });

      // Update state customer di form saat ini jika yang diedit adalah customer yang terpilih
      const oldContactName = contacts.find((c) => c.id === editFormData.id)?.name || '';
      if (customer.name && oldContactName.toLowerCase() === customer.name.toLowerCase()) {
        setCustomer((prev) => ({
          ...prev,
          name: editFormData.name.trim(),
          wa_number: editFormData.wa_number.trim(),
          email: editFormData.email.trim(),
          address: editFormData.address.trim(),
          isPenulis: editFormData.isPenulis,
        }));
      }

      showToast('Kontak berhasil diperbarui', 'success');
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      showToast('Gagal memperbarui kontak', 'error');
    }
  };

  const handleDeleteOption = (value: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const contact = contacts.find((c) => String(c.id) === value);
    if (!contact) return;

    showConfirm({
      title: 'Hapus Kontak',
      message: `Apakah Anda yakin ingin menghapus kontak "${contact.name}"?`,
      confirmText: 'Hapus',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteContact(contact.id!);
          showToast('Kontak berhasil dihapus', 'success');

          // Jika kontak yang dihapus sedang terpilih di form invoice, kosongkan
          if (customer.name && contact.name.toLowerCase() === customer.name.toLowerCase()) {
            setCustomer({
              name: '',
              wa_number: '',
              email: '',
              address: '',
              isPenulis: false,
            });
          }
        } catch (err) {
          console.error(err);
          showToast('Gagal menghapus kontak', 'error');
        }
      },
    });
  };

  const allContactOptions: SmartRelationOption[] = useMemo(() => {
    // Kelompokkan kontak berdasarkan nama (case-insensitive) untuk menghilangkan duplikasi visual
    const uniqueContactsMap = new Map<string, typeof contacts[0]>();
    
    contacts.forEach((c) => {
      const nameKey = c.name.trim().toLowerCase();
      const existing = uniqueContactsMap.get(nameKey);
      
      if (!existing) {
        uniqueContactsMap.set(nameKey, c);
      } else {
        // Tentukan prioritas tipe: both > customer > penulis
        const getPriority = (type: string) => {
          if (type === 'both') return 3;
          if (type === 'customer') return 2;
          return 1;
        };
        
        if (getPriority(c.type) > getPriority(existing.type)) {
          uniqueContactsMap.set(nameKey, c);
        }
      }
    });

    const uniqueContactsList = Array.from(uniqueContactsMap.values());

    return uniqueContactsList.map((c) => {
      let roleLabel = '';
      if (c.type === 'customer') roleLabel = ' (Pelanggan)';
      else if (c.type === 'penulis') roleLabel = ' (Penulis)';
      else if (c.type === 'both') roleLabel = ' (Pelanggan & Penulis)';

      return {
        value: String(c.id),
        label: `${c.name}${roleLabel}`,
        name: c.name,
        source: c.type === 'penulis' ? 'Penulis' : c.type === 'customer' ? 'Pelanggan' : 'Pelanggan & Penulis',
        wa_number: c.wa_number,
        email: c.email,
        address: c.address,
        isPenulis: c.type === 'penulis' || c.type === 'both',
      };
    });
  }, [contacts]);

  const selectedValue = useMemo(() => {
    if (!customer.name) return '';
    const found = allContactOptions.find(
      (o) => (o as any).name?.toLowerCase() === customer.name!.toLowerCase()
    );
    return found ? found.value : '';
  }, [allContactOptions, customer.name]);

  const handleSelect = (value: string, option?: SmartRelationOption) => {
    if (!option) {
      const exactMatch = allContactOptions.find(
        (o) => (o as any).name?.toLowerCase() === value.trim().toLowerCase()
      );
      if (exactMatch) {
        setCustomer((prev) => ({
          ...prev,
          name: exactMatch.name || value,
          wa_number: exactMatch.wa_number || '',
          email: exactMatch.email || '',
          address: exactMatch.address || '',
          isPenulis: exactMatch.isPenulis || false,
        }));
      } else {
        setCustomer((prev) => ({ ...prev, name: value }));
      }
      return;
    }
    setCustomer((prev) => ({
      ...prev,
      name: (option as any).name || option.label,
      wa_number: option.wa_number || '',
      email: option.email || '',
      address: option.address || '',
      isPenulis: option.isPenulis || false,
    }));
  };

  const checkDuplicate = (data: { name: string; wa_number?: string; email?: string }) => {
    const allEntities = contacts.map((c) => ({
      id: String(c.id),
      name: c.name,
      wa_number: c.wa_number,
      email: c.email,
    }));
    const result = findBestDuplicate(
      { id: undefined, name: data.name, wa_number: data.wa_number, email: data.email },
      allEntities,
      [
        { key: 'name', weight: 0.5, threshold: 0.85 },
        { key: 'wa_number', weight: 0.35, isPhone: true, threshold: 0.95 },
        { key: 'email', weight: 0.15, threshold: 0.95 },
      ],
      0.7
    );
    if (result) {
      setDuplicateWarning({
        matchedOption: allContactOptions.find((o) => o.value === result.item.id) || {
          value: result.item.id,
          label: result.item.name,
        },
        similarity: result.score,
        reason: formatDuplicateReason(result),
      });
      return true;
    }
    setDuplicateWarning(null);
    return false;
  };

  const handleCreateSave = async (onSuccess: () => void) => {
    const { name, wa_number, email, address, isPenulis } = createFormData;
    if (!name.trim()) return;

    if (duplicateWarning) {
      // The modal is showing the duplicate warning; user pressed "Tetap Buat Baru".
      await actuallyCreate({ name, wa_number, email, address, isPenulis });
      setDuplicateWarning(null);
      onSuccess();
      return;
    }

    const hasDuplicate = checkDuplicate({ name, wa_number, email });
    if (hasDuplicate) {
      return;
    }

    await actuallyCreate({ name, wa_number, email, address, isPenulis });
    onSuccess();
  };

  const actuallyCreate = async (data: {
    name: string;
    wa_number: string;
    email: string;
    address: string;
    isPenulis: boolean;
  }) => {
    try {
      await addContact({
        name: data.name.trim(),
        wa_number: data.wa_number.trim(),
        email: data.email.trim(),
        address: data.address.trim(),
        type: data.isPenulis ? 'both' : 'customer',
        created_at: new Date().toISOString(),
      });
      setCustomer((prev) => ({
        ...prev,
        name: data.name.trim(),
        wa_number: data.wa_number.trim(),
        email: data.email.trim(),
        address: data.address.trim(),
        isPenulis: data.isPenulis,
      }));
    } catch (err) {
      console.error('Gagal membuat kontak baru:', err);
    }
  };

  const handleParseWA = () => {
    const lines = waInput.split('\n');
    let name = '';
    let wa_number = '';
    let email = '';
    let address = '';

    lines.forEach((line) => {
      if (line.toLowerCase().startsWith('nama:')) {
        name = line.substring(5).trim();
      } else if (line.toLowerCase().startsWith('no:') || line.toLowerCase().startsWith('wa:')) {
        wa_number = line.substring(line.indexOf(':') + 1).trim();
      } else if (line.toLowerCase().startsWith('email:')) {
        email = line.substring(6).trim();
      } else if (line.toLowerCase().startsWith('alamat:')) {
        address = line.substring(7).trim();
      }
    });

    setCustomer((prev) => ({
      ...prev,
      name: name || prev.name || '',
      wa_number: wa_number || prev.wa_number || '',
      email: email || prev.email || '',
      address: address || prev.address || '',
    }));
  };

  return (
    <>
      <textarea
        style={{
          width: '100%',
          minHeight: '80px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '14px',
          color: 'var(--text-primary)',
          resize: 'vertical',
          marginBottom: '8px',
        }}
        placeholder="Tempel teks chat WhatsApp di sini..."
        value={waInput}
        onChange={(e) => setWaInput(e.target.value)}
        rows={3}
      />
      <button
        className="btn-secondary"
        onClick={handleParseWA}
        style={{ marginBottom: '16px', width: '100%', padding: '8px 10px', fontSize: '12px' }}
      >
        ✨ Parse Otomatis Chat WhatsApp
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 16px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        <span
          style={{
            fontSize: '10px',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Detail Kontak Pelanggan
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
      </div>

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
          Nama Pelanggan / Penulis <span style={{ color: '#d93838' }}>*</span>
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            required
            placeholder="Ketik nama pelanggan..."
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            value={customer.name || ''}
            onChange={handleNameChange}
            onFocus={() => {
              setSearchQuery(customer.name || '');
              setShowSuggestions(true);
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 200);
            }}
          />
          {selectedValue && (
            <span
              style={{
                position: 'absolute',
                right: '12px',
                color: '#0f9960',
                fontSize: '11px',
                fontWeight: '600',
                background: 'rgba(15, 153, 96, 0.08)',
                padding: '3px 8px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                userSelect: 'none'
              }}
              title="Terhubung dengan data Master Kontak"
            >
              ✓ Terhubung
            </span>
          )}
        </div>

        {showSuggestions && searchQuery.trim() && allContactOptions.filter(o => (o as any).name?.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 100,
              marginTop: '4px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}
          >
            {allContactOptions
              .filter(o => (o as any).name?.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    handleSelect(opt.value, opt);
                    setShowSuggestions(false);
                  }}
                  style={{
                    padding: '10px 14px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.1s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{ fontWeight: '500' }}>{opt.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-panel)', padding: '2px 6px', borderRadius: '4px' }}>
                    {opt.source}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
          No. WhatsApp
        </label>
        <input
          type="text"
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
          value={customer.wa_number || ''}
          onChange={(e) => setCustomer((prev) => ({ ...prev, wa_number: e.target.value }))}
          placeholder="08123456789"
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
          Alamat Email (Opsional)
        </label>
        <input
          type="email"
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
          value={customer.email || ''}
          onChange={(e) => setCustomer((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="pelanggan@email.com"
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
          Alamat
        </label>
        <input
          type="text"
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
          value={customer.address || ''}
          onChange={(e) => setCustomer((prev) => ({ ...prev, address: e.target.value }))}
          placeholder="Alamat Pengiriman"
        />
      </div>

      {showEditModal && (
        <Modal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Kontak"
          width="480px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Nama Lengkap
              </label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Nomor WhatsApp
              </label>
              <input
                type="text"
                value={editFormData.wa_number}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, wa_number: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, email: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Alamat
              </label>
              <input
                type="text"
                value={editFormData.address}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, address: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none', margin: '4px 0' }}>
              <input
                type="checkbox"
                checked={editFormData.isPenulis}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, isPenulis: e.target.checked }))}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Centang jika penulis (simpan sebagai penulis & pelanggan)
            </label>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="btn-secondary" type="button" onClick={() => setShowEditModal(false)}>
                Batal
              </button>
              <button
                className="btn-primary"
                type="button"
                onClick={handleEditSave}
              >
                Perbarui
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
