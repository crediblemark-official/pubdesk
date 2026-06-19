import React, { useState } from 'react';
import InvoiceSettings from './InvoiceSettings';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoice' | 'general'>('invoice');

  return (
    <div className="settings-module" style={{ display: 'flex', minHeight: '100%', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      {/* Sidebar Kiri */}
      <div style={{
        width: '260px',
        borderRight: '1px solid var(--border)',
        background: 'var(--bg-panel)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flexShrink: 0
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', paddingLeft: '8px', color: 'var(--text-primary)' }}>
          ⚙️ Pengaturan
        </h1>
        
        <button
          onClick={() => setActiveTab('invoice')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'invoice' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'invoice' ? '#ffffff' : 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          📄 Pengaturan Invoice
        </button>

        <button
          onClick={() => setActiveTab('general')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'general' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'general' ? '#ffffff' : 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          ⚙️ Pengaturan Umum
        </button>
      </div>

      {/* Area Konten Utama Sebelah Kanan */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto', height: '100vh' }}>
        {activeTab === 'invoice' ? (
          <InvoiceSettings />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            padding: '40px'
          }}>
            <span style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</span>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Pengaturan Umum
            </h2>
            <p style={{ fontSize: '14px', maxWidth: '360px', margin: 0 }}>
              Modul pengaturan dasar aplikasi. Fitur ini akan dikembangkan pada rilis berikutnya.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
