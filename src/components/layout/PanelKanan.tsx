import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useFileState } from '../../contexts/FileContext';
import { useInvoiceContext } from '../../contexts/InvoiceContext';
import InvoicePreview from '../invoice/InvoicePreview';
import FilePreviewPanel from './PanelKanan/FilePreviewPanel';
import ServicePreviewPanel from './PanelKanan/ServicePreviewPanel';
import InsightPanel from './PanelKanan/InsightPanel';
import PenulisPreviewPanel from './PanelKanan/PenulisPreviewPanel';
import PenerbitPreviewPanel from './PanelKanan/PenerbitPreviewPanel';
import NaskahPreviewPanel from './PanelKanan/NaskahPreviewPanel';
import TimPreviewPanel from './PanelKanan/TimPreviewPanel';
import LegalitasPreviewPanel from './PanelKanan/LegalitasPreviewPanel';
import PelangganPreviewPanel from './PanelKanan/PelangganPreviewPanel';
import TaskPreviewPanel from './PanelKanan/TaskPreviewPanel';

/**
 * PanelKanan — orchestrator panel pratinjau di sisi kanan layar.
 * Mendelegasikan rendering ke sub-panel berdasarkan modul aktif.
 * Sub-panel ada di folder PanelKanan/:
 *   - FilePreviewPanel   → Smart Folders & Manajemen Invoice
 *   - ServicePreviewPanel → Layanan / Settings > Services
 *   - InsightPanel        → Invoice Insight
 *   - PenulisPreviewPanel  → Lead Penulis (CRM)
 */
const SettingsHelpPanel: React.FC<{ tab: string }> = ({ tab }) => {
  const getHelpContent = () => {
    switch (tab) {
      case 'local-folders':
        return {
          icon: '📁',
          title: 'Pemantauan Folder Lokal',
          desc: 'Aplikasi memantau folder lokal komputer Anda secara offline-first.',
          steps: [
            'Daftarkan folder dari komputer Anda untuk mulai memantau.',
            'Setiap berkas PDF, Excel, atau gambar yang ditambahkan akan otomatis diindeks.',
            'Anda dapat mencari, memfilter, dan mengelola berkas tersebut melalui menu Smart Folders.',
            'Proses berjalan di latar belakang secara offline tanpa membebani memori.'
          ]
        };
      case 'google-drive':
        return {
          icon: '☁️',
          title: 'Sinkronisasi Google Drive',
          desc: 'Hubungkan satu atau beberapa akun Google Drive untuk mencadangkan berkas.',
          steps: [
            'Gunakan tombol "Hubungkan Akun" untuk melakukan login via browser.',
            'Data folder Google Drive akan dipetakan ke dalam database lokal.',
            'Disarankan menyetel ID Folder Induk agar aplikasi hanya memantau folder kerja tertentu.',
            'Gunakan tombol "Sinkronisasi Sekarang" untuk memperbarui daftar berkas secara manual.'
          ]
        };
      case 'google-apps-script':
        return {
          icon: '☁️',
          title: 'Integrasi Google Sheets',
          desc: 'Gunakan Google Apps Script sebagai jembatan sinkronisasi database cloud.',
          steps: [
            'Salin script draf yang disediakan di folder docs/google-apps-script/.',
            'Tempel di editor Apps Script pada Google Sheets Anda.',
            'Deploy sebagai Web App dengan akses publik ("Anyone").',
            'Simpan URL Web App ke setelan di sebelah kiri untuk mengaktifkan sinkronisasi otomatis.'
          ]
        };
      case 'data-reset':
        return {
          icon: '🎨',
          title: 'Kustomisasi & Manajemen Data',
          desc: 'Atur visual identitas aplikasi serta pemeliharaan database SQLite.',
          steps: [
            'Ubah Logo dan Nama Penerbit untuk menyesuaikan layar splash dan halaman login.',
            'Gunakan "Export ke Excel" untuk mengunduh salinan database penuh.',
            'Gunakan "Muat Sample" untuk mengisi data naskah dan workflow contoh untuk demo.',
            'Menu "Reset Data" menghapus seluruh tugas tanpa memengaruhi master data.'
          ]
        };
      default:
        return {
          icon: '⚙️',
          title: 'Pengaturan Aplikasi',
          desc: 'Kelola seluruh konfigurasi aplikasi dari tab menu di atas.',
          steps: [
            'Pilih tab pengaturan yang ingin Anda sesuaikan.',
            'Perubahan disimpan secara lokal di komputer Anda.'
          ]
        };
    }
  };

  const content = getHelpContent();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-panel)',
      padding: '24px',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      color: 'var(--text-primary)',
      overflowY: 'auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '20px' }}>
        <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>{content.icon}</span>
        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>{content.title}</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>{content.desc}</p>
      </div>
      
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Petunjuk & Panduan</strong>
        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12.5px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.5' }}>
          {content.steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const PanelKanan: React.FC = () => {
  const {
    appState,
    services,
    selectedServiceId,
    selectedInsightMetric,
    invoices,
    setActiveModule,
    selectedPenulisId,
    selectedPenerbitId,
    selectedNaskahId,
    selectedTimId,
    activeSettingsTab,
  } = useAppContext();

  const { files, selectedFileId, setSelectedFileId, setRightPanelVisible } = useFileState();
  const { tempPreviewProfile, activeProfile } = useInvoiceContext();

  const { activeModule } = appState;

  switch (activeModule) {
    case 'settings':
      switch (activeSettingsTab) {
        case 'invoice':
          return <InvoicePreview previewProfile={tempPreviewProfile || activeProfile} />;
        default:
          return <SettingsHelpPanel tab={activeSettingsTab} />;
      }

    // Generator invoice — preview langsung dari context form
    case 'invoice':
      return <InvoicePreview />;

    // Manajemen berkas dan manajemen invoice — panel preview berkas
    case 'files':
    case 'invoice-manager':
      return <FilePreviewPanel selectedFileId={selectedFileId} />;

    case 'invoice-parent':
    case 'invoice-insight':
      return (
        <InsightPanel
          selectedMetric={selectedInsightMetric}
          invoices={invoices}
          onNavigateToManager={(invoiceId) => {
            const fileEntry = files.find(f => f.type === 'invoice' && f.version_label === String(invoiceId));
            if (fileEntry) {
              setSelectedFileId(fileEntry.id || null);
              setRightPanelVisible(true);
            }
            setActiveModule('invoice-manager');
          }}
        />
      );

    // Modul layanan — preview layanan terpilih
    case 'services':
      return <ServicePreviewPanel serviceId={selectedServiceId} services={services} />;



    // Modul Kontak terpadu (Penulis + Pelanggan)
    case 'kontak':
    case 'penulis':
      return <PenulisPreviewPanel penulisId={selectedPenulisId} />;

    case 'penerbit':
      return <PenerbitPreviewPanel penerbitId={selectedPenerbitId} />;

    case 'naskah':
      return <NaskahPreviewPanel naskahId={selectedNaskahId} />;

    case 'tim':
      return <TimPreviewPanel timId={selectedTimId} />;

    case 'legalitas':
      return <LegalitasPreviewPanel />;

    case 'pelanggan':
      return <PelangganPreviewPanel />;

    case 'pekerjaan-saya':
    case 'produksi-board':
    case 'produksi-list':
    case 'produksi-kendala':
    case 'produksi-approval':
    case 'produksi-timeline':
      return <TaskPreviewPanel />;

    default:
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-panel)', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center' }}>
            Pilih menu untuk melihat preview yang relevan
          </p>
        </div>
      );
  }
};

export { PanelKanan };
export default PanelKanan;

