import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useInvoiceContext } from '../../contexts/InvoiceContext';
import { InvoiceItem, Book, Contact } from '../../types';

const InvoiceGenerator: React.FC = () => {
  const { books, addBook, addContact, addInvoice } = useAppContext();
  const { 
    customer, items, shippingCost, adminFee,
    setCustomer, addItem, updateItem, removeItem,
    setShippingCost, setAdminFee,
    calculateTotal, resetInvoice
  } = useInvoiceContext();

  const [waInput, setWaInput] = useState('');
  const [showBookModal, setShowBookModal] = useState(false);
  const [newBook, setNewBook] = useState<Partial<Book>>({
    title: '',
    regular_price: 0,
    po_price: 0,
    weight_grams: 0
  });
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [itemQty, setItemQty] = useState(1);
  const [itemDiscount, setItemDiscount] = useState(0);

  const handleParseWA = () => {
    const lines = waInput.split('\n');
    let parsedName = '';
    let parsedWA = '';
    let parsedAddress = '';

    lines.forEach(line => {
      const lower = line.toLowerCase();
      if (lower.includes('nama') || lower.includes('name')) {
        parsedName = line.replace(/.*?(nama|name)\s*:\s*/i, '').trim();
      } else if (lower.includes('wa') || lower.includes('whatsapp') || line.match(/08\d{8,}/)) {
        const waMatch = line.match(/08\d{8,}/);
        if (waMatch) parsedWA = waMatch[0];
      } else if (lower.includes('alamat') || lower.includes('address')) {
        parsedAddress = line.replace(/.*?(alamat|address)\s*:\s*/i, '').trim();
      }
    });

    if (parsedName) {
      setCustomer(prev => ({ ...prev, name: parsedName }));
    }
    if (parsedWA) {
      setCustomer(prev => ({ ...prev, wa_number: parsedWA }));
    }
    if (parsedAddress) {
      setCustomer(prev => ({ ...prev, address: parsedAddress }));
    }
  };

  const handleAddItem = () => {
    const book = books.find(b => b.id === parseInt(selectedBookId));
    if (!book) return;

    const newInvoiceItem: InvoiceItem = {
      book_id: book.id!,
      book_title: book.title,
      quantity: itemQty,
      price: book.po_price,
      discount: itemDiscount
    };

    addItem(newInvoiceItem);
    setSelectedBookId('');
    setItemQty(1);
    setItemDiscount(0);
  };

  const handleSaveInvoice = async () => {
    try {
      let customerId = undefined;
      
      if (customer.name) {
        const newContact: Contact = {
          name: customer.name,
          wa_number: customer.wa_number,
          address: customer.address,
          type: 'customer',
          created_at: new Date().toISOString()
        };
        customerId = await addContact(newContact);
      }

      const invoice = {
        created_at: new Date().toISOString(),
        customer_id: customerId,
        items_json: JSON.stringify(items),
        shipping_cost: shippingCost,
        admin_fee: adminFee,
        total: calculateTotal(),
        export_format: 'png',
        file_path: undefined
      };

      await addInvoice(invoice);
      resetInvoice();
      alert('Invoice saved successfully!');
    } catch (error) {
      console.error('Failed to save invoice:', error);
      alert('Gagal menyimpan invoice');
    }
  };

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.regular_price || !newBook.po_price) return;
    
    await addBook(newBook as Book);
    setShowBookModal(false);
    setNewBook({
      title: '',
      regular_price: 0,
      po_price: 0,
      weight_grams: 0
    });
  };

  return (
    <div className="invoice-generator" style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#f8f4e9' }}>Invoice Generator</h1>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#f8f4e9' }}>💬 Data Pelanggan</h2>
        <textarea
          style={{ width: '100%', minHeight: '80px', background: '#3c342a', border: '1px solid #42382d', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#f8f4e9', resize: 'vertical', marginBottom: '8px' }}
          placeholder="Tempel chat WhatsApp di sini..."
          value={waInput}
          onChange={(e) => setWaInput(e.target.value)}
          rows={3}
        />
        <button className="btn-secondary" onClick={handleParseWA} style={{ marginBottom: '16px' }}>
          ✨ Parse Otomatis
        </button>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#a89880' }}>Nama</label>
          <input
            type="text"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #42382d', borderRadius: '8px', fontSize: '14px', background: '#3c342a', color: '#f8f4e9' }}
            value={customer.name || ''}
            onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nama Pelanggan"
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#a89880' }}>No. WhatsApp</label>
          <input
            type="text"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #42382d', borderRadius: '8px', fontSize: '14px', background: '#3c342a', color: '#f8f4e9' }}
            value={customer.wa_number || ''}
            onChange={(e) => setCustomer(prev => ({ ...prev, wa_number: e.target.value }))}
            placeholder="08123456789"
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#a89880' }}>Alamat</label>
          <input
            type="text"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #42382d', borderRadius: '8px', fontSize: '14px', background: '#3c342a', color: '#f8f4e9' }}
            value={customer.address || ''}
            onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Alamat Pengiriman"
          />
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#f8f4e9' }}>📦 Item Pesanan</h2>
          <button className="btn-success" onClick={() => setShowBookModal(true)}>
            ➕ Tambah Buku
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <select
            style={{ flex: 1, minWidth: '200px', padding: '10px 14px', border: '1px solid #42382d', borderRadius: '8px', background: '#3c342a', color: '#f8f4e9', fontSize: '14px' }}
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
          >
            <option value="">Pilih Buku</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title} (PO: {new Intl.NumberFormat('id-ID').format(book.po_price)})
              </option>
            ))}
          </select>
          <input
            type="number"
            style={{ width: '100px', padding: '10px 14px', border: '1px solid #42382d', borderRadius: '8px', background: '#3c342a', color: '#f8f4e9', fontSize: '14px' }}
            placeholder="Qty"
            value={itemQty}
            onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
            min="1"
          />
          <input
            type="number"
            style={{ width: '100px', padding: '10px 14px', border: '1px solid #42382d', borderRadius: '8px', background: '#3c342a', color: '#f8f4e9', fontSize: '14px' }}
            placeholder="Diskon"
            value={itemDiscount}
            onChange={(e) => setItemDiscount(parseInt(e.target.value) || 0)}
            min="0"
          />
          <button className="btn-primary" onClick={handleAddItem}>
            + Tambah
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#3c342a', padding: '12px', borderRadius: '8px', border: '1px solid #42382d' }}>
              <span style={{ flex: 1 }}>{item.book_title}</span>
              <input
                type="number"
                style={{ width: '80px', padding: '6px 10px', border: '1px solid #42382d', borderRadius: '6px', background: '#2d2720', color: '#f8f4e9', fontSize: '14px' }}
                value={item.quantity}
                onChange={(e) => updateItem(index, { quantity: parseInt(e.target.value) || 1 })}
              />
              <span>x</span>
              <span style={{ minWidth: '100px', textAlign: 'right' }}>{new Intl.NumberFormat('id-ID').format(item.price)}</span>
              <button className="btn-danger" onClick={() => removeItem(index)} style={{ padding: '6px 12px' }}>
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#f8f4e9' }}>💰 Biaya Tambahan</h2>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#a89880' }}>Ongkos Kirim</label>
          <input
            type="number"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #42382d', borderRadius: '8px', fontSize: '14px', background: '#3c342a', color: '#f8f4e9' }}
            value={shippingCost}
            onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#a89880' }}>Biaya Admin</label>
          <input
            type="number"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #42382d', borderRadius: '8px', fontSize: '14px', background: '#3c342a', color: '#f8f4e9' }}
            value={adminFee}
            onChange={(e) => setAdminFee(parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn-primary" style={{ flex: 1 }} onClick={handleSaveInvoice}>
          💾 Simpan & Catat
        </button>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={resetInvoice}>
          🔄 Reset
        </button>
      </div>

      {showBookModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowBookModal(false)}>
          <div style={{ background: '#2d2720', borderRadius: '12px', padding: '24px', minWidth: '400px', border: '1px solid #42382d' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#f8f4e9' }}>Tambah Buku</h2>
              <button style={{ background: 'transparent', border: 'none', color: '#a89880', fontSize: '24px', cursor: 'pointer' }} onClick={() => setShowBookModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Judul Buku</label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Judul Buku"
                />
              </div>
              <div className="form-group">
                <label>ISBN</label>
                <input
                  type="text"
                  value={newBook.isbn || ''}
                  onChange={(e) => setNewBook((prev) => ({ ...prev, isbn: e.target.value }))}
                  placeholder="978-602-8567-12-3"
                />
              </div>
              <div className="form-group">
                <label>Harga Reguler</label>
                <input
                  type="number"
                  value={newBook.regular_price}
                  onChange={(e) => setNewBook((prev) => ({ ...prev, regular_price: parseFloat(e.target.value) || 0 }))}
                  placeholder="50000"
                />
              </div>
              <div className="form-group">
                <label>Harga PO</label>
                <input
                  type="number"
                  value={newBook.po_price}
                  onChange={(e) => setNewBook((prev) => ({ ...prev, po_price: parseFloat(e.target.value) || 0 }))}
                  placeholder="35000"
                />
              </div>
              <div className="form-group">
                <label>Berat (gram)</label>
                <input
                  type="number"
                  value={newBook.weight_grams}
                  onChange={(e) => setNewBook((prev) => ({ ...prev, weight_grams: parseInt(e.target.value) || 0 }))}
                  placeholder="200"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddBook}>
                Simpan
              </button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowBookModal(false)}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceGenerator;
