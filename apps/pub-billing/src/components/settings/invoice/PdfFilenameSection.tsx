import React from 'react';
import { useSettingsForm } from './SettingsFormContext';
import { formatPdfFilename } from '../../../utils/invoice';

const PdfFilenameSection: React.FC = () => {
  const {
    pdfFilenameFormat,
    setPdfFilenameFormat,
    profileName,
    companyName
  } = useSettingsForm();

  // Live preview contoh racikan nama file
  const examplePreview = formatPdfFilename(pdfFilenameFormat, {
    profileName: profileName || 'Paket Terbit',
    invoiceNo: '001/INV/VII/2026',
    invoiceHal: 'Penerbitan Buku',
    invoiceLampiran: '1 Lembar',
    invoiceDate: '2026-07-22',
    customerName: 'Budi Santoso',
    customerWa: '081234567890',
    customerEmail: 'budi@example.com',
    customerAddress: 'Jakarta, Indonesia',
    paymentStatus: 'LUNAS',
    companyName: companyName || 'Penerbit KBM Indonesia',
    actionLabel: 'penerbitan',
    items: [
      { item_title: 'Pemrograman React & TypeScript', package_name: 'Paket Terbit Gold', quantity: 500, price: 15000, discount: 0, book_id: 0 },
      { item_title: 'Desain Cover Custom', package_name: 'Layanan Tambahan', quantity: 1, price: 250000, discount: 0, book_id: 0 }
    ],
    totalAmount: 7750000,
    paidAmount: 7750000,
    remainingAmount: 0
  });

  const categories = [
    {
      title: '📋 Profil & Metadata',
      items: [
        { tag: '{profile_name}', label: 'Nama Profil' },
        { tag: '{invoice_no}', label: 'No Invoice' },
        { tag: '{perihal}', label: 'Perihal' },
        { tag: '{lampiran}', label: 'Lampiran' },
        { tag: '{action_label}', label: 'Label Aksi' },
      ]
    },
    {
      title: '👤 Pelanggan / Penulis',
      items: [
        { tag: '{customer_name}', label: 'Nama Pelanggan' },
        { tag: '{penulis}', label: 'Nama Penulis' },
        { tag: '{customer_wa}', label: 'No. WA' },
        { tag: '{customer_email}', label: 'Email' },
        { tag: '{customer_address}', label: 'Alamat' },
      ]
    },
    {
      title: '📖 Buku & Karya',
      items: [
        { tag: '{book_title}', label: 'Judul Utama' },
        { tag: '{package_name}', label: 'Nama Paket' },
        { tag: '{all_titles}', label: 'Semua Judul' },
        { tag: '{total_qty}', label: 'Total Qty' },
      ]
    },
    {
      title: '💰 Finansial & Tagihan',
      items: [
        { tag: '{payment_status}', label: 'Status Bayar' },
        { tag: '{total_amount}', label: 'Total Tagihan' },
        { tag: '{paid_amount}', label: 'Nominal Dibayar' },
        { tag: '{remaining_amount}', label: 'Sisa Pembayaran' },
      ]
    },
    {
      title: '📅 Tanggal & Perusahaan',
      items: [
        { tag: '{date}', label: 'Tgl Invoice' },
        { tag: '{year}', label: 'Tahun 4d' },
        { tag: '{month}', label: 'Bulan 2d' },
        { tag: '{day}', label: 'Hari 2d' },
        { tag: '{company_name}', label: 'Perusahaan' },
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Input Utama Format */}
      <div className="compact-form-group">
        <label className="compact-label" style={{ fontWeight: '600', fontSize: '13px' }}>
          📄 Formula Format Nama File PDF
        </label>
        <input
          type="text"
          className="compact-input"
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: '600'
          }}
          value={pdfFilenameFormat}
          onChange={(e) => setPdfFilenameFormat(e.target.value)}
          placeholder="Contoh: Invoice {profile_name} - {invoice_no} - {payment_status}"
        />
      </div>

      {/* Live Preview Pratinjau Nama File */}
      <div style={{ padding: '12px 14px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          👁️ Live Preview Hasil Racikan Nama File:
        </div>
        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
          {examplePreview}
        </div>
      </div>

      {/* Daftar Kategori Chip Variabel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
          Variabel Dinamis (Klik chip untuk memasukkan ke formula):
        </div>
        
        {categories.map((cat, idx) => (
          <div key={idx} style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              {cat.title}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {cat.items.map(item => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => setPdfFilenameFormat((pdfFilenameFormat ? `${pdfFilenameFormat} - ${item.tag}` : item.tag))}
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-body)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  title={`Tambah ${item.tag}`}
                >
                  <span style={{ color: 'var(--accent)', fontWeight: '700' }}>+</span>
                  <span>{item.label}</span>
                  <code style={{ fontSize: '10px', opacity: 0.7, background: 'var(--bg-panel)', padding: '1px 4px', borderRadius: '4px' }}>
                    {item.tag}
                  </code>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PdfFilenameSection;
