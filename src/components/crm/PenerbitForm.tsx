import React, { useState, useEffect } from 'react';
import { Penerbit } from '../../types/crm.types';
import { useAppContext } from '../../contexts/AppContext';

interface PenerbitFormProps {
  initialData?: Penerbit | null;
  onSubmit: (data: Omit<Penerbit, 'created_at' | 'id'> & { id?: number }) => Promise<void>;
  onCancel: () => void;
}

const PenerbitForm: React.FC<PenerbitFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { showToast } = useAppContext();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [waNumber, setWaNumber] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [emailValid, setEmailValid] = useState(0);
  const [waValid, setWaValid] = useState(0);
  const [cooperationStatus, setCooperationStatus] = useState('Aktif');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCity(initialData.city || '');
      setEmail(initialData.email || '');
      setWaNumber(initialData.wa_number || '');
      setInstagram(initialData.instagram || '');
      setFacebook(initialData.facebook || '');
      setLinkedin(initialData.linkedin || '');
      setTwitter(initialData.twitter || '');
      setTiktok(initialData.tiktok || '');
      setEmailValid(initialData.email_valid);
      setWaValid(initialData.wa_valid);
      setCooperationStatus(initialData.cooperation_status || 'Aktif');
    } else {
      setName('');
      setCity('');
      setEmail('');
      setWaNumber('');
      setInstagram('');
      setFacebook('');
      setLinkedin('');
      setTwitter('');
      setTiktok('');
      setEmailValid(0);
      setWaValid(0);
      setCooperationStatus('Aktif');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama penerbit tidak boleh kosong!', 'error');
      return;
    }

    onSubmit({
      id: initialData?.id,
      name: name.trim(),
      city: city.trim() || undefined,
      email: email.trim() || undefined,
      wa_number: waNumber.trim() || undefined,
      instagram: instagram.trim() || undefined,
      facebook: facebook.trim() || undefined,
      linkedin: linkedin.trim() || undefined,
      twitter: twitter.trim() || undefined,
      tiktok: tiktok.trim() || undefined,
      email_valid: emailValid,
      wa_valid: waValid,
      cooperation_status: cooperationStatus,
    });
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    outline: 'none'
  };

  return (
    <div className="customer-form" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
        {initialData ? '📝 Edit Profil Penerbit' : 'Pembuat Profil Penerbit Baru'}
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Nama Penerbit / Penerbitan <span style={{ color: '#ff4d4f' }}>*</span>
            </label>
            <input
              type="text"
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: PT. Aksara Nusantara"
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Kota Asal Penerbit
              </label>
              <input
                type="text"
                style={inputStyle}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Contoh: Yogyakarta"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Status Kerja Sama
              </label>
              <select
                style={inputStyle}
                value={cooperationStatus}
                onChange={(e) => setCooperationStatus(e.target.value)}
              >
                <option value="Aktif">Aktif</option>
                <option value="Negosiasi">Dalam Negosiasi</option>
                <option value="Pasif">Pasif</option>
                <option value="Berhenti">Berhenti</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Email Resmi
              </label>
              <input
                type="email"
                style={inputStyle}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="redaksi@penerbit.com"
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={emailValid === 1}
                  onChange={(e) => setEmailValid(e.target.checked ? 1 : 0)}
                />
                Email Valid / Aktif
              </label>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Nomor WhatsApp PIC
              </label>
              <input
                type="text"
                style={inputStyle}
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                placeholder="Contoh: 08123456789"
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={waValid === 1}
                  onChange={(e) => setWaValid(e.target.checked ? 1 : 0)}
                />
                WhatsApp Valid / PIC Aktif
              </label>
            </div>
          </div>

          <h3 style={{ fontSize: '14px', fontWeight: '600', marginTop: '10px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
            Media Sosial & Kontak Digital
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Instagram
              </label>
              <input
                type="text"
                style={inputStyle}
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@username_penerbit"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Facebook Page
              </label>
              <input
                type="text"
                style={inputStyle}
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="Nama Halaman Facebook"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                LinkedIn Company Page
              </label>
              <input
                type="text"
                style={inputStyle}
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="nama-perusahaan"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                TikTok
              </label>
              <input
                type="text"
                style={inputStyle}
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="@tiktok_penerbit"
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px', fontSize: '14px', fontWeight: '600' }}>
            {initialData ? '💾 Perbarui & Catat' : '💾 Simpan & Catat'}
          </button>
          <button type="button" className="btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '14px', fontWeight: '600' }} onClick={onCancel}>
            ❌ Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default PenerbitForm;
