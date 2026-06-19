import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import InvoicePreview from '../invoice/InvoicePreview';

const PanelKanan: React.FC = () => {
  const { appState } = useAppContext();

  // Render preview sesuai module yang aktif
  const renderPreview = () => {
    switch (appState.activeModule) {
      case 'invoice':
        return <InvoicePreview />;
      case 'extractor':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#2d2720', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center' }}>Preview Extractor akan segera tersedia</p>
          </div>
        );
      case 'files':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#2d2720', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center' }}>Preview Files akan segera tersedia</p>
          </div>
        );
      case 'ledger':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#2d2720', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center' }}>Preview Ledger akan segera tersedia</p>
          </div>
        );
      case 'settings':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#2d2720', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center' }}>Preview Settings akan segera tersedia</p>
          </div>
        );
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#2d2720', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center' }}>Pilih menu untuk melihat preview yang relevan</p>
          </div>
        );
    }
  };

  return renderPreview();
};

export default PanelKanan;
