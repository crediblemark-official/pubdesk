import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Book } from '../../types';

const BookManager: React.FC = () => {
  const { books, addBook, updateBook, deleteBook, showToast } = useAppContext();

  // State untuk form input tambah / edit
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookId, setCurrentBookId] = useState<number | null>(null);
  
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [regularPrice, setRegularPrice] = useState<number>(0);
  const [poPrice, setPoPrice] = useState<number>(0);
  const [weightGrams, setWeightGrams] = useState<number>(0);

  // Fungsi reset form
  const resetForm = () => {
    setIsEditing(false);
    setCurrentBookId(null);
    setTitle('');
    setIsbn('');
    setRegularPrice(0);
    setPoPrice(0);
    setWeightGrams(0);
  };

  // Mulai mode edit
  const handleStartEdit = (book: Book) => {
    setIsEditing(true);
    setCurrentBookId(book.id || null);
    setTitle(book.title);
    setIsbn(book.isbn || '');
    setRegularPrice(book.regular_price);
    setPoPrice(book.po_price);
    setWeightGrams(book.weight_grams);
  };

  // Simpan tambah atau edit buku
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Judul buku tidak boleh kosong!', 'error');
      return;
    }

    const bookData: Book = {
      id: currentBookId || undefined,
      title: title.trim(),
      isbn: isbn.trim() || undefined,
      regular_price: regularPrice,
      po_price: poPrice,
      weight_grams: weightGrams,
    };

    try {
      if (isEditing && currentBookId !== null) {
        await updateBook(bookData);
        showToast('Buku berhasil diperbarui!', 'success');
      } else {
        await addBook(bookData);
        showToast('Buku baru berhasil ditambahkan!', 'success');
      }
      resetForm();
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan buku!', 'error');
    }
  };

  // Hapus buku
  const handleDeleteBook = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
      try {
        await deleteBook(id);
        showToast('Buku berhasil dihapus!', 'success');
      } catch (err) {
        console.error(err);
        showToast('Gagal menghapus buku!', 'error');
      }
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="book-manager" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', overflow: 'auto' }}>
      
      {/* Bagian Header Modul */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
          📚 Master Manajemen Buku
        </h1>
        {isEditing && (
          <button className="btn-secondary" onClick={resetForm} style={{ padding: '6px 12px', fontSize: '13px' }}>
            Batal Edit
          </button>
        )}
      </div>

      {/* Form Compact & Native (Tanpa Container Abu-abu) */}
      <form onSubmit={handleSaveBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '700', paddingBottom: '6px', borderBottom: '1px solid var(--border)', marginBottom: '8px', color: 'var(--text-primary)' }}>
          {isEditing ? '✏️ Edit Rincian Buku' : '➕ Tambah Buku Baru'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Judul Buku</label>
            <input
              type="text"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Belajar Pemrograman Rust"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>ISBN (Opsional)</label>
            <input
              type="text"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="978-602-..."
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Harga Reguler (Rp)</label>
            <input
              type="number"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              value={regularPrice || ''}
              onChange={(e) => setRegularPrice(parseFloat(e.target.value) || 0)}
              placeholder="0"
              min="0"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Harga PO (Rp)</label>
            <input
              type="number"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              value={poPrice || ''}
              onChange={(e) => setPoPrice(parseFloat(e.target.value) || 0)}
              placeholder="0"
              min="0"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Berat (Gram)</label>
            <input
              type="number"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              value={weightGrams || ''}
              onChange={(e) => setWeightGrams(parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px', fontSize: '14px', fontWeight: '600' }}>
          {isEditing ? '💾 Simpan Perubahan' : '➕ Tambah Master Buku'}
        </button>
      </form>

      {/* Tabel List Buku Master */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '700', paddingBottom: '6px', borderBottom: '1px solid var(--border)', marginBottom: '8px', color: 'var(--text-primary)' }}>
          📋 Daftar Master Buku ({books.length})
        </h2>

        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: '600' }}>
                <th style={{ padding: '12px 16px' }}>Judul Buku</th>
                <th style={{ padding: '12px 16px' }}>ISBN</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Harga Reguler</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Harga PO</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Berat (gr)</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', width: '120px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    Belum ada data buku master.
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s ease' }} className="table-row-hover">
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--text-primary)' }}>{book.title}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{book.isbn || '-'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500', color: 'var(--text-primary)' }}>{formatPrice(book.regular_price)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: 'var(--accent)' }}>{formatPrice(book.po_price)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>{book.weight_grams} gr</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          className="btn-secondary"
                          onClick={() => handleStartEdit(book)}
                          style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Edit Buku"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => book.id && handleDeleteBook(book.id)}
                          style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Hapus Buku"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default BookManager;
