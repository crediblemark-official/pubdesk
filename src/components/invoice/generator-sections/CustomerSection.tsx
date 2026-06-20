import React, { useState } from 'react';
import { useInvoiceContext } from '../../../contexts/InvoiceContext';
import { useAppContext } from '../../../contexts/AppContext';

export const CustomerSection: React.FC = () => {
  const { customer, setCustomer } = useInvoiceContext();
  const { contacts } = useAppContext();
  const [waInput, setWaInput] = useState('');

  // Saring kontak bertipe 'customer'
  const customers = contacts.filter(c => c.type === 'customer');

  const handleSelectCustomerFromDb = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    const selected = customers.find(c => String(c.id) === selectedId);
    if (selected) {
      setCustomer((prev) => ({
        ...prev,
        name: selected.name,
        wa_number: selected.wa_number || '',
        address: selected.address || ''
      }));
    }
  };

  const handleParseWA = () => {
    const lines = waInput.split('\n');
    let name = '';
    let wa_number = '';
    let address = '';

    lines.forEach((line) => {
      if (line.toLowerCase().startsWith('nama:')) {
        name = line.substring(5).trim();
      } else if (line.toLowerCase().startsWith('no:') || line.toLowerCase().startsWith('wa:')) {
        wa_number = line.substring(line.indexOf(':') + 1).trim();
      } else if (line.toLowerCase().startsWith('alamat:')) {
        address = line.substring(7).trim();
      }
    });

    setCustomer((prev) => ({
      ...prev,
      name: name || prev.name || '',
      wa_number: wa_number || prev.wa_number || '',
      address: address || prev.address || ''
    }));
  };

  return (
    <>
      {/* Pilihan Pelanggan Terdaftar */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
          Pilih Pelanggan Terdaftar (Opsional)
        </label>
        <select
          onChange={handleSelectCustomerFromDb}
          value=""
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            outline: 'none'
          }}
        >
          <option value="">-- Pilih Pelanggan --</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.wa_number ? `(${c.wa_number})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0 8px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Atau Tempel Chat WA</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
      </div>

      <textarea
        style={{ width: '100%', minHeight: '80px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: 'var(--text-primary)', resize: 'vertical', marginBottom: '8px' }}
        placeholder="Tempel teks chat WhatsApp di sini..."
        value={waInput}
        onChange={(e) => setWaInput(e.target.value)}
        rows={3}
      />
      <button className="btn-secondary" onClick={handleParseWA} style={{ marginBottom: '16px', width: '100%', padding: '8px 10px', fontSize: '12px' }}>
        ✨ Parse Otomatis Chat WhatsApp
      </button>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Nama</label>
        <input
          type="text"
          style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          value={customer.name || ''}
          onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Nama Pelanggan"
        />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>No. WhatsApp</label>
        <input
          type="text"
          style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          value={customer.wa_number || ''}
          onChange={(e) => setCustomer(prev => ({ ...prev, wa_number: e.target.value }))}
          placeholder="08123456789"
        />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Alamat</label>
        <input
          type="text"
          style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          value={customer.address || ''}
          onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))}
          placeholder="Alamat Pengiriman"
        />
      </div>
    </>
  );
};
