import React, { useMemo } from 'react';
import { useCrmContext } from '../../../contexts/CrmContext';
import { Badge } from '../../../ui/atoms/Badge';

interface NaskahPreviewPanelProps {
  naskahId: number | null;
}

const statusVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent'> = {
  'Belum Dimulai': 'neutral',
  'Sedang Dikerjakan': 'warning',
  'Selesai': 'success',
  'Batal': 'danger'
};

const NaskahPreviewPanel: React.FC<NaskahPreviewPanelProps> = ({ naskahId }) => {
  const { naskahOrders, penulis, penerbit } = useCrmContext();

  const naskahData = useMemo(() => {
    if (!naskahId) return null;
    return naskahOrders.find((n) => n.id === naskahId) || null;
  }, [naskahOrders, naskahId]);

  const penulisData = useMemo(() => {
    if (!naskahData?.penulis_id) return null;
    return penulis.find((p) => p.id === naskahData.penulis_id) || null;
  }, [naskahData, penulis]);

  const penerbitData = useMemo(() => {
    if (!naskahData?.penerbit_id) return null;
    return penerbit.find((p) => p.id === naskahData.penerbit_id) || null;
  }, [naskahData, penerbit]);

  if (!naskahId || !naskahData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-panel)', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>📚</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', fontWeight: '500' }}>
          Pilih naskah untuk melihat rincian
        </p>
      </div>
    );
  }

  const titleInitial = naskahData.title ? naskahData.title.charAt(0).toUpperCase() : '?';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-panel)', padding: '24px', overflowY: 'auto' }}>

      {/* Header Inspektur */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <h3 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          🔍 Inspektur Berkas Cerdas
        </h3>

        {/* Profil Singkat */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: '700',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
          }}>
            {titleInitial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px 0', lineHeight: '1.3' }}>
              {naskahData.title}
            </h4>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              {naskahData.genre && (
                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', textTransform: 'uppercase' }}>
                  {naskahData.genre}
                </span>
              )}
              <Badge
                label={naskahData.status}
                variant={statusVariantMap[naskahData.status] || 'neutral'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Detail Informasi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Sinopsis */}
        {naskahData.synopsis && (
          <div>
            <h5 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Sinopsis</h5>
            <div style={{
              fontSize: '13px',
              color: 'var(--text-primary)',
              lineHeight: '1.6',
              background: 'var(--bg-card)',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              fontStyle: 'italic'
            }}>
              &ldquo;{naskahData.synopsis}&rdquo;
            </div>
          </div>
        )}

        {/* Info Naskah */}
        <div>
          <h5 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Informasi Naskah</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-card)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '13px' }}>
            {naskahData.naskah_id_code && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Kode ID</span>
                <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{naskahData.naskah_id_code}</strong>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Genre</span>
              <strong style={{ color: 'var(--text-primary)' }}>{naskahData.genre || '-'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Jumlah Halaman</span>
              <strong style={{ color: 'var(--text-primary)' }}>{naskahData.total_pages ? `${naskahData.total_pages} hlm` : '-'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Ukuran Buku</span>
              <strong style={{ color: 'var(--text-primary)' }}>{naskahData.book_size || '-'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Legalitas</span>
              <strong style={{ color: 'var(--text-primary)' }}>{naskahData.legal_type || '-'}</strong>
            </div>
          </div>
        </div>

        {/* Penulis & Penerbit */}
        <div>
          <h5 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Penulis &amp; Penerbit</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-card)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Penulis</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                👤 {penulisData ? penulisData.name : '-'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Penerbit</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                🏢 {penerbitData ? penerbitData.name : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Detail Produksi */}
        <div>
          <h5 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Detail Produksi</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-card)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Paket</span>
              <strong style={{ color: 'var(--text-primary)' }}>{naskahData.package_type || 'Standar'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tipe Order</span>
              <strong style={{ color: 'var(--text-primary)' }}>{naskahData.order_type || '-'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Jumlah Cetak</span>
              <strong style={{ color: 'var(--text-primary)' }}>
                {naskahData.copies ? `${naskahData.copies} eks` : '-'}
              </strong>
            </div>
          </div>
        </div>


        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span>Tipe: <strong>Database Naskah</strong></span>
            <span>Dibuat: {naskahData.created_at ? new Date(naskahData.created_at).toLocaleDateString('id-ID') : '-'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NaskahPreviewPanel;
