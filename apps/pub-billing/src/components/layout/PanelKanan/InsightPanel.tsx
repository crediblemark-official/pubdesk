import React, { useMemo } from 'react';
import { formatPrice } from '../../../utils/format';
import { useAppContext } from '../../../contexts/AppContext';

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
  const { setSelectedInsightMetric } = useAppContext();
  const metric = selectedMetric || 'total';

  // Hitung statistik keseluruhan untuk Donut Chart
  const stats = useMemo(() => {
    let lunas = 0;
    let belumLunas = 0;
    let dp = 0;
    let bermasalah = 0;
    let countLunas = 0;
    let countBelumLunas = 0;
    let countDp = 0;
    let countBermasalah = 0;

    invoices.forEach(inv => {
      const meta = parseInvoiceMeta(inv);
      const status = meta.paymentStatus || 'BERMASALAH';
      if (status === 'LUNAS') {
        lunas += inv.total;
        countLunas++;
      } else if (status === 'BELUM LUNAS') {
        belumLunas += inv.total;
        countBelumLunas++;
      } else if (status === 'DP') {
        dp += inv.total;
        countDp++;
      } else {
        bermasalah += inv.total;
        countBermasalah++;
      }
    });

    const grandTotal = lunas + belumLunas + dp + bermasalah;
    return {
      lunas,
      belumLunas,
      dp,
      bermasalah,
      countLunas,
      countBelumLunas,
      countDp,
      countBermasalah,
      grandTotal,
      totalCount: invoices.length
    };
  }, [invoices]);

  // Persentase nominal
  const percentLunas = stats.grandTotal > 0 ? (stats.lunas / stats.grandTotal) * 100 : 0;
  const percentBelumLunas = stats.grandTotal > 0 ? (stats.belumLunas / stats.grandTotal) * 100 : 0;
  const percentDp = stats.grandTotal > 0 ? (stats.dp / stats.grandTotal) * 100 : 0;
  const percentBermasalah = stats.grandTotal > 0 ? (stats.bermasalah / stats.grandTotal) * 100 : 0;

  // Visualisasi lingkaran SVG
  const radius = 35;
  const circumference = 2 * Math.PI * radius; // ~219.91

  const strokeLunas = (percentLunas / 100) * circumference;
  const strokeBelumLunas = (percentBelumLunas / 100) * circumference;
  const strokeDp = (percentDp / 100) * circumference;
  const strokeBermasalah = (percentBermasalah / 100) * circumference;

  const rotateBelumLunas = percentLunas * 3.6;
  const rotateDp = (percentLunas + percentBelumLunas) * 3.6;
  const rotateBermasalah = (percentLunas + percentBelumLunas + percentDp) * 3.6;

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

  const handleLegendClick = (m: 'total' | 'lunas' | 'belum_lunas' | 'dp' | 'bermasalah') => {
    setSelectedInsightMetric(m === 'total' ? null : m);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-panel)', padding: '20px', overflowY: 'auto' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
        {getMetricTitle(metric)}
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: '1.4' }}>
        {getMetricDescription(metric)}
      </p>

      {/* Donut Chart Visual */}
      {stats.grandTotal > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          {/* SVG Donut */}
          <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
            <svg width="100%" height="100%" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="45" cy="45" r={radius} fill="transparent" stroke="var(--border)" strokeWidth="6" style={{ opacity: 0.3 }} />
              
              {/* Lunas (Hijau) */}
              {stats.lunas > 0 && (
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  fill="transparent"
                  stroke="#16a34a"
                  strokeWidth={metric === 'lunas' ? '9' : '6'}
                  strokeDasharray={`${strokeLunas} ${circumference}`}
                  strokeDashoffset="0"
                  style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                  onClick={() => handleLegendClick('lunas')}
                />
              )}

              {/* Belum Lunas (Merah) */}
              {stats.belumLunas > 0 && (
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  fill="transparent"
                  stroke="#dc2626"
                  strokeWidth={metric === 'belum_lunas' ? '9' : '6'}
                  strokeDasharray={`${strokeBelumLunas} ${circumference}`}
                  strokeDashoffset="0"
                  style={{
                    transform: `rotate(${rotateBelumLunas}deg)`,
                    transformOrigin: '45px 45px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleLegendClick('belum_lunas')}
                />
              )}

              {/* DP (Biru) */}
              {stats.dp > 0 && (
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  fill="transparent"
                  stroke="#2563eb"
                  strokeWidth={metric === 'dp' ? '9' : '6'}
                  strokeDasharray={`${strokeDp} ${circumference}`}
                  strokeDashoffset="0"
                  style={{
                    transform: `rotate(${rotateDp}deg)`,
                    transformOrigin: '45px 45px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleLegendClick('dp')}
                />
              )}

              {/* Bermasalah (Oranye) */}
              {stats.bermasalah > 0 && (
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  fill="transparent"
                  stroke="#d97706"
                  strokeWidth={metric === 'bermasalah' ? '9' : '6'}
                  strokeDasharray={`${strokeBermasalah} ${circumference}`}
                  strokeDashoffset="0"
                  style={{
                    transform: `rotate(${rotateBermasalah}deg)`,
                    transformOrigin: '45px 45px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleLegendClick('bermasalah')}
                />
              )}
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>
                {metric === 'total' ? 'Lunas+DP' : metric.replace('_', ' ')}
              </span>
              <strong style={{
                fontSize: '13px',
                color: metric === 'lunas' ? '#16a34a' : metric === 'belum_lunas' ? '#dc2626' : metric === 'dp' ? '#2563eb' : metric === 'bermasalah' ? '#d97706' : '#16a34a'
              }}>
                {metric === 'total' 
                  ? `${((stats.lunas + stats.dp) / stats.grandTotal * 100).toFixed(0)}%`
                  : metric === 'lunas'
                  ? `${percentLunas.toFixed(0)}%`
                  : metric === 'belum_lunas'
                  ? `${percentBelumLunas.toFixed(0)}%`
                  : metric === 'dp'
                  ? `${percentDp.toFixed(0)}%`
                  : `${percentBermasalah.toFixed(0)}%`
                }
              </strong>
            </div>
          </div>

          {/* Legenda Ringkas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, fontSize: '11px' }}>
            <div 
              onClick={() => handleLegendClick('total')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', background: metric === 'total' ? 'var(--bg-panel)' : 'transparent', fontWeight: metric === 'total' ? 'bold' : 'normal' }}
            >
              <span style={{ color: 'var(--text-primary)' }}>📊 Total Omzet</span>
              <span style={{ color: 'var(--text-secondary)' }}>100%</span>
            </div>
            <div 
              onClick={() => handleLegendClick('lunas')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', background: metric === 'lunas' ? 'rgba(22, 163, 74, 0.1)' : 'transparent', fontWeight: metric === 'lunas' ? 'bold' : 'normal' }}
            >
              <span style={{ color: '#16a34a' }}>● Lunas</span>
              <span style={{ color: 'var(--text-secondary)' }}>{percentLunas.toFixed(0)}%</span>
            </div>
            <div 
              onClick={() => handleLegendClick('belum_lunas')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', background: metric === 'belum_lunas' ? 'rgba(220, 38, 38, 0.1)' : 'transparent', fontWeight: metric === 'belum_lunas' ? 'bold' : 'normal' }}
            >
              <span style={{ color: '#dc2626' }}>● Piutang</span>
              <span style={{ color: 'var(--text-secondary)' }}>{percentBelumLunas.toFixed(0)}%</span>
            </div>
            <div 
              onClick={() => handleLegendClick('dp')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', background: metric === 'dp' ? 'rgba(37, 99, 235, 0.1)' : 'transparent', fontWeight: metric === 'dp' ? 'bold' : 'normal' }}
            >
              <span style={{ color: '#2563eb' }}>● Uang Muka (DP)</span>
              <span style={{ color: 'var(--text-secondary)' }}>{percentDp.toFixed(0)}%</span>
            </div>
            <div 
              onClick={() => handleLegendClick('bermasalah')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', background: metric === 'bermasalah' ? 'rgba(217, 119, 6, 0.1)' : 'transparent', fontWeight: metric === 'bermasalah' ? 'bold' : 'normal' }}
            >
              <span style={{ color: '#d97706' }}>● Bermasalah</span>
              <span style={{ color: 'var(--text-secondary)' }}>{percentBermasalah.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Akumulasi nominal */}
      <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
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

