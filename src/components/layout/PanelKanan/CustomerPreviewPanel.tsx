import React, { useMemo } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { useCrmContext } from '../../../contexts/CrmContext';
import { Badge } from '../../../ui/atoms/Badge';
import { formatPrice } from '../../../utils/format';

interface CustomerPreviewPanelProps {
  customerId: number | null;
}

const followupVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent'> = {
  'New': 'info',
  'Contacted': 'warning',
  'Interested': 'accent',
  'Deal': 'success',
  'Rejected': 'danger',
  'Pelanggan': 'success'
};

const getWhatsAppLink = (phone: string) => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62') && cleaned.length > 0) {
    cleaned = '62' + cleaned;
  }
  return `https://wa.me/${cleaned}`;
};

const CustomerPreviewPanel: React.FC<CustomerPreviewPanelProps> = ({ customerId }) => {
  const { contacts, invoices, showToast } = useAppContext();
  const { penulis } = useCrmContext();

  const customer = useMemo(() => {
    if (!customerId) return null;
    return contacts.find(c => c.id === customerId) || null;
  }, [contacts, customerId]);

  // Saring invoice yang berhubungan dengan pelanggan ini
  const customerInvoices = useMemo(() => {
    if (!customerId) return [];
    return invoices.filter(inv => inv.customer_id === customerId);
  }, [invoices, customerId]);

  // Cari data status follow-up dari crm penulis yang cocok
  const customerStatus = useMemo(() => {
    if (!customer) return 'Pelanggan';
    const match = penulis.find(p => 
      p.name.toLowerCase() === customer.name.toLowerCase() ||
      (customer.wa_number && p.wa_number === customer.wa_number)
    );
    return match?.followup_status || 'Pelanggan';
  }, [customer, penulis]);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} berhasil disalin!`, 'success');
  };

  if (!customerId || !customer) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-panel)', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', fontWeight: '500' }}>
          Pilih pelanggan untuk melihat rincian
        </p>
      </div>
    );
  }

  const nameInitial = customer.name ? customer.name.charAt(0).toUpperCase() : '?';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-panel)', padding: '24px', overflowY: 'auto' }}>
      {/* Header Inspektur */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <h3 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          🔍 Inspektur Berkas Cerdas
        </h3>

        {/* Profil Singkat dengan Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent) 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: '700',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
          }}>
            {nameInitial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0', wordBreak: 'break-all' }}>
              {customer.name}
            </h4>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', textTransform: 'uppercase' }}>
                Pelanggan
              </span>
              <Badge 
                label={customerStatus}
                variant={followupVariantMap[customerStatus] || 'success'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rincian Kontak */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
        <div>
          <h5 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Rincian Kontak</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            
            {/* Email */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Email</span>
              {customer.email ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <a
                    href={`mailto:${customer.email}`}
                    title="Kirim Email"
                    style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '600', fontSize: '13px' }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    📧 {customer.email}
                  </a>
                  <button 
                    onClick={() => handleCopyText(customer.email!, 'Email')} 
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', opacity: 0.6 }}
                    title="Salin Email"
                  >
                    📋
                  </button>
                </div>
              ) : (
                <span style={{ fontStyle: 'italic', opacity: 0.5, fontSize: '12px' }}>Tidak ada email</span>
              )}
            </div>

            {/* WA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>WhatsApp</span>
              {customer.wa_number ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <a
                    href={getWhatsAppLink(customer.wa_number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Chat WhatsApp"
                    style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '600', fontSize: '13px' }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    💬 {customer.wa_number}
                  </a>
                  <button 
                    onClick={() => handleCopyText(customer.wa_number!, 'WhatsApp')} 
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', opacity: 0.6 }}
                    title="Salin Nomor"
                  >
                    📋
                  </button>
                </div>
              ) : (
                <span style={{ fontStyle: 'italic', opacity: 0.5, fontSize: '12px' }}>Tidak ada</span>
              )}
            </div>

            {/* Alamat */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Alamat Instansi/Pengiriman</span>
                {customer.address && (
                  <button 
                    onClick={() => handleCopyText(customer.address!, 'Alamat')} 
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', opacity: 0.6 }}
                    title="Salin Alamat"
                  >
                    📋 Salin
                  </button>
                )}
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: 'var(--text-primary)', 
                whiteSpace: 'pre-line', 
                lineHeight: '1.4', 
                background: 'rgba(0,0,0,0.1)', 
                padding: '8px 12px', 
                borderRadius: '8px', 
                border: '1px solid var(--border)' 
              }}>
                {customer.address || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Tidak ada alamat terdaftar</span>}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Riwayat Invoice */}
      <div>
        <h5 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px' }}>Riwayat Invoice Tagihan</h5>
        {customerInvoices.length === 0 ? (
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--text-secondary)', 
            fontStyle: 'italic', 
            background: 'var(--bg-card)', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid var(--border)', 
            textAlign: 'center' 
          }}>
            Belum ada invoice yang diterbitkan untuk pelanggan ini.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {customerInvoices.map((invoice) => {
              let invoiceNo = `INV-${invoice.id}`;
              let paymentStatus = 'BELUM LUNAS';
              
              try {
                if (invoice.file_path) {
                  const metaObj = JSON.parse(invoice.file_path);
                  invoiceNo = metaObj.invoiceNo || invoiceNo;
                  paymentStatus = metaObj.paymentStatus || 'BELUM LUNAS';
                }
              } catch {}

              const isLunas = paymentStatus.toUpperCase() === 'LUNAS';

              return (
                <div 
                  key={invoice.id} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    background: 'var(--bg-card)', 
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border)', 
                    fontSize: '12px', 
                    gap: '6px',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '13px' }}>
                      📄 {invoiceNo}
                    </span>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '10px', 
                      fontWeight: '700', 
                      background: isLunas ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                      color: isLunas ? '#22c55e' : '#ef4444',
                      textTransform: 'uppercase' 
                    }}>
                      {paymentStatus}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    <span>{new Date(invoice.created_at).toLocaleDateString('id-ID')}</span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>
                      {formatPrice(invoice.total)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomerPreviewPanel;
