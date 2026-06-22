import React from 'react';
import { formatPrice } from '../../../utils/format';

interface InsightPanelProps {
  selectedMetric: string | null;
  invoices: any[];
  onNavigateToManager: (invoiceId: number) => void;
}

// Judul panel per metrik
const getMetricTitle = (metric: string): string => {
  switch (metric) {
    case 'lunas': return '🟢 Pembayaran Lunas';
    case 'belum_lunas': return '🔴 Piutang Belum Lunas';
    case 'dp': return '🔵 Pembayaran Uang Muka (DP)';
    case 'bermasalah': return '🟡 Pembayaran Bermasalah';
    case 'total':
    default:
      return '📊 Ringkasan Total Invoice';
  }
};

// Deskripsi per metrik
const getMetricDescription = (metric: string): string => {
  switch (metric) {
    case 'lunas':
      return 'Dana dari invoice ini telah masuk ke rekening usaha Anda sepenuhnya. Transaksi selesai dan catatan keuangan bersih.';
    case 'belum_lunas':
      return 'Invoice ini merupakan piutang aktif yang belum dibayar oleh pelanggan. Disarankan untuk segera mengirimkan pengingat tagihan.';
    case 'dp':
      return 'Invoice ini telah dibayar sebagian oleh pelanggan sebagai uang muka (Down Payment).';
    case 'bermasalah':
      return 'Invoice ini ditandai bermasalah (misalnya ada sengketa, keterlambatan kronis, atau pembatalan sepihak).';
    case 'total':
    default:
      return 'Menampilkan seluruh invoice yang terbit di sistem. Analisis ini mencakup omzet kotor baik yang sudah cair maupun piutang.';
  }
};

// Parse metadata invoice dari field file_path (JSON string)
const parseInvoiceMeta = (invoice: any) => {
  try {
    if (invoice.file_path) return JSON.parse(invoice.file_path);
  } catch {}
  return { paymentStatus: 'BERMASALAH', invoiceNo: '-', customerName: 'Umum', invoiceDate: '-' };
};

/**
 * Panel kanan untuk modul Invoice Insight.
 * Menampilkan daftar invoice berdasarkan metrik yang dipilih dan total akumulasinya.
 */
const InsightPanel: React.FC<InsightPanelProps> = ({
  selectedMetric,
  invoices,
  onNavigateToManager,
}) => {
  const metric = selectedMetric || 'total';

  const filtered = invoices.filter(inv => {
    const meta = parseInvoiceMeta(inv);
    const status = meta.paymentStatus || 'BERMASALAH';

    if (metric === 'lunas') return status === 'LUNAS';
    if (metric === 'belum_lunas') return status === 'BELUM LUNAS';
    if (metric === 'dp') return status === 'DP';
    if (metric === 'bermasalah') return status === 'BERMASALAH';
    return true; // total
  });

  const totalValue = filtered.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-panel)', padding: '20px', overflowY: 'auto' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
        {getMetricTitle(metric)}
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: '1.4' }}>
        {getMetricDescription(metric)}
      </p>

      {/* Akumulasi nominal */}
      <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Akumulasi Nominal:</span>
        <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{formatPrice(totalValue)}</strong>
      </div>

      {/* Daftar invoice */}
      <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Daftar Invoice ({filtered.length})
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '13px' }}>
            Tidak ada invoice dalam kategori ini.
          </div>
        ) : (
          filtered.map(inv => {
            const meta = parseInvoiceMeta(inv);
            return (
              <div
                key={inv.id}
                onClick={() => onNavigateToManager(inv.id)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-panel)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-card)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{meta.invoiceNo || 'DRAF'}</strong>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>{formatPrice(inv.total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>{meta.customerName || 'Umum'}</span>
                  <span>{meta.invoiceDate || new Date(inv.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InsightPanel;
