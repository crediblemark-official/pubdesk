import React, { useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';

const CARDS_CONFIG = [
  { key: 'pelanggan', label: 'Pelanggan', color: '#3b82f6', icon: '👤', module: 'pelanggan' as const, desc: 'Kelola data pelanggan & klien' },
  { key: 'services', label: 'Layanan', color: '#06b6d4', icon: '🛠️', module: 'services' as const, desc: 'Daftar layanan jasa penerbitan' },
  { key: 'books', label: 'Naskah', color: '#a855f7', icon: '📚', module: 'services' as const, desc: 'Data naskah & order buku' },
  { key: 'invoices', label: 'Invoice', color: '#10b981', icon: '🧾', module: 'invoice' as const, desc: 'Riwayat tagihan & kuitansi' },
] as const;

const DashboardMasterData: React.FC = () => {
  const { contacts, services, books, invoices, setActiveModule } = useAppContext();

  const pelanggan = useMemo(() => contacts.filter(c => c.type === 'customer'), [contacts]);

  const counts = useMemo(() => ({
    pelanggan: pelanggan.length,
    services: services.length,
    books: books.length,
    invoices: invoices.length,
  }), [pelanggan, services, books, invoices]);

  const totalData = Object.values(counts).reduce((acc, curr) => acc + curr, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-dark)' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-panel)',
        height: 44,
        boxSizing: 'border-box',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🗃️</span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Dashboard Master Data</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          Kelola entitas data utama pendukung invoice dan operasional penerbitan.
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          borderRadius: '0px',
          overflow: 'hidden',
          boxSizing: 'border-box',
          flexShrink: 0
        }}>
          {CARDS_CONFIG.map(card => {
            const count = counts[card.key];
            return (
              <div
                key={card.key}
                onClick={() => setActiveModule(card.module)}
                style={{
                  flex: '1 1 50%',
                  minWidth: '250px',
                  padding: '20px',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderRight: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                  transition: 'all 0.2s ease-in-out',
                  overflow: 'hidden',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-panel)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '80px',
                  height: '80px',
                  background: `radial-gradient(circle, ${card.color}15 0%, transparent 70%)`,
                  pointerEvents: 'none'
                }} />

                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: card.color
                }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '28px' }}>{card.icon}</span>
                  <span style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: 'var(--text-primary)'
                  }}>
                    {count}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                    {card.label}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                    {card.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          padding: '24px',
          boxSizing: 'border-box'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 20px 0' }}>
            📊 Distribusi Kategori Master Data
          </h3>

          {totalData === 0 ? (
            <div style={{ padding: '40px 0', color: 'var(--text-secondary)' }}>
              Tidak ada data master yang terdaftar.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {CARDS_CONFIG.map(card => {
                const count = counts[card.key];
                const percentage = totalData > 0 ? (count / totalData) * 100 : 0;
                return (
                  <div key={card.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{card.label}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        <strong>{count}</strong> ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: 'var(--bg-panel)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: card.color,
                        borderRadius: '4px',
                        transition: 'width 0.4s ease-in-out'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{
          background: 'var(--bg-card)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxSizing: 'border-box'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
            💡 Informasi Master Data
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
            Halaman Master Data menyimpan entitas inti pendukung pembuatan invoice. Pastikan data pelanggan dan layanan selalu terbarui agar proses tagihan berjalan lancar.
          </p>
          <div style={{
            padding: '12px',
            borderRadius: '0px',
            background: 'var(--bg-panel)',
            borderLeft: '4px solid var(--accent)',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            <strong>Tip:</strong> Data naskah dan invoice dapat diakses dari menu masing-masing di sidebar utama.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMasterData;
