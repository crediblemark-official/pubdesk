import React from 'react';
import { InvoiceItem, InvoiceProfile, AdditionalFee } from '../../../types/invoice.types';
import { formatPrice } from '../../../utils/format';
import { evaluateItemFormula } from '../../../utils/invoice';

interface InvoiceTableProps {
  items: InvoiceItem[];
  profile: InvoiceProfile | null;
  shippingCost: number;
  adminFee: number;
  additionalFees?: AdditionalFee[];
  spesifikasiFasilitas?: string;
  calculateItemTotal: (item: InvoiceItem) => number;
  accentColor: string;
  accentColorDark: string;
  paymentStatus?: string;
  paidAmount?: number;
  paymentNotes?: string;
  showTotals?: boolean;
  itemStartIndex?: number;
  allItemsForTotal?: InvoiceItem[];
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  items,
  profile,
  shippingCost,
  adminFee,
  additionalFees = [],
  spesifikasiFasilitas,
  calculateItemTotal,
  accentColor,
  accentColorDark,
  paymentStatus,
  paidAmount = 0,
  paymentNotes,
  showTotals = true,
  itemStartIndex = 0,
  allItemsForTotal
}) => {
  const targetTotalItems = allItemsForTotal || items;
  const itemsTotal = targetTotalItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const subtotal = itemsTotal;
  const hasItemShipping = profile?.tableColumns?.some(col => col.key === 'item_shipping_cost');
  const globalShip = hasItemShipping ? 0 : shippingCost;
  const additionalFeesTotal = additionalFees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const total = subtotal + globalShip + adminFee + additionalFeesTotal;

  return (
    <div style={{ padding: '0 35px', flex: 1, overflow: 'hidden', position: 'relative' }}>
      {itemStartIndex === 0 && profile?.salamPembuka && (
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
            <th style={{ background: accentColor, textAlign: 'left', padding: '8px 8px', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', border: 'none' }}>Judul / Detail</th>
            <th style={{ background: accentColor, textAlign: 'right', padding: '8px 8px', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', border: 'none', width: '90px', whiteSpace: 'nowrap' }}>Harga</th>
            <th style={{ background: accentColor, textAlign: 'center', padding: '8px 8px', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', border: 'none', width: '50px' }}>Jml.</th>
            <th style={{ background: accentColor, textAlign: 'right', padding: '8px 8px', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', border: 'none', width: '95px', whiteSpace: 'nowrap' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: '20px', textAlign: 'center', fontSize: '11px', color: '#6b7280', fontStyle: 'italic', borderBottom: '1px solid #e5e7eb' }}>
                Belum ada rincian item. Silakan tambahkan di menu generator.
              </td>
            </tr>
          ) : (
            items.map((item, index) => {
              const rowBg = index % 2 === 0 ? '#fdf2f2' : '#ffffff';
              const columns = profile?.tableColumns || [];
              const keysToSkip = new Set(['item_title', 'price', 'quantity', 'total']);
              const detailParts: string[] = [];

              columns.forEach(col => {
                if (keysToSkip.has(col.key)) return;
                if (col.type === 'formula' && (col.key === 'total' || col.key.toLowerCase().includes('total'))) return;

                let val: any;
                if (col.type === 'formula' && col.formula) {
                  val = evaluateItemFormula(col.formula, item);
                } else {
                  val = item[col.key];
                }
                if (val === undefined || val === null || val === '' || val === 0) return;

                const displayVal = col.type === 'currency'
                  ? formatPrice(Number(val))
                  : String(val);
                detailParts.push(`${col.label}: ${displayVal}`);
              });

              const priceVal = item.price || 0;
              const priceDisplay = formatPrice(priceVal);
              const qtyVal = item.quantity ?? 1;
              const totalVal = calculateItemTotal(item);
              const totalDisplay = formatPrice(totalVal);

              return (
                <tr key={index} style={{ background: rowBg }}>
                  <td style={{ padding: '6px 4px', textAlign: 'center', fontSize: '9.5px', color: '#1f2937', fontWeight: '500', borderBottom: '1px solid #e5e7eb', verticalAlign: 'top' }}>
                    {itemStartIndex + index + 1}.
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'left', fontSize: '9.5px', color: '#1f2937', fontWeight: '700', borderBottom: '1px solid #e5e7eb', wordBreak: 'break-word', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: '700' }}>"{item.item_title || '-'}"</div>
                    {detailParts.length > 0 && (
                      <div style={{ fontWeight: '400', color: '#6b7280', fontSize: '8.5px', marginTop: '2px', lineHeight: '1.4' }}>
                        {detailParts.join(' | ')}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9.5px', color: '#1f2937', fontWeight: '500', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                    {priceDisplay}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', fontSize: '9.5px', color: '#1f2937', fontWeight: '500', borderBottom: '1px solid #e5e7eb', verticalAlign: 'top' }}>
                    {qtyVal}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9.5px', color: '#1f2937', fontWeight: '700', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                    {totalDisplay}
                  </td>
                </tr>
              );
            })
          )}
          
          {items.length > 0 && showTotals && (
            <>
              {((!hasItemShipping && shippingCost > 0) || adminFee > 0 || additionalFeesTotal > 0) && (
                <tr style={{ borderTop: '1.5px solid #d1d5db' }}>
                  <td colSpan={4} style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9px', fontWeight: '600', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>
                    Subtotal
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9px', fontWeight: '600', color: '#1f2937', whiteSpace: 'nowrap', borderBottom: '1px solid #e5e7eb' }}>
                    {formatPrice(subtotal)}
                  </td>
                </tr>
              )}

              {!hasItemShipping && shippingCost > 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9px', fontWeight: '600', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>
                    Ongkos Kirim
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9px', fontWeight: '600', color: '#1f2937', whiteSpace: 'nowrap', borderBottom: '1px solid #e5e7eb' }}>
                    {formatPrice(shippingCost)}
                  </td>
                </tr>
              )}

              {adminFee > 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9px', fontWeight: '600', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>
                    Biaya Admin
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9px', fontWeight: '600', color: '#1f2937', whiteSpace: 'nowrap', borderBottom: '1px solid #e5e7eb' }}>
                    {formatPrice(adminFee)}
                  </td>
                </tr>
              )}

              {additionalFees.map((fee) => {
                if (!fee.name && !fee.amount) return null;
                return (
                  <tr key={fee.id}>
                    <td colSpan={4} style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9px', fontWeight: '600', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>
                      {fee.name || 'Biaya Tambahan'}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9px', fontWeight: '600', color: '#1f2937', whiteSpace: 'nowrap', borderBottom: '1px solid #e5e7eb' }}>
                      {formatPrice(fee.amount || 0)}
                    </td>
                  </tr>
                );
              })}

              <tr style={{ borderTop: '1.5px solid #9ca3af' }}>
                <td colSpan={4} style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9.5px', fontWeight: '700', color: '#1f2937' }}>
                  Total
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '10px', fontWeight: '800', color: accentColorDark, whiteSpace: 'nowrap' }}>
                  {formatPrice(total)}
                </td>
              </tr>

              {paymentStatus === 'DP' && (
                <>
                  <tr>
                    <td colSpan={4} style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9px', fontWeight: '600', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>
                      Telah Dibayar (DP)
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9.5px', fontWeight: '700', color: '#2563eb', whiteSpace: 'nowrap', borderBottom: '1px solid #e5e7eb' }}>
                      {formatPrice(paidAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} style={{ padding: '6px 8px', textAlign: 'right', fontSize: '9.5px', fontWeight: '700', color: '#1f2937' }}>
                      Sisa Pembayaran
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '10px', fontWeight: '800', color: '#dc2626', whiteSpace: 'nowrap' }}>
                      {formatPrice(Math.max(0, total - paidAmount))}
                    </td>
                  </tr>
                </>
              )}
            </>
          )}
        </tbody>
      </table>

      {showTotals && (
        <>
          {profile?.showSpesifikasi && (spesifikasiFasilitas !== undefined && spesifikasiFasilitas !== null ? spesifikasiFasilitas.trim() !== '' : !!profile.defaultSpesifikasi) && (
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
              {spesifikasiFasilitas !== undefined && spesifikasiFasilitas !== null ? spesifikasiFasilitas : profile.defaultSpesifikasi}
            </div>
          )}

          {profile?.showNotes !== false && profile?.notes && profile.notes.length > 0 && (
            <div style={{ marginTop: '10px', fontSize: '8.5px', color: '#4b5563', lineHeight: '1.4' }}>
              <span style={{ fontWeight: '700', fontStyle: 'italic' }}>Note:</span><br />
              {profile.notes.map((note, idx) => (
                <React.Fragment key={idx}>
                  {idx + 1}. {note}<br />
                </React.Fragment>
              ))}
            </div>
          )}

          {paymentNotes && (
            <div style={{ marginTop: '8px', fontSize: '8.5px', color: '#4b5563', lineHeight: '1.4' }}>
              <span style={{ fontWeight: '700', fontStyle: 'italic' }}>Catatan Pembayaran:</span> {paymentNotes}
            </div>
          )}

          <div style={{ marginTop: '10px', fontSize: '9px', color: '#4b5563', lineHeight: '1.4', whiteSpace: 'pre-line' }}>
            {profile?.salamPenutup !== undefined && profile?.salamPenutup !== null
              ? profile.salamPenutup 
              : `Demikian rincian biaya ${profile?.actionLabel || 'cetak buku'} anda. Dan lembar ini kami buat untuk dipergunakan sebagaimana semestinya. Atas kepercayaan anda, kami ucapkan terimakasih.`}
          </div>
        </>
      )}
    </div>
  );
};
