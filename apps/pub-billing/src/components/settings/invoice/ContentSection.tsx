import React from 'react';
import { useSettingsForm } from './SettingsFormContext';
import { useAppContext } from '../../../contexts/AppContext';

const ContentSection: React.FC = () => {
  const {
    salamPembuka,
    setSalamPembuka,
    salamPenutup,
    setSalamPenutup,
  } = useSettingsForm();

  const { rightPanelVisible } = useAppContext();

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: rightPanelVisible ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div style={{ gridColumn: rightPanelVisible ? 'span 1' : 'span 2' }} className="compact-form-group">
          <label className="compact-label">Salam Pembuka Bawaan</label>
          <textarea
            className="compact-textarea"
            style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', minHeight: '42px', resize: 'vertical' }}
            value={salamPembuka}
            onChange={(e) => setSalamPembuka(e.target.value)}
            placeholder="Teks salam pembuka..."
            rows={2}
          />
        </div>

        <div style={{ gridColumn: rightPanelVisible ? 'span 1' : 'span 2' }} className="compact-form-group">
          <label className="compact-label">Salam Penutup Bawaan</label>
          <textarea
            className="compact-textarea"
            style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', minHeight: '42px', resize: 'vertical' }}
            value={salamPenutup}
            onChange={(e) => setSalamPenutup(e.target.value)}
            placeholder="Teks salam penutup..."
            rows={2}
          />
        </div>
      </div>
    </>
  );
};

export default ContentSection;
