import React from 'react';
import { useInvoiceContext } from '../../../contexts/InvoiceContext';
import { formatThousand, parseThousand } from '../../../utils/format';

export const GlobalCostsSection: React.FC = () => {
  const {
    shippingCost,
    setShippingCost,
    adminFee,
    setAdminFee,
  } = useInvoiceContext();

  return (
    <>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Ongkos Kirim</label>
        <input
          type="text"
          style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          value={formatThousand(shippingCost)}
          onChange={(e) => setShippingCost(parseThousand(e.target.value))}
          placeholder="0"
        />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Biaya Admin</label>
        <input
          type="text"
          style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          value={formatThousand(adminFee)}
          onChange={(e) => setAdminFee(parseThousand(e.target.value))}
          placeholder="0"
        />
      </div>
    </>
  );
};
