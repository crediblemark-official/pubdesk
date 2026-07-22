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
  } = useInvoiceContext();

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
