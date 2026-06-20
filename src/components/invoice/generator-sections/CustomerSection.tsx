import React, { useState } from 'react';
import { useInvoiceContext } from '../../../contexts/InvoiceContext';

export const CustomerSection: React.FC = () => {
  const { customer, setCustomer } = useInvoiceContext();
  const [waInput, setWaInput] = useState('');

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
      <textarea
        style={{ width: '100%', minHeight: '80px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: 'var(--text-primary)', resize: 'vertical', marginBottom: '8px' }}
        placeholder="Tempel teks chat WhatsApp di sini..."
        value={waInput}
        onChange={(e) => setWaInput(e.target.value)}
        rows={3}
      />
      <button className="btn-secondary" onClick={handleParseWA} style={{ marginBottom: '16px' }}>
        ✨ Parse Otomatis
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
