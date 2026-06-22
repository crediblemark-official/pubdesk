import React from 'react';
import { useSettingsForm } from './SettingsFormContext';
import { useAppContext } from '../../../contexts/AppContext';

const ContactSection: React.FC = () => {
  const {
    companyWebsite,
    setCompanyWebsite,
    companyEmail,
    setCompanyEmail,
    companyYoutube,
    setCompanyYoutube,
    companyInstagram,
    setCompanyInstagram,
    companyPhone,
    setCompanyPhone,
    showCompanyContact,
    setShowCompanyContact
  } = useSettingsForm();

  const { rightPanelVisible } = useAppContext();

  return (
    <>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          id="showCompanyContact"
          checked={showCompanyContact}
          onChange={(e) => setShowCompanyContact(e.target.checked)}
          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }}
        />
        <label htmlFor="showCompanyContact" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', cursor: 'pointer' }}>
          Tampilkan Informasi Kontak di Invoice (di bawah detail bank)
        </label>
      </div>

      {showCompanyContact && (
        <div style={{ display: 'grid', gridTemplateColumns: rightPanelVisible ? '1fr' : '1fr 1fr', gap: '12px' }}>
          <div className="compact-form-group">
            <label className="compact-label">Website Perusahaan</label>
            <input
              type="text"
              className="compact-input"
              style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              placeholder="Contoh: penerbitkbm.com | penerbitbukumurah.com"
            />
          </div>

          <div className="compact-form-group">
            <label className="compact-label">Email Perusahaan</label>
            <input
              type="email"
              className="compact-input"
              style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              placeholder="Contoh: naskah@penerbitkbm.com"
            />
          </div>

          <div className="compact-form-group">
            <label className="compact-label">Youtube</label>
            <input
              type="text"
              className="compact-input"
              style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              value={companyYoutube}
              onChange={(e) => setCompanyYoutube(e.target.value)}
              placeholder="Contoh: Penerbit KBM Sastrabook"
            />
          </div>

          <div className="compact-form-group">
            <label className="compact-label">Instagram</label>
            <input
              type="text"
              className="compact-input"
              style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              value={companyInstagram}
              onChange={(e) => setCompanyInstagram(e.target.value)}
              placeholder="Contoh: @penerbit.sastrabook / @penerbit.kbmindonesia"
            />
          </div>

          <div className="compact-form-group" style={{ gridColumn: rightPanelVisible ? 'span 1' : 'span 2' }}>
            <label className="compact-label">Nomor Telepon / Kontak</label>
            <input
              type="text"
              className="compact-input"
              style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
              placeholder="Contoh: 0813 5751 7526"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ContactSection;
