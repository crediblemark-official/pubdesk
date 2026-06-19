import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';

export const FileManager: React.FC = () => {
  const { files, deleteFile, selectedFileId, setSelectedFileId, showToast } = useAppContext();
  const [activeCategory, setActiveCategory] = useState<'all' | 'invoice' | 'other'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Handler Hapus Berkas
  const handleDelete = async (e: React.MouseEvent, id: number, filename: string) => {
    e.stopPropagation();
    if (confirm(`Apakah Anda yakin ingin menghapus berkas "${filename}"?`)) {
      try {
        await deleteFile(id);
        showToast(`Berkas "${filename}" berhasil dihapus`, 'success');
      } catch (error) {
        console.error('Gagal menghapus berkas:', error);
        showToast('Gagal menghapus berkas', 'error');
      }
    }
  };

  // Format tanggal modifikasi agar ramah dibaca
  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return isoString;
    }
  };

  // Filter berkas berdasarkan kategori aktif dan query pencarian
  const filteredFiles = files.filter((file) => {
    const matchesCategory =
      activeCategory === 'all' ||
      (activeCategory === 'invoice' && file.type === 'invoice') ||
      (activeCategory === 'other' && file.type !== 'invoice');

    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.path.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg-dark)' }}>
      {/* Sidebar Kategori Berkas */}
      <div
        style={{
          width: '200px',
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-panel)',
          padding: '16px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flexShrink: 0
        }}
      >
        <h3 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', padding: '0 8px 8px 8px', letterSpacing: '0.5px' }}>
          Smart Folders
        </h3>
        
        <button
          onClick={() => setActiveCategory('all')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '6px',
            background: activeCategory === 'all' ? 'var(--bg-card)' : 'transparent',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: activeCategory === 'all' ? '600' : '500',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
        >
          📂 Semua Berkas
        </button>

        <button
          onClick={() => setActiveCategory('invoice')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '6px',
            background: activeCategory === 'invoice' ? 'var(--bg-card)' : 'transparent',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: activeCategory === 'invoice' ? '600' : '500',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
        >
          📄 Dokumen Invoice
        </button>

        <button
          onClick={() => setActiveCategory('other')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '6px',
            background: activeCategory === 'other' ? 'var(--bg-card)' : 'transparent',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: activeCategory === 'other' ? '600' : '500',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
        >
          📁 Berkas Lainnya
        </button>
      </div>

      {/* Konten Utama Tabel Berkas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Top Header Filter & Search */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-dark)'
          }}
        >
          <div style={{ position: 'relative', width: '300px' }}>
            <input
              type="text"
              placeholder="Cari berkas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px 6px 28px',
                fontSize: '13px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                outline: 'none',
                height: '30px'
              }}
            />
            <span style={{ position: 'absolute', left: '8px', top: '7px', color: 'var(--text-secondary)', fontSize: '14px', pointerEvents: 'none' }}>
              🔍
            </span>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
            Menampilkan {filteredFiles.length} berkas
          </div>
        </div>

        {/* Daftar Berkas (Tabel Compact) */}
        <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-card)' }}>
          {filteredFiles.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '32px', marginBottom: '8px' }}>📂</span>
              <p style={{ fontSize: '13px', fontWeight: '500' }}>Tidak ada berkas yang ditemukan</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '8px 12px', fontWeight: '600', width: '40%' }}>Nama Berkas</th>
                  <th style={{ padding: '8px 12px', fontWeight: '600', width: '15%' }}>Tipe</th>
                  <th style={{ padding: '8px 12px', fontWeight: '600', width: '25%' }}>Diubah Terakhir</th>
                  <th style={{ padding: '8px 12px', fontWeight: '600', width: '10%' }}>Status</th>
                  <th style={{ padding: '8px 12px', fontWeight: '600', width: '10%', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => {
                  const isSelected = selectedFileId === file.id;
                  return (
                    <tr
                      key={file.id}
                      onClick={() => setSelectedFileId(isSelected ? null : (file.id ?? null))}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: isSelected ? 'rgba(192, 28, 28, 0.08)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.1s ease',
                        color: 'var(--text-primary)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>{file.type === 'invoice' ? '📄' : '📁'}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.filename}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                        {file.type}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                        {formatDateTime(file.last_modified)}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: file.status === 'Tersimpan' ? 'rgba(46, 194, 126, 0.15)' : 'rgba(0, 0, 0, 0.06)',
                            color: file.status === 'Tersimpan' ? '#2ec27e' : 'var(--text-secondary)'
                          }}
                        >
                          {file.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          {/* Tombol Hapus */}
                          <button
                            onClick={(e) => handleDelete(e, file.id!, file.filename)}
                            title="Hapus berkas"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--accent)',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(192, 28, 28, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileManager;
