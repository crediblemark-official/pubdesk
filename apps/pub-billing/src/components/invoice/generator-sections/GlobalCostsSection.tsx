import React from 'react';
import { useInvoiceContext } from '../../../contexts/InvoiceContext';
import { formatThousand, parseThousand } from '../../../utils/format';

export const GlobalCostsSection: React.FC = () => {
  const {
    shippingCost,
    setShippingCost,
    adminFee,
    setAdminFee,
    additionalFees,
    addAdditionalFee,
    updateAdditionalFee,
    removeAdditionalFee,
    globalDiscount,
    setGlobalDiscount,
    globalCashback,
    setGlobalCashback,
    calculateGlobalDiscountAmount,
    calculateGlobalCashbackAmount,
  } = useInvoiceContext();

  const discAmount = calculateGlobalDiscountAmount();
  const cbAmount = calculateGlobalCashbackAmount();

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Ongkos Kirim</label>
          <input
            type="text"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            value={formatThousand(shippingCost)}
            onChange={(e) => setShippingCost(parseThousand(e.target.value))}
            placeholder="0"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Biaya Admin</label>
          <input
            type="text"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            value={formatThousand(adminFee)}
            onChange={(e) => setAdminFee(parseThousand(e.target.value))}
            placeholder="0"
          />
        </div>
      </div>

      {/* Diskon Global & Cashback */}
      <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '10px' }}>
          🏷️ Potongan & Insentif (Global)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Diskon Global */}
          <div style={{ background: 'var(--bg-card)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>🏷️ Diskon Global</label>
              <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setGlobalDiscount(prev => ({ ...prev, type: 'fixed' }))}
                  style={{
                    padding: '2px 8px', fontSize: '11px', fontWeight: '600', border: 'none', cursor: 'pointer',
                    background: globalDiscount.type === 'fixed' ? 'var(--accent)' : 'transparent',
                    color: globalDiscount.type === 'fixed' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  Rp
                </button>
                <button
                  type="button"
                  onClick={() => setGlobalDiscount(prev => ({ ...prev, type: 'percent' }))}
                  style={{
                    padding: '2px 8px', fontSize: '11px', fontWeight: '600', border: 'none', cursor: 'pointer',
                    background: globalDiscount.type === 'percent' ? 'var(--accent)' : 'transparent',
                    color: globalDiscount.type === 'percent' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  %
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
              <input
                type="text"
                style={{ width: '100px', padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px', background: 'var(--bg-body)', color: 'var(--text-primary)', textAlign: 'right', fontWeight: '600' }}
                value={globalDiscount.type === 'percent' ? (globalDiscount.value || '') : formatThousand(globalDiscount.value)}
                onChange={(e) => {
                  const val = globalDiscount.type === 'percent' ? parseFloat(e.target.value) || 0 : parseThousand(e.target.value);
                  setGlobalDiscount(prev => ({ ...prev, value: val }));
                }}
                placeholder="0"
              />
              <input
                type="text"
                style={{ flex: 1, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                value={globalDiscount.label || ''}
                onChange={(e) => setGlobalDiscount(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Ket. Diskon (Opsional)"
              />
            </div>
            {discAmount > 0 && (
              <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '500', textAlign: 'right' }}>
                Potongan: -Rp {discAmount.toLocaleString('id-ID')}
              </div>
            )}
          </div>

          {/* Cashback */}
          <div style={{ background: 'var(--bg-card)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>🎁 Cashback</label>
              <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setGlobalCashback(prev => ({ ...prev, type: 'fixed' }))}
                  style={{
                    padding: '2px 8px', fontSize: '11px', fontWeight: '600', border: 'none', cursor: 'pointer',
                    background: globalCashback.type === 'fixed' ? 'var(--accent)' : 'transparent',
                    color: globalCashback.type === 'fixed' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  Rp
                </button>
                <button
                  type="button"
                  onClick={() => setGlobalCashback(prev => ({ ...prev, type: 'percent' }))}
                  style={{
                    padding: '2px 8px', fontSize: '11px', fontWeight: '600', border: 'none', cursor: 'pointer',
                    background: globalCashback.type === 'percent' ? 'var(--accent)' : 'transparent',
                    color: globalCashback.type === 'percent' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  %
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
              <input
                type="text"
                style={{ width: '100px', padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px', background: 'var(--bg-body)', color: 'var(--text-primary)', textAlign: 'right', fontWeight: '600' }}
                value={globalCashback.type === 'percent' ? (globalCashback.value || '') : formatThousand(globalCashback.value)}
                onChange={(e) => {
                  const val = globalCashback.type === 'percent' ? parseFloat(e.target.value) || 0 : parseThousand(e.target.value);
                  setGlobalCashback(prev => ({ ...prev, value: val }));
                }}
                placeholder="0"
              />
              <input
                type="text"
                style={{ flex: 1, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                value={globalCashback.label || ''}
                onChange={(e) => setGlobalCashback(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Ket. Cashback (Opsional)"
              />
            </div>
            {cbAmount > 0 && (
              <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '500', textAlign: 'right' }}>
                Potongan: -Rp {cbAmount.toLocaleString('id-ID')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Biaya Lain-lain (Global) */}
      <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px', marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
            🏷️ Biaya Lain-lain
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px' }}
              onClick={() => addAdditionalFee('Tambah Sertifikat', 0)}
            >
              + Sertifikat
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px' }}
              onClick={() => addAdditionalFee('Tambah SPKK', 0)}
            >
              + SPKK
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px' }}
              onClick={() => addAdditionalFee('Biaya Packing', 0)}
            >
              + Packing
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px' }}
              onClick={() => addAdditionalFee('', 0)}
            >
              + Custom
            </button>
          </div>
        </div>

        {additionalFees.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '8px 0' }}>
            Belum ada biaya lain-lain. Klik tombol preset di atas untuk menambah.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {additionalFees.map((fee) => (
              <div key={fee.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  value={fee.name}
                  onChange={(e) => updateAdditionalFee(fee.id, { name: e.target.value })}
                  placeholder="Nama Biaya (misal: Tambah Sertifikat)"
                />
                <div style={{ width: '130px', position: 'relative' }}>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-primary)', textAlign: 'right' }}
                    value={formatThousand(fee.amount)}
                    onChange={(e) => updateAdditionalFee(fee.id, { amount: parseThousand(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <button
                  type="button"
                  style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fca5a5',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  onClick={() => removeAdditionalFee(fee.id)}
                  title="Hapus Biaya"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
