import React from 'react';
import { InvoiceProfile } from '../../../types/invoice.types';
import { formatDateId } from '../../../utils/invoice';

interface InvoiceInfoProps {
  customer: {
    name?: string;
    wa_number?: string;
    email?: string;
    address?: string;
  };
  profile: InvoiceProfile | null;
  invoiceHal: string;
  invoiceLampiran: string;
  invoiceDate: string;
}

export const InvoiceInfo: React.FC<InvoiceInfoProps> = ({
  customer,
  profile,
  invoiceHal,
  invoiceLampiran,
  invoiceDate
}) => {
  const getHalDefault = () => {
    return profile?.defaultHal || 'Biaya Cetak Buku';
  };

  const renderCustomerName = () => {
    const fullName = customer.name || 'NAMA PELANGGAN';
    const words = fullName.trim().split(/\s+/);
    if (words.length <= 1) {
      return <span style={{ color: profile?.accentColor || '#1e70cd' }}>{fullName}</span>;
    }
    const mid = Math.ceil(words.length / 2);
    const firstPart = words.slice(0, mid).join(' ');
    const secondPart = words.slice(mid).join(' ');
    return (
      <>
        <span style={{ color: '#1f2937' }}>{firstPart} </span>
        <span style={{ color: profile?.accentColor || '#1e70cd' }}>{secondPart}</span>
      </>
    );
  };

  return (
    <div style={{ padding: '20px 35px 12px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', fontFamily: 'Arial, "Segoe UI", sans-serif', flexShrink: 0, color: '#1f2937' }}>
      <div>
        <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kepada Yth.</div>
        <div style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px', lineHeight: '1.1', wordBreak: 'break-word' }}>
          {renderCustomerName()}
        </div>
        <div style={{ fontSize: '10px', color: '#1f2937', marginBottom: '4px', fontWeight: '600' }}>
          Alamat : <span style={{ fontWeight: '500', color: '#4b5563' }}>{customer.address || 'Di Tempat'}</span>
        </div>
        <div style={{ fontSize: '10px', color: '#1f2937', fontWeight: '600' }}>
          No. WA : <span style={{ fontWeight: '500', color: '#4b5563' }}>{customer.wa_number || '-'}</span>
        </div>
        {customer.email && (
          <div style={{ fontSize: '10px', color: '#1f2937', fontWeight: '600', marginTop: '2px' }}>
            Email : <span style={{ fontWeight: '500', color: '#4b5563' }}>{customer.email}</span>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px', color: '#4b5563' }}>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontWeight: '700', color: '#1f2937', width: '70px', flexShrink: 0 }}>Perihal</span>
          <span style={{ marginRight: '6px', color: '#4b5563', fontWeight: '700' }}>:</span>
          <span style={{ fontWeight: '600', color: profile?.accentColor || '#1e70cd', wordBreak: 'break-word' }}>"{invoiceHal || getHalDefault()}"</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontWeight: '700', color: '#1f2937', width: '70px', flexShrink: 0 }}>Lampiran</span>
          <span style={{ marginRight: '6px', color: '#4b5563', fontWeight: '700' }}>:</span>
          <span style={{ fontWeight: '500' }}>{invoiceLampiran || '-'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontWeight: '700', color: '#1f2937', width: '70px', flexShrink: 0 }}>Tanggal</span>
          <span style={{ marginRight: '6px', color: '#4b5563', fontWeight: '700' }}>:</span>
          <span style={{ fontWeight: '500' }}>{formatDateId(invoiceDate)}</span>
        </div>
      </div>
    </div>
  );
};
