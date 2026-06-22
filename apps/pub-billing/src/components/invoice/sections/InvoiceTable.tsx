import React from 'react';
import { InvoiceItem, InvoiceProfile, InvoiceTableColumn } from '../../../types/invoice.types';
import { formatPrice } from '../../../utils/format';
import { evaluateItemFormula } from '../../../utils/invoice';

interface InvoiceTableProps {
  items: InvoiceItem[];
  profile: InvoiceProfile | null;
  shippingCost: number;
  adminFee: number;
  spesifikasiFasilitas?: string;
  calculateItemTotal: (item: InvoiceItem) => number;
  accentColor: string;
  accentColorDark: string;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  items,
  profile,
  shippingCost,
  adminFee,
  spesifikasiFasilitas,
  calculateItemTotal,
  accentColor,
  accentColorDark
}) => {
  const itemsTotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const subtotal = itemsTotal;
  const hasItemShipping = profile?.tableColumns?.some(col => col.key === 'item_shipping_cost');
  const globalShip = hasItemShipping ? 0 : shippingCost;
  const total = subtotal + globalShip + adminFee;

  const getInvoiceTypeActionLabel = () => {
    return profile?.actionLabel || 'cetak buku';
  };

  const columns = (profile?.tableColumns && profile.tableColumns.length > 0)
    ? profile.tableColumns
    : [
        { key: 'item_title', label: 'Judul / Detail', type: 'text', align: 'left' as const },
        { key: 'price', label: 'Harga', type: 'currency', align: 'right' as const, width: '90px' },
        { key: 'quantity', label: 'Jml.', type: 'number', align: 'center' as const, width: '50px' },
        { key: 'total', label: 'Total', type: 'formula', align: 'right' as const, width: '95px', formula: '{price} * {quantity}' }
      ];

  const footerColSpan = columns.length;

  return (
    <div style={{ padding: '0 35px', flex: 1, overflow: 'hidden' }}>
      {profile?.salamPembuka && (
        <div style={{ 
          fontSize: '9px', 
          color: '#4b5563', 
          marginBottom: '8px', 
          lineHeight: '1.4',
          fontStyle: 'italic',
          borderLeft: `2.5px solid ${accentColor}`,
          paddingLeft: '8px'
        }}>
          {profile.salamPembuka}
        </div>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Montserrat", "Segoe UI", sans-serif' }}>
        <thead>
          <tr style={{ color: '#ffffff' }}>
            <th style={{ background: accentColorDark, width: '28px', textAlign: 'center', padding: '8px 4px', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', border: 'none' }}>No</th>
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                style={{ 
                  background: accentColor, 
                  textAlign: col.align || 'left', 
                  padding: '8px 8px', 
                  fontSize: '9px', 
                  fontWeight: '700', 
                  textTransform: 'uppercase', 
                  border: 'none', 
                  width: col.width || 'auto', 
                  whiteSpace: 'nowrap' 
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} style={{ padding: '20px', textAlign: 'center', fontSize: '11px', color: '#6b7280', fontStyle: 'italic', borderBottom: '1px solid #e5e7eb' }}>
                Belum ada rincian item. Silakan tambahkan di menu generator.
              </td>
            </tr>
          ) : (
            items.map((item, index) => {
              const rowBg = index % 2 === 0 ? '#fdf2f2' : '#ffffff';

              return (
                <tr key={index} style={{ background: rowBg }}>
                  <td style={{ padding: '6px 4px', textAlign: 'center', fontSize: '9.5px', color: '#1f2937', fontWeight: '500', borderBottom: '1px solid #e5e7eb', verticalAlign: 'top' }}>
                    {index + 1}.
                  </td>
                  {columns.map((col, colIdx) => {
                    let val: any;
                    if (col.type === 'formula' && col.formula) {
                      val = evaluateItemFormula(col.formula, item);
                    } else {
                      val = item[col.key];
                    }

                    const displayVal = col.type === 'currency'
                      ? `Rp ${formatPrice(Number(val || 0))}`
                      : col.type === 'number'
                      ? formatPrice(Number(val || 0))
                      : String(val ?? '-');

                    return (
                      <td
                        key={colIdx}
                        style={{
                          padding: '6px 8px',
                          textAlign: col.align || 'left',
                          fontSize: '9.5px',
                          color: '#1f2937',
                          fontWeight: col.key === 'total' || col.key === 'item_title' ? '700' : '500',
                          borderBottom: '1px solid #e5e7eb',
                          whiteSpace: col.type === 'currency' || col.type === 'number' ? 'nowrap' : 'normal',
                          wordBreak: col.type === 'currency' || col.type === 'number' ? 'normal' : 'break-word',
                          verticalAlign: 'top'
                        }}
                      >
                        {col.key === 'item_title' ? `"${displayVal}"` : displayVal}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
          
          {items.length > 0 && (
            <>
              {((!hasItemShipping && shippingCost > 0) || adminFee > 0) && (
                <tr style={{ borderTop: '1.5px solid #d1d5db' }}>
                  <td colSpan={footerColSpan} style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9px', fontWeight: '600', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>
                    Subtotal
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9px', fontWeight: '600', color: '#1f2937', whiteSpace: 'nowrap', borderBottom: '1px solid #e5e7eb' }}>
                    Rp {formatPrice(subtotal)}
                  </td>
                </tr>
              )}

              {!hasItemShipping && shippingCost > 0 && (
                <tr>
                  <td colSpan={footerColSpan} style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9px', fontWeight: '600', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>
                    Ongkos Kirim
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9px', fontWeight: '600', color: '#1f2937', whiteSpace: 'nowrap', borderBottom: '1px solid #e5e7eb' }}>
                    Rp {formatPrice(shippingCost)}
                  </td>
                </tr>
              )}

              {adminFee > 0 && (
                <tr>
                  <td colSpan={footerColSpan} style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9px', fontWeight: '600', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>
                    Biaya Admin
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9px', fontWeight: '600', color: '#1f2937', whiteSpace: 'nowrap', borderBottom: '1px solid #e5e7eb' }}>
                    Rp {formatPrice(adminFee)}
                  </td>
                </tr>
              )}

              <tr style={{ borderTop: '1.5px solid #9ca3af' }}>
                <td colSpan={footerColSpan} style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9.5px', fontWeight: '700', color: '#1f2937' }}>
                  Total
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '10px', fontWeight: '800', color: accentColorDark, whiteSpace: 'nowrap' }}>
                  Rp {formatPrice(total)}
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>

      {profile?.showSpesifikasi && (
        <div style={{ 
          marginTop: '10px', 
          border: `1.5px solid ${accentColor}`, 
          borderRadius: '4px', 
          padding: '6px 10px', 
          fontSize: '8.5px', 
          color: '#4b5563', 
          background: '#fef3c7', 
          textAlign: 'center', 
          fontWeight: '600',
          lineHeight: '1.4',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}>
          {spesifikasiFasilitas || profile.defaultSpesifikasi}
        </div>
      )}

      {profile?.notes && profile.notes.length > 0 && (
        <div style={{ marginTop: '10px', fontSize: '8.5px', color: '#4b5563', lineHeight: '1.4' }}>
          <span style={{ fontWeight: '700', fontStyle: 'italic' }}>Note:</span><br />
          {profile.notes.map((note, idx) => (
            <React.Fragment key={idx}>
              {idx + 1}. {note}<br />
            </React.Fragment>
          ))}
        </div>
      )}

      <div style={{ marginTop: '10px', fontSize: '9px', color: '#4b5563', lineHeight: '1.4' }}>
        Demikian rincian biaya {getInvoiceTypeActionLabel()} anda. Dan lembar ini kami buat untuk dipergunakan sebagaimana semestinya. Atas kepercayaan anda, kami ucapkan terimakasih.
      </div>
    </div>
  );
};
