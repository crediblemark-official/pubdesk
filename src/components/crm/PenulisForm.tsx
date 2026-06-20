import React, { useState, useEffect } from 'react';
import { Penulis } from '../../types/crm.types';
import { useAppContext } from '../../contexts/AppContext';

interface PenulisFormProps {
  initialData?: Penulis | null;
  onSubmit: (data: Omit<Penulis, 'created_at' | 'id'> & { id?: number }) => Promise<void>;
  onCancel: () => void;
}

const PenulisForm: React.FC<PenulisFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { showToast } = useAppContext();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [waNumber, setWaNumber] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [job, setJob] = useState('');
  const [institution, setInstitution] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [emailValid, setEmailValid] = useState(0);
  const [waValid, setWaValid] = useState(0);
  const [followupStatus, setFollowupStatus] = useState('New');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email || '');
      setWaNumber(initialData.wa_number || '');
      setProvince(initialData.province || '');
      setCity(initialData.city || '');
      setJob(initialData.job || '');
      setInstitution(initialData.institution || '');
      setDataSource(initialData.data_source || '');
      setEmailValid(initialData.email_valid);
      setWaValid(initialData.wa_valid);
      setFollowupStatus(initialData.followup_status || 'New');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setEmail('');
      setWaNumber('');
      setProvince('');
      setCity('');
      setJob('');
      setInstitution('');
      setDataSource('');
      setEmailValid(0);
      setWaValid(0);
      setFollowupStatus('New');
      setNotes('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama penulis tidak boleh kosong!', 'error');
      return;
    }

    onSubmit({
      id: initialData?.id,
      name: name.trim(),
      email: email.trim() || undefined,
      wa_number: waNumber.trim() || undefined,
      province: province.trim() || undefined,
      city: city.trim() || undefined,
      job: job.trim() || undefined,
      institution: institution.trim() || undefined,
      data_source: dataSource.trim() || undefined,
      email_valid: emailValid,
      wa_valid: waValid,
      followup_status: followupStatus,
      notes: notes.trim() || undefined,
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
        {initialData ? '📝 Edit Profil Penulis' : 'Pembuat Profil Penulis Baru'}
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Nama Lengkap Penulis <span style={{ color: '#ff4d4f' }}>*</span>
            </label>
            <input
              type="text"
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Prof. Dr. Budi Utomo"
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                style={inputStyle}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="budi@email.com"
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
                Nomor WhatsApp
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
                WhatsApp Valid / Aktif
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Provinsi
              </label>
              <input
                type="text"
                style={inputStyle}
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="Contoh: Jawa Timur"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Kota / Kabupaten
              </label>
              <input
                type="text"
                style={inputStyle}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Contoh: Surabaya"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Pekerjaan
              </label>
              <input
                type="text"
                style={inputStyle}
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder="Contoh: Dosen, Peneliti"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Institusi / Afiliasi
              </label>
              <input
                type="text"
                style={inputStyle}
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Contoh: Universitas Airlangga"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Sumber Data
              </label>
              <input
                type="text"
                style={inputStyle}
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value)}
                placeholder="Contoh: Pendaftaran Mandiri"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Status Follow-Up
              </label>
              <select
                style={inputStyle}
                value={followupStatus}
                onChange={(e) => setFollowupStatus(e.target.value)}
              >
                <option value="New">Baru (New)</option>
                <option value="Contacted">Sudah Dihubungi</option>
                <option value="Interested">Tertarik</option>
                <option value="Deal">Deal (Naskah Masuk)</option>
                <option value="Rejected">Menolak</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Catatan Tambahan
            </label>
            <textarea
              style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Masukkan informasi tambahan terkait penulis..."
            />
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

export default PenulisForm;
