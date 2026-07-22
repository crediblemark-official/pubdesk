import React from 'react';
import { useInvoiceContext } from '../../contexts/InvoiceContext';
import { invoiceTemplates } from '../../data/invoiceTemplates';

import { SettingsFormContext } from './invoice/SettingsFormContext';
import DesignSection from './invoice/DesignSection';
import HeaderSection from './invoice/HeaderSection';
import ContentSection from './invoice/ContentSection';
import NotesSection from './invoice/NotesSection';
import SignatureSection from './invoice/SignatureSection';
import BankSection from './invoice/BankSection';
import ColumnsSection from './invoice/ColumnsSection';
import ContactSection from './invoice/ContactSection';
import PdfFilenameSection from './invoice/PdfFilenameSection';

// Import custom hook modular
import { useInvoiceSettingsForm } from './invoice/useInvoiceSettingsForm';

const InvoiceSettings: React.FC = () => {
  const { setActiveProfileId } = useInvoiceContext();
  const form = useInvoiceSettingsForm();

  const renderAccordionSection = (index: number, title: string, component: React.ReactNode) => {
    const isOpen = form.expandedSection === index;
    return (
      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-card)', marginBottom: '8px' }}>
        <button
          type="button"
          onClick={() => form.setExpandedSection(isOpen ? null : index)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            background: isOpen ? 'var(--bg-panel)' : 'transparent',
            border: 'none',
            color: isOpen ? 'var(--accent)' : 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: '700',
            textAlign: 'left',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            outline: 'none'
          }}
        >
          <span>{title}</span>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{isOpen ? '▲' : '▼'}</span>
        </button>
        {isOpen && (
          <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
            {component}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Form Editor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Panel Kelola Profil */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', paddingBottom: '6px', borderBottom: '1px solid var(--border)', marginBottom: '16px', color: 'var(--text-primary)' }}>
            📁 Kelola Profil Invoice
          </h2>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '12px' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label className="compact-label">Pilih Profil untuk Diedit</label>
              <select
                className="compact-select"
                style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                value={form.isEditingNew ? 'new' : form.selectedProfileId}
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    form.handleCreateNew();
                  } else {
                    form.setIsEditingNew(false);
                    form.setSelectedProfileId(e.target.value);
                    setActiveProfileId(e.target.value);
                  }
                }}
                disabled={form.isEditingNew}
              >
                {form.profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.id === form.selectedProfileId ? '(Aktif)' : ''}
                  </option>
                ))}
                {form.isEditingNew && <option value="new">-- Profil Baru sedang Dibuat --</option>}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {!form.isEditingNew ? (
                <>
                  <button className="btn-primary compact-btn" style={{ height: '32px' }} onClick={form.handleCreateNew}>➕ Buat Baru</button>
                  <button className="btn-danger compact-btn" style={{ height: '32px' }} onClick={form.handleDelete}>🗑️ Hapus</button>
                </>
              ) : (
                <>
                  <button
                    className="btn-secondary compact-btn"
                    style={{ height: '32px' }}
                    onClick={() => form.setShowTemplateModal(true)}
                    title="Isi form dari template yang tersedia"
                  >📋 Dari Template</button>
                  <button className="btn-secondary compact-btn" style={{ height: '32px' }} onClick={form.handleCancelNew}>Batal</button>
                </>
              )}
              <button 
                type="button"
                className="btn-secondary compact-btn" 
                style={{ height: '32px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }} 
                onClick={form.handleExportBackup}
                title="Ekspor Backup JSON"
              >
                📥
              </button>
              <label 
                className="btn-secondary compact-btn" 
                style={{ cursor: 'pointer', height: '32px', width: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, margin: 0 }}
                title="Impor Backup JSON"
              >
                📤
                <input type="file" accept=".json" onChange={form.handleImportBackup} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>

        {/* Form Editor Profil */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', paddingBottom: '6px', borderBottom: '1px solid var(--border)', marginBottom: '16px', color: 'var(--text-primary)' }}>
            ✏️ {form.isEditingNew ? 'Buat Profil Invoice Baru' : `Edit Profil: ${form.profileName}`}
          </h2>

          <SettingsFormContext.Provider value={form}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {renderAccordionSection(1, '1. Desain & Identitas Profil', <DesignSection />)}
              {renderAccordionSection(2, '2. Kop Surat & Judul (Header)', <HeaderSection />)}
              {renderAccordionSection(3, '3. Detail Konten Surat', <ContentSection />)}
              {renderAccordionSection(4, '4. Spesifikasi & Catatan (Notes)', <NotesSection />)}
              {renderAccordionSection(5, '5. Tanda Tangan Penutup', <SignatureSection />)}
              {renderAccordionSection(6, '6. Informasi Rekening Bank', <BankSection />)}
              {renderAccordionSection(7, '7. Kolom Tabel Rincian Invoice', <ColumnsSection />)}
              {renderAccordionSection(8, '8. Pengaturan Footer', <ContactSection />)}
              {renderAccordionSection(9, '9. Format Nama File Export PDF', <PdfFilenameSection />)}
            </div>
          </SettingsFormContext.Provider>

          {/* Tombol Simpan Terakhir */}
          <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '12px' }}>
            <button className="btn-primary compact-btn" style={{ flex: 1, height: '32px', fontSize: '13px', fontWeight: '600' }} onClick={form.handleSave}>
              💾 Simpan Pengaturan Profil
            </button>
            {form.isEditingNew && (
              <button className="btn-secondary compact-btn" style={{ width: '100px', height: '32px' }} onClick={form.handleCancelNew}>
                Batal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Pilih Template */}
      {form.showTemplateModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={() => form.setShowTemplateModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '24px', width: '480px', maxWidth: '90vw',
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                📋 Pilih Template Invoice
              </h2>
              <button
                onClick={() => form.setShowTemplateModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Form profil akan diisi dari template yang dipilih. Anda tetap bisa mengubah field sebelum menyimpan.
            </p>

            {/* Kelompokkan berdasarkan kategori */}
            {Array.from(new Set(invoiceTemplates.map(t => t.category))).map(cat => (
              <div key={cat} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  {cat}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {invoiceTemplates.filter(t => t.category === cat).map(tmpl => (
                    <div
                      key={tmpl.templateId}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 12px', borderRadius: '8px',
                        border: '1px solid var(--border)', background: 'var(--bg-main)'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{tmpl.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{tmpl.description}</div>
                      </div>
                      <button
                        className="btn-primary compact-btn"
                        style={{ height: '30px', whiteSpace: 'nowrap', marginLeft: '12px' }}
                        onClick={() => form.handleLoadTemplate(tmpl.templateId)}
                      >
                        Gunakan
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceSettings;
