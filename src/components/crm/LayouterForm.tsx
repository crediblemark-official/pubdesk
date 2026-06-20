import React, { useState, useEffect } from 'react';
import { Layouter } from '../../types/crm.types';
import { useAppContext } from '../../contexts/AppContext';

interface LayouterFormProps {
  initialData?: Layouter | null;
  onSubmit: (data: Omit<Layouter, 'created_at' | 'id'> & { id?: number }) => Promise<void>;
  onCancel: () => void;
}

const LayouterForm: React.FC<LayouterFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { showToast } = useAppContext();

  const [name, setName] = useState('');
  const [role, setRole] = useState('Layouter Utama');
  const [isActive, setIsActive] = useState(1);
  const [weeklyTarget, setWeeklyTarget] = useState(3);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setRole(initialData.role);
      setIsActive(initialData.is_active);
      setWeeklyTarget(initialData.weekly_target);
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setRole('Layouter Utama');
      setIsActive(1);
      setWeeklyTarget(3);
      setNotes('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama layouter tidak boleh kosong!', 'error');
      return;
    }

    onSubmit({
      id: initialData?.id,
      name: name.trim(),
      role: role,
      is_active: isActive,
      weekly_target: weeklyTarget,
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
        {initialData ? '📝 Edit Profil Layouter' : 'Pembuat Profil Layouter Baru'}
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Nama Lengkap Layouter <span style={{ color: '#ff4d4f' }}>*</span>
            </label>
            <input
              type="text"
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Hana Salsabila"
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Peran / Jabatan Layouter
              </label>
              <select
                style={inputStyle}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Layouter Utama">Layouter Utama</option>
                <option value="Desainer Cover">Desainer Cover</option>
                <option value="Editor/Korektor">Editor/Korektor</option>
                <option value="Layouter Magang">Layouter Magang</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Target Kerja Mingguan (Naskah)
              </label>
              <input
                type="number"
                style={inputStyle}
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginTop: '8px' }}>
              <input
                type="checkbox"
                checked={isActive === 1}
                onChange={(e) => setIsActive(e.target.checked ? 1 : 0)}
              />
              Anggota Aktif (Siap Menerima Tugas Layout/Desain)
            </label>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Keahlian Spesialis & Catatan
            </label>
            <textarea
              style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Ahli desain cover novel fantasi, mahir Adobe InDesign..."
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

export default LayouterForm;
