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
    setShowCompanyContact,
    showFooterBranding,
    setShowFooterBranding,
    companyFooterName,
    setCompanyFooterName,
    companyFooterTagline,
    setCompanyFooterTagline
  } = useSettingsForm();

  const { rightPanelVisible } = useAppContext();

  return (
    <>
      {/* BAGIAN A: BRANDING FOOTER (KIRI) */}
      <h3 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        📢 Branding Footer (Sisi Kiri)
      </h3>
      
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          id="showFooterBranding"
          checked={showFooterBranding}
          onChange={(e) => setShowFooterBranding(e.target.checked)}
          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }}
        />
        <label htmlFor="showFooterBranding" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', cursor: 'pointer' }}>
          Tampilkan Nama & Tagline Lembaga di Footer
        </label>
      </div>

      {showFooterBranding && (
        <div style={{ display: 'grid', gridTemplateColumns: rightPanelVisible ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div className="compact-form-group">
            <label className="compact-label">Nama Lembaga di Footer (Kustom)</label>
            <input
              type="text"
              className="compact-input"
              style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              value={companyFooterName}
              onChange={(e) => setCompanyFooterName(e.target.value)}
              placeholder="Kosongkan untuk menyamakan dengan Kop Surat"
            />
          </div>

          <div className="compact-form-group">
            <label className="compact-label">Tagline Lembaga di Footer (Kustom)</label>
            <input
              type="text"
              className="compact-input"
              style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              value={companyFooterTagline}
              onChange={(e) => setCompanyFooterTagline(e.target.value)}
              placeholder="Kosongkan untuk menyamakan dengan Kop Surat"
            />
          </div>
        </div>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />

      {/* BAGIAN B: KONTAK FOOTER (SISI KANAN) */}
      <h3 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        📞 Informasi Kontak Footer (Sisi Kanan)
      </h3>

      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          id="showCompanyContact"
          checked={showCompanyContact}
          onChange={(e) => setShowCompanyContact(e.target.checked)}
          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }}
        />
        <label htmlFor="showCompanyContact" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', cursor: 'pointer' }}>
          Tampilkan Informasi Kontak di Footer
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
              placeholder="Contoh: penerbitkbm.com"
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
              placeholder="Contoh: @penerbitkbm"
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
              placeholder="Contoh: 081995100401"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ContactSection;
