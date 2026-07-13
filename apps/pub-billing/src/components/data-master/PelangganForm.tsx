import React, { useState, useEffect } from 'react';
import { Contact } from '../../types/contact.types';
import { useAppContext } from '../../contexts/AppContext';
import { useDataMasterContext } from '../../contexts/DataMasterContext';
import { TextField } from '../../ui/atoms/TextField';
import { TextArea } from '../../ui/atoms/TextArea';
import { Button } from '../../ui/atoms/Button';
import { Accordion, AccordionSection } from '../../ui/molecules/Accordion';
import { formatWhatsAppNumber } from '../../utils/format';

interface PelangganFormProps {
  initialData?: Contact | null;
  onSubmit: (data: Omit<Contact, 'created_at' | 'id'> & { id?: number }) => Promise<void>;
  onCancel: () => void;
}

const PelangganForm: React.FC<PelangganFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { showToast } = useAppContext();
  const { penerbit } = useDataMasterContext();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [waNumber, setWaNumber] = useState('');
  const [address, setAddress] = useState('');
  const [contactType, setContactType] = useState<'customer' | 'penulis' | 'both' | 'mitra' | 'customer_mitra'>('customer');
  const [mitraPenerbitId, setMitraPenerbitId] = useState<string>('');
  const [expandedSection, setExpandedSection] = useState<number | null>(1);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email || '');
      setWaNumber(initialData.wa_number || '');
      setAddress(initialData.address || '');
      
      const typeStr = initialData.type || 'customer';
      setContactType(typeStr as any);
      
      if (typeStr === 'customer_mitra' && initialData.institution && initialData.institution.startsWith('penerbit_id:')) {
        setMitraPenerbitId(initialData.institution.replace('penerbit_id:', ''));
      } else {
        setMitraPenerbitId('');
      }
    } else {
      setName('');
      setEmail('');
      setWaNumber('');
      setAddress('');
      setContactType('customer');
      setMitraPenerbitId('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama pelanggan tidak boleh kosong!', 'error');
      return;
    }
    if (contactType === 'customer_mitra' && !mitraPenerbitId) {
      showToast('Pilih penerbit mitra pemilik kontak ini!', 'error');
      return;
    }

    onSubmit({
      id: initialData?.id,
      name: name.trim(),
      email: email.trim() || undefined,
      wa_number: waNumber.trim() ? formatWhatsAppNumber(waNumber.trim()) : undefined,
      address: address.trim() || undefined,
      type: contactType,
      institution: contactType === 'customer_mitra' ? `penerbit_id:${mitraPenerbitId}` : undefined
    });
  };

  return (
    <div className="customer-form" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
        {initialData ? '📝 Edit Data Pelanggan' : '👥 Tambah Pelanggan Baru'}
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Accordion>
          <AccordionSection index={1} title="👤 Informasi Pelanggan" expandedSection={expandedSection} onToggle={setExpandedSection}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <TextField
                label="Nama Lengkap Pelanggan"
                placeholder="Contoh: Budi Utomo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                autoFocus
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <TextField
                  label="Email"
                  type="email"
                  placeholder="budi@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Nomor WhatsApp"
                  placeholder="Contoh: 08123456789"
                  value={waNumber}
                  onChange={(e) => setWaNumber(e.target.value)}
                  fullWidth
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: contactType === 'customer_mitra' ? '1fr 1fr' : '1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Klasifikasi Kontak</label>
                  <select
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '10px 14px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    value={contactType}
                    onChange={(e) => setContactType(e.target.value as any)}
                  >
                    <option value="customer">Pelanggan Umum KBM</option>
                    <option value="penulis">Penulis KBM</option>
                    <option value="both">Penulis & Pelanggan KBM</option>
                    <option value="mitra">Penerbit Mitra (B2B)</option>
                    <option value="customer_mitra">Pelanggan dari Penerbit Mitra</option>
                  </select>
                </div>

                {contactType === 'customer_mitra' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Mitra Penerbit</label>
                    <select
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '10px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      value={mitraPenerbitId}
                      onChange={(e) => setMitraPenerbitId(e.target.value)}
                      required
                    >
                      <option value="">-- Pilih Penerbit Mitra --</option>
                      {penerbit.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <TextArea
                label="Alamat Lengkap"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Contoh: Jl. Diponegoro No. 12, Surabaya, Jawa Timur"
                style={{ height: '80px' }}
                fullWidth
              />
            </div>
          </AccordionSection>
        </Accordion>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button type="submit" variant="primary" style={{ flex: 1 }} size="lg">
            💾 Simpan Data
          </Button>
          <Button type="button" variant="secondary" style={{ flex: 1 }} size="lg" onClick={onCancel}>
            ❌ Batal
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PelangganForm;
