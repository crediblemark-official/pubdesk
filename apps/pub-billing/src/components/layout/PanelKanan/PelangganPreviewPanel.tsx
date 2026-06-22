import React from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { Button } from '../../../ui/atoms/Button';

const PelangganPreviewPanel: React.FC = () => {
  const { contacts, selectedCustomerId, setRightPanelVisible } = useAppContext();

  const data = contacts.find(c => c.id === selectedCustomerId && c.type === 'customer');

  if (!data) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.5 }}>👥</div>
        <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: 'var(--text-primary)' }}>Pilih Pelanggan</h3>
        <p style={{ margin: 0, fontSize: '14px' }}>Pilih pelanggan dari tabel untuk melihat detail.</p>
      </div>
    );
  }

  const formatTanggal = (iso: string) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-panel)' }}>
      {/* Header */}
      <div style={{ 
        padding: '24px', 
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'sticky',
        top: 0,
        background: 'var(--bg-panel)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>👤</span>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {data.name}
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
              Ditambahkan: {formatTanggal(data.created_at || '')}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setRightPanelVisible(false)}>
            ✕
          </Button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Info Utama */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Informasi Kontak
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Email</div>
              <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '500' }}>
                {data.email || '-'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>No. WhatsApp</div>
              <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '500' }}>
                {data.wa_number || '-'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Alamat</div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', background: 'var(--bg-surface)', padding: '12px', borderRadius: '8px', lineHeight: '1.5' }}>
                {data.address || '-'}
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default PelangganPreviewPanel;
