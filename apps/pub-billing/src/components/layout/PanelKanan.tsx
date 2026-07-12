import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useFileState } from '../../contexts/FileContext';
import { useInvoiceContext } from '../../contexts/InvoiceContext';
import InvoicePreview from '../invoice/InvoicePreview';
import FilePreviewPanel from './PanelKanan/FilePreviewPanel';
import ServicePreviewPanel from './PanelKanan/ServicePreviewPanel';
import InsightPanel from './PanelKanan/InsightPanel';
import PelangganPreviewPanel from './PanelKanan/PelangganPreviewPanel';

const PanelKanan: React.FC = () => {
  const {
    appState,
    services,
    selectedServiceId,
    selectedInsightMetric,
    invoices,
    setActiveModule,
    showToast,
  } = useAppContext();

  const { files, selectedFileId, setSelectedFileId, setRightPanelVisible } = useFileState();
  const { invoiceNo, activeProfile } = useInvoiceContext();

  const { activeModule } = appState;

  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
  const handleZoomReset = () => setZoomLevel(1);

  const handleDownloadPdf = async () => {
    try {
      const { generateInvoicePDFBytes, downloadPDFBytes } = await import('../../utils/pdfGenerator');
      const bytes = await generateInvoicePDFBytes('panel-kanan-preview');
      const defaultFileName = `Invoice ${activeProfile?.name || 'Invoice'} - ${invoiceNo ? invoiceNo.replace(/\//g, '∕') : 'DRAF'}.pdf`;
      const saved = await downloadPDFBytes(bytes, defaultFileName);
      if (saved) {
        showToast('PDF berhasil diunduh', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal mengunduh PDF', 'error');
    }
  };

  const renderInvoicePreview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-panel)' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <InvoicePreview id="panel-kanan-preview" hideToolbar externalZoom={zoomLevel} />
      </div>
      <div style={{ flexShrink: 0, padding: '6px 12px', background: 'var(--bg-panel)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', gap: '6px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button onClick={handleZoomOut} title="Perkecil" style={{ width: '26px', height: '26px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>
          <button onClick={handleZoomReset} title="Reset zoom" style={{ width: '26px', height: '26px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>⟲</button>
          <button onClick={handleZoomIn} title="Perbesar" style={{ width: '26px', height: '26px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '36px', textAlign: 'center', fontWeight: '600' }}>{Math.round(zoomLevel * 100)}%</span>
        </div>
        <button onClick={handleDownloadPdf} className="btn-primary compact-btn" style={{ height: '26px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '0 10px' }}>
          ⬇ Download PDF
        </button>
      </div>
    </div>
  );

  switch (activeModule) {
    case 'settings-invoice':
      return renderInvoicePreview();

    case 'invoice':
      return renderInvoicePreview();

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

    case 'services':
      return <ServicePreviewPanel serviceId={selectedServiceId} services={services} />;

    case 'pelanggan':
      return <PelangganPreviewPanel />;

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
