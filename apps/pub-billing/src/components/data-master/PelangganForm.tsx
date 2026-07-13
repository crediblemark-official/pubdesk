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
  const [isAuthor, setIsAuthor] = useState(false);
  const [isMitra, setIsMitra] = useState(false);
  const [mitraPenerbitId, setMitraPenerbitId] = useState<string>('');
  const [expandedSection, setExpandedSection] = useState<number | null>(1);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email || '');
      setWaNumber(initialData.wa_number || '');
      setAddress(initialData.address || '');
      
      const typeStr = initialData.type || 'customer';
      setIsAuthor(typeStr === 'penulis' || typeStr === 'both');
      
      const isMitraType = typeStr === 'customer_mitra' || typeStr === 'mitra';
      setIsMitra(isMitraType);
      
      if (isMitraType && initialData.institution && initialData.institution.startsWith('penerbit_id:')) {
        setMitraPenerbitId(initialData.institution.replace('penerbit_id:', ''));
      } else {
        setMitraPenerbitId('');
      }
    } else {
      setName('');
      setEmail('');
      setWaNumber('');
      setAddress('');
      setIsAuthor(false);
      setIsMitra(false);
      setMitraPenerbitId('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama pelanggan tidak boleh kosong!', 'error');
      return;
    }
    if (isMitra && !mitraPenerbitId) {
      showToast('Pilih penerbit mitra pemilik kontak ini!', 'error');
      return;
    }

    const typeStr = isMitra ? 'customer_mitra' : (isAuthor ? 'both' : 'customer');

    onSubmit({
      id: initialData?.id,
      name: name.trim(),
      email: email.trim() || undefined,
      wa_number: waNumber.trim() ? formatWhatsAppNumber(waNumber.trim()) : undefined,
      address: address.trim() || undefined,
      type: typeStr,
      institution: isMitra ? `penerbit_id:${mitraPenerbitId}` : undefined
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

              <div style={{ display: 'grid', gridTemplateColumns: isMitra ? '1fr 1fr' : '1fr', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={isAuthor}
                      onChange={(e) => setIsAuthor(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    Juga merupakan Penulis Naskah
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={isMitra}
                      onChange={(e) => setIsMitra(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    Kontak Mitra B2B / Satuan Penerbit Terpadu
                  </label>
                </div>

                {isMitra && (
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
