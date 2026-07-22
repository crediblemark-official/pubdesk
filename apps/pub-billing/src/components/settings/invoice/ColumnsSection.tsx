import React, { useState, useEffect } from 'react';
import { useSettingsForm } from './SettingsFormContext';
import { useAppContext } from '../../../contexts/AppContext';
import { InvoiceTableColumn, CustomInvoiceLayout } from '../../../types/invoice.types';
import { Modal } from '../../../ui/molecules/Modal';

const generateKeyFromLabel = (label: string, index: number): string => {
  const clean = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return clean || `kolom_${index + 1}`;
};

const ColumnsSection: React.FC = () => {
  const { tableColumns, setTableColumns, customLayouts, setCustomLayouts, defaultLayoutName, setDefaultLayoutName, shippingType, setShippingType } = useSettingsForm();
  const { showConfirm } = useAppContext();
  const [activeLayoutId, setActiveLayoutId] = useState<string>('default');
  const [isEditingName, setIsEditingName] = useState(false);

  // Reset mode edit saat activeLayoutId berubah
  useEffect(() => {
    setIsEditingName(false);
  }, [activeLayoutId]);

  // State untuk React Modal prompt layout baru
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');

  const getActiveColumns = (): InvoiceTableColumn[] => {
    if (activeLayoutId === 'default') {
      return tableColumns;
    }
    const matched = customLayouts.find(l => l.id === activeLayoutId);
    return matched ? matched.tableColumns : [];
  };

  const activeCols = getActiveColumns();

  const handleUpdateColumn = (index: number, updates: Partial<InvoiceTableColumn>) => {
    if (activeLayoutId === 'default') {
      setTableColumns(prev => prev.map((col, i) => i === index ? { ...col, ...updates } : col));
    } else {
      setCustomLayouts(prev => prev.map(l => {
        if (l.id === activeLayoutId) {
          const updatedCols = l.tableColumns.map((col, i) => i === index ? { ...col, ...updates } : col);
          return { ...l, tableColumns: updatedCols };
        }
        return l;
      }));
    }
  };

  const handleAddColumn = () => {
    const newCol: InvoiceTableColumn = {
      key: `kolom_${activeCols.length + 1}`,
      label: 'Kolom Baru',
      type: 'text',
      align: 'left',
      width: 'auto'
    };
    if (activeLayoutId === 'default') {
      setTableColumns(prev => {
        if (typeof prev === 'function') {
          const fn = prev as any;
          return [...fn([]), newCol];
        }
        return [...prev, newCol];
      });
    } else {
      setCustomLayouts(prev => prev.map(l => l.id === activeLayoutId ? { ...l, tableColumns: [...l.tableColumns, newCol] } : l));
    }
  };

  const handleRemoveColumn = (index: number) => {
    if (activeLayoutId === 'default') {
      setTableColumns(prev => {
        if (typeof prev === 'function') {
          const fn = prev as any;
          return fn([]).filter((_: any, i: number) => i !== index);
        }
        return prev.filter((_, i) => i !== index);
      });
    } else {
      setCustomLayouts(prev => prev.map(l => l.id === activeLayoutId ? { ...l, tableColumns: l.tableColumns.filter((_, i) => i !== index) } : l));
    }
  };

  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === activeCols.length - 1) return;
    
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...activeCols];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    
    if (activeLayoutId === 'default') {
      setTableColumns(updated);
    } else {
      setCustomLayouts(prev => prev.map(l => l.id === activeLayoutId ? { ...l, tableColumns: updated } : l));
    }
  };

  const handleResetColumns = () => {
    showConfirm({
      title: 'Reset Kolom',
      message: 'Apakah Anda yakin ingin mereset kolom ke skema bawaan minimal?',
      confirmText: 'Reset',
      type: 'danger',
      onConfirm: () => {
        const defaultCols: InvoiceTableColumn[] = [
          { key: 'item_title', label: 'Nama Item', type: 'text', align: 'left' },
          { key: 'quantity', label: 'Qty', type: 'number', align: 'center', width: '80px' },
          { key: 'price', label: 'Harga', type: 'currency', align: 'right', width: '110px' },
          { key: 'total', label: 'Total', type: 'formula', align: 'right', width: '110px', formula: '{price} * {quantity}' }
        ];
        if (activeLayoutId === 'default') {
          setTableColumns(defaultCols);
        } else {
          setCustomLayouts(prev => prev.map(l => l.id === activeLayoutId ? { ...l, tableColumns: defaultCols } : l));
        }
      }
    });
  };

  const handleAddNewLayout = () => {
    setNewLayoutName('');
    setShowPromptModal(true);
  };

  const handleConfirmAddLayout = () => {
    const trimmed = newLayoutName.trim();
    if (!trimmed) return;

    const id = `layout_${Date.now()}`;
    const newLayout: CustomInvoiceLayout = {
      id,
      name: trimmed,
      tableColumns: [
        { key: 'item_title', label: 'Judul Buku / Layanan', type: 'text', align: 'left' },
        { key: 'quantity', label: 'Qty', type: 'number', align: 'center', width: '80px' },
        { key: 'price', label: 'Harga', type: 'currency', align: 'right', width: '110px' },
        { key: 'total', label: 'Total', type: 'formula', align: 'right', width: '110px', formula: '{price} * {quantity}' }
      ],
      shippingType: 'none'
    };

    setCustomLayouts(prev => [...prev, newLayout]);
    setActiveLayoutId(id);
    setShowPromptModal(false);
  };

  const handleDeleteActiveLayout = () => {
    if (activeLayoutId === 'default') return;
    showConfirm({
      title: 'Hapus Layout Tabel',
      message: 'Apakah Anda yakin ingin menghapus layout tabel ini?',
      confirmText: 'Hapus',
      type: 'danger',
      onConfirm: () => {
        setCustomLayouts(prev => prev.filter(l => l.id !== activeLayoutId));
        setActiveLayoutId('default');
      }
    });
  };

  return (
    <>
      {/* Pengaturan Status Fitur Ongkos Kirim */}
      <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <label className="compact-label" style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>🚚 Fitur Ongkos Kirim</label>
        <select
          className="compact-select"
          style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '6px' }}
          value={shippingType === 'none' ? 'none' : 'item'}
          onChange={(e) => setShippingType(e.target.value as any)}
        >
          <option value="item">Aktifkan (Tampilkan Pengaturan Ongkir di Form & Tabel)</option>
          <option value="none">Nonaktifkan / Sembunyikan</option>
        </select>
      </div>
      {/* Tab bar untuk multi-layout */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setActiveLayoutId('default')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '600',
            borderRadius: '6px',
            cursor: activeLayoutId === 'default' && isEditingName ? 'default' : 'pointer',
            border: '1px solid ' + (activeLayoutId === 'default' ? 'var(--accent)' : 'var(--border)'),
            background: activeLayoutId === 'default' ? 'var(--accent)' : 'transparent',
            color: activeLayoutId === 'default' ? '#fff' : 'var(--text-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {activeLayoutId === 'default' && isEditingName ? (
            <input
              type="text"
              value={defaultLayoutName}
              onChange={(e) => setDefaultLayoutName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingName(false);
                }
              }}
              autoFocus
              style={{
                border: 'none',
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '600',
                padding: '2px 6px',
                borderRadius: '4px',
                outline: 'none',
                width: '120px',
              }}
            />
          ) : (
            <>
              <span>{defaultLayoutName || 'Default / Bawaan'}</span>
              {activeLayoutId === 'default' && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingName(true);
                  }}
                  style={{
                    cursor: 'pointer',
                    opacity: 0.8,
                    fontSize: '11px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.2)',
                    transition: 'background 0.2s',
                    lineHeight: 1
                  }}
                  title="Ubah nama"
                >
                  ✏️
                </span>
              )}
            </>
          )}
        </button>
        
        {customLayouts.map(l => {
          const isActive = activeLayoutId === l.id;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => setActiveLayoutId(l.id)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: isActive && isEditingName ? 'default' : 'pointer',
                border: '1px solid ' + (isActive ? 'var(--accent)' : 'var(--border)'),
                background: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isActive && isEditingName ? (
                <input
                  type="text"
                  value={l.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setCustomLayouts(prev => prev.map(item => item.id === l.id ? { ...item, name: newName } : item));
                  }}
                  onBlur={() => setIsEditingName(false)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingName(false);
                    }
                  }}
                  autoFocus
                  style={{
                    border: 'none',
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    outline: 'none',
                    width: '120px',
                  }}
                />
              ) : (
                <>
                  <span>{l.name}</span>
                  {isActive && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingName(true);
                      }}
                      style={{
                        cursor: 'pointer',
                        opacity: 0.8,
                        fontSize: '11px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2px',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.2)',
                        transition: 'background 0.2s',
                        lineHeight: 1
                      }}
                      title="Ubah nama"
                    >
                      ✏️
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={handleAddNewLayout}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '600',
            borderRadius: '6px',
            cursor: 'pointer',
            border: '1px dashed var(--accent)',
            background: 'transparent',
            color: 'var(--accent)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ➕ Tambah Tabel / Layout
        </button>

        {activeLayoutId !== 'default' && (
          <button
            type="button"
            onClick={handleDeleteActiveLayout}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '6px',
              cursor: 'pointer',
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#dc2626',
              marginLeft: 'auto'
            }}
          >
            🗑️ Hapus Tabel
          </button>
        )}
      </div>


      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>
            Sesuaikan kolom untuk tabel <strong>{activeLayoutId === 'default' ? (defaultLayoutName || 'Default / Bawaan') : customLayouts.find(l => l.id === activeLayoutId)?.name}</strong>:
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{
                fontSize: '11px',
                height: '28px',
                padding: '0 10px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                boxSizing: 'border-box',
                fontWeight: '500'
              }}
              onClick={handleResetColumns}
            >
              🔄 Reset Bawaan
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{
                fontSize: '11px',
                height: '28px',
                padding: '0 10px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                boxSizing: 'border-box',
                fontWeight: '500'
              }}
              onClick={handleAddColumn}
            >
              ➕ Tambah Kolom
            </button>
          </div>
        </div>

        {/* Header label kolom */}
        <div style={{ display: 'grid', gridTemplateColumns: '20px 1.8fr 1fr 0.8fr 1fr 32px 32px', gap: '6px', padding: '0 4px 4px', alignItems: 'center' }}>
          <span />
          <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Label</span>
          <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tipe</span>
          <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rata</span>
          <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lebar / Formula</span>
          <span />
          <span />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '380px', overflowY: 'auto', paddingRight: '2px' }}>
          {activeCols.length === 0 ? (
            <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', padding: '16px', fontStyle: 'italic' }}>
              Belum ada kolom tabel yang didefinisikan.
            </div>
          ) : (
            activeCols.map((col, idx) => {
              const isLocked = col.key === 'item_title' || col.key === 'quantity' || col.key === 'price' || col.key === 'total';

              const inputBase: React.CSSProperties = {
                width: '100%',
                fontSize: '12px',
                padding: '5px 8px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                outline: 'none',
                height: '30px',
                boxSizing: 'border-box',
              };
              const selectBase: React.CSSProperties = { ...inputBase, cursor: 'pointer' };

              return (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '20px 1.8fr 1fr 0.8fr 1fr 32px 32px',
                    gap: '6px',
                    alignItems: 'center',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px',
                    opacity: isLocked ? 0.85 : 1,
                  }}
                >
                  {/* Nomor */}
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center' }}>
                    {idx + 1}
                  </span>

                  {/* Label */}
                  <input
                    type="text"
                    style={{ ...inputBase, fontWeight: '600', fontSize: '12px' }}
                    value={col.label}
                    onChange={(e) => {
                      const newLabel = e.target.value;
                      const updates: Partial<InvoiceTableColumn> = { label: newLabel };
                      if (!isLocked) {
                        updates.key = generateKeyFromLabel(newLabel, idx);
                      }
                      handleUpdateColumn(idx, updates);
                    }}
                    placeholder="Label Kolom"
                  />

                  {/* Tipe */}
                  <select
                    style={isLocked ? { ...selectBase, background: 'var(--bg-panel)', color: 'var(--text-secondary)' } : selectBase}
                    value={col.type}
                    onChange={(e) => handleUpdateColumn(idx, { type: e.target.value as any })}
                    disabled={isLocked}
                  >
                    <option value="text">Teks</option>
                    <option value="number">Angka</option>
                    <option value="currency">Mata Uang (Rp)</option>
                    <option value="formula">Formula</option>
                  </select>

                  {/* Rata */}
                  <select
                    style={selectBase}
                    value={col.align || 'left'}
                    onChange={(e) => handleUpdateColumn(idx, { align: e.target.value as any })}
                  >
                    <option value="left">Kiri</option>
                    <option value="center">Tengah</option>
                    <option value="right">Kanan</option>
                  </select>

                  {/* Lebar atau Formula */}
                  {col.type === 'formula' ? (
                    <input
                      type="text"
                      style={{ ...inputBase, fontFamily: 'monospace', fontSize: '11px', color: '#7c3aed', borderColor: '#7c3aed44', background: '#f5f3ff' }}
                      value={col.formula || ''}
                      onChange={(e) => handleUpdateColumn(idx, { formula: e.target.value })}
                      placeholder="{price}*{qty}"
                    />
                  ) : (
                    <input
                      type="text"
                      style={inputBase}
                      value={col.width || 'auto'}
                      onChange={(e) => handleUpdateColumn(idx, { width: e.target.value })}
                      placeholder="auto / 90px"
                    />
                  )}

                  {/* Naik / Turun */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleMoveColumn(idx, 'up')}
                      disabled={idx === 0}
                      style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', padding: '1px', fontSize: '11px', color: 'var(--text-secondary)', opacity: idx === 0 ? 0.3 : 0.7, lineHeight: 1 }}
                    >▲</button>
                    <button
                      type="button"
                      onClick={() => handleMoveColumn(idx, 'down')}
                      disabled={idx === activeCols.length - 1}
                      style={{ background: 'none', border: 'none', cursor: idx === activeCols.length - 1 ? 'default' : 'pointer', padding: '1px', fontSize: '11px', color: 'var(--text-secondary)', opacity: idx === activeCols.length - 1 ? 0.3 : 0.7, lineHeight: 1 }}
                    >▼</button>
                  </div>

                  {/* Hapus */}
                  <button
                    type="button"
                    onClick={() => handleRemoveColumn(idx)}
                    disabled={isLocked}
                    title={isLocked ? 'Kolom wajib' : 'Hapus kolom'}
                    style={{ background: isLocked ? 'transparent' : '#fef2f2', border: isLocked ? 'none' : '1px solid #fecaca', borderRadius: '6px', cursor: isLocked ? 'default' : 'pointer', padding: '4px', color: '#dc2626', opacity: isLocked ? 0.2 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '30px', width: '30px' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6l-1 14H6L5 6"></path>
                      <path d="M10 11v6M14 11v6"></path>
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Prompt untuk Layout/Tabel Baru */}
      <Modal
        open={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        title="Tambah Layout Tabel Baru"
        width="440px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Masukkan nama tabel / layout baru (misal: Jasa Layout, Desain Cover, Google Playbook):
          </div>
          <input
            type="text"
            style={{
              width: '100%',
              fontSize: '13px',
              padding: '8px 12px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            value={newLayoutName}
            onChange={(e) => setNewLayoutName(e.target.value)}
            placeholder="Masukkan nama layout..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirmAddLayout();
              }
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '6px 16px', fontSize: '12px', fontWeight: '600', height: '32px' }}
              onClick={() => setShowPromptModal(false)}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '6px 16px', fontSize: '12px', fontWeight: '600', height: '32px' }}
              onClick={handleConfirmAddLayout}
              disabled={!newLayoutName.trim()}
            >
              Simpan
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ColumnsSection;
