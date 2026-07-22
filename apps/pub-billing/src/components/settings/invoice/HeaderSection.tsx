import React from 'react';
import { useSettingsForm } from './SettingsFormContext';
import { useAppContext } from '../../../contexts/AppContext';

const HeaderSection: React.FC = () => {
  const {
    companyName,
    setCompanyName,
    companyTagline,
    setCompanyTagline,
    invoiceTitleText,
    setInvoiceTitleText,
    companyLogo,
    setCompanyLogo,
    headerType,
    setHeaderType,
    invoiceNoFormat,
    setInvoiceNoFormat,
    pdfFilenameFormat,
    setPdfFilenameFormat
  } = useSettingsForm();

  const { showToast, rightPanelVisible } = useAppContext();

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: rightPanelVisible ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div className="compact-form-group">
          <label className="compact-label">Nama Perusahaan</label>
          <input
            type="text"
            className="compact-input"
            style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Contoh: PENERBIT KBM INDONESIA"
          />
        </div>

        <div className="compact-form-group">
          <label className="compact-label">Tagline Perusahaan</label>
          <input
            type="text"
            className="compact-input"
            style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            value={companyTagline}
            onChange={(e) => setCompanyTagline(e.target.value)}
            placeholder="Contoh: Media Mitra Edukasi & Literasi"
          />
        </div>

        <div className="compact-form-group">
          <label className="compact-label">Teks Judul Invoice</label>
          <input
            type="text"
            className="compact-input"
            style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            value={invoiceTitleText}
            onChange={(e) => setInvoiceTitleText(e.target.value)}
            placeholder="Contoh: INVOICE"
          />
        </div>

        <div className="compact-form-group">
          <label className="compact-label">Format Nomor Invoice</label>
          <input
            type="text"
            className="compact-input"
            style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            value={invoiceNoFormat}
            onChange={(e) => setInvoiceNoFormat(e.target.value)}
            placeholder="Contoh: KBM/{year}/{month}/{day}/{seq}"
          />
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
            Variabel: {"{year}"}, {"{month}"}, {"{day}"}, {"{seq}"} (no. urut 4 digit)
          </span>
        </div>

        <div style={{ gridColumn: rightPanelVisible ? 'span 1' : 'span 2' }} className="compact-form-group">
          <label className="compact-label" style={{ fontWeight: '600' }}>📄 Format Nama File Export PDF</label>
          <input
            type="text"
            className="compact-input"
            style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: '600' }}
            value={pdfFilenameFormat}
            onChange={(e) => setPdfFilenameFormat(e.target.value)}
            placeholder="Contoh: Invoice {profile_name} - {invoice_no} - {payment_status}"
          />
          <div style={{ marginTop: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Klik chip untuk menyisipkan variabel dinamis:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {[
                { tag: '{profile_name}', label: 'Nama Profil' },
                { tag: '{invoice_no}', label: 'No Invoice' },
                { tag: '{perihal}', label: 'Perihal' },
                { tag: '{customer_name}', label: 'Nama Pelanggan/Penulis' },
                { tag: '{book_title}', label: 'Judul Buku' },
                { tag: '{all_titles}', label: 'Semua Judul' },
                { tag: '{payment_status}', label: 'Status Bayar' },
                { tag: '{date}', label: 'Tgl Invoice' },
                { tag: '{year}', label: 'Tahun' },
                { tag: '{month}', label: 'Bulan' },
                { tag: '{total_amount}', label: 'Total Tagihan' },
                { tag: '{paid_amount}', label: 'Nominal Dibayar' },
                { tag: '{company_name}', label: 'Nama Perusahaan' },
              ].map(chip => (
                <button
                  key={chip.tag}
                  type="button"
                  onClick={() => setPdfFilenameFormat(prev => (prev ? `${prev} - ${chip.tag}` : chip.tag))}
                  style={{
                    padding: '2px 8px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-body)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                  title={`Tambah ${chip.tag}`}
                >
                  + {chip.label} <code style={{ fontSize: '10px', opacity: 0.75 }}>{chip.tag}</code>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="compact-form-group">
          <label className="compact-label">Logo Kop Surat (PNG/JPG/SVG)</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {companyLogo && (
              <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--border)', overflow: 'hidden', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={companyLogo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                <button 
                  type="button" 
                  onClick={() => setCompanyLogo('')} 
                  style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '0 0 0 4px', cursor: 'pointer', fontSize: '8px', padding: '1px 2px' }}
                  title="Hapus Logo"
                >
                  ✕
                </button>
              </div>
            )}
            <div style={{ flex: 1 }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 1024 * 1024) {
                      showToast('Ukuran berkas logo terlalu besar (maksimal 1MB)!', 'error');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setCompanyLogo(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                style={{ display: 'none' }}
                id="logo-upload-input"
              />
              <label 
                htmlFor="logo-upload-input" 
                className="btn-secondary compact-btn" 
                style={{ cursor: 'pointer', textAlign: 'center', display: 'block', height: '32px', lineHeight: '20px' }}
              >
                {companyLogo ? 'Ubah Logo' : 'Unggah Logo'}
              </label>
            </div>
          </div>
        </div>

        <div className="compact-form-group">
          <label className="compact-label">Tipe Kop Surat</label>
          <select
            className="compact-select"
            style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', borderRadius: '6px' }}
            value={headerType}
            onChange={(e) => setHeaderType(e.target.value as any)}
          >
            <option value="logo_text">Logo + Teks</option>
            <option value="logo_only">Hanya Logo</option>
            <option value="text_only">Hanya Teks</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default HeaderSection;
