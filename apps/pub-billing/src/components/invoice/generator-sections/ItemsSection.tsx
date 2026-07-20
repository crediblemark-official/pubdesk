import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { useInvoiceContext } from '../../../contexts/InvoiceContext';
import { useDataMasterContext } from '../../../contexts/DataMasterContext';
import { InvoiceItem } from '../../../types/invoice.types';
import { formatPrice } from '../../../utils/format';
import { SmartRelationField, SmartRelationOption, Modal } from '@pubhub/shared-ui';

export const ItemsSection: React.FC = () => {
  const { services, books, showToast, addService, addBook, updateService, deleteService, updateBook, deleteBook, contacts, showConfirm } = useAppContext();
  const { naskah } = useDataMasterContext();
  const {
    customer,
    items,
    addItem,
    updateItem,
    removeItem,
    calculateItemTotal,
    activeProfile,
    selectedLayoutId,
    setSelectedLayoutId,
  } = useInvoiceContext();

  const [customTitle, setCustomTitle] = useState('');
  const [selectedServiceIdState, setSelectedServiceIdState] = useState('');
  const [selectedBookIdState, setSelectedBookIdState] = useState('');
  const [selectedNaskahIdState, setSelectedNaskahIdState] = useState('');
  const [dynamicInputs, setDynamicInputs] = useState<Record<string, any>>({});
  const [createType, setCreateType] = useState<'service' | 'book'>('service');
  const [createFormData, setCreateFormData] = useState({
    name: '',
    price: 0,
    description: '',
    // book fields
    title: '',
    regular_price: 0,
    author_id: '',
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // State untuk edit/ubah data master layanan & karya langsung dari dropdown
  const [showEditMasterModal, setShowEditMasterModal] = useState(false);
  const [editMasterType, setEditMasterType] = useState<'service' | 'book'>('service');
  const [editMasterData, setEditMasterData] = useState({
    id: 0,
    name: '',
    price: 0,
    description: '',
    author_id: '',
  });

  const penulisList = useMemo(() => {
    return contacts.filter(c => c.type === 'penulis' || c.type === 'both');
  }, [contacts]);

  const handleCreateItem = async (onSave: () => void) => {
    if (createType === 'service') {
      if (!createFormData.name.trim()) {
        showToast("Nama layanan harus diisi!", "error");
        return;
      }
      try {
        const newServiceId = await addService({
          name: createFormData.name.trim(),
          price: createFormData.price,
          description: createFormData.description.trim(),
          category: 'umum',
        });
        
        setCustomTitle(createFormData.name.trim());
        setSelectedServiceIdState(String(newServiceId));
        setSelectedBookIdState('');
        setDynamicInputs(prev => ({ ...prev, price: createFormData.price }));
        onSave();
      } catch (err) {
        console.error("Gagal menambahkan layanan baru:", err);
        showToast("Gagal menambahkan layanan baru", "error");
      }
    } else {
      if (!createFormData.title.trim()) {
        showToast("Judul karya harus diisi!", "error");
        return;
      }
      try {
        const newBookId = await addBook({
          title: createFormData.title.trim(),
          regular_price: createFormData.regular_price,
          po_price: createFormData.regular_price,
          weight_grams: 0,
          author_id: createFormData.author_id ? parseInt(createFormData.author_id) : undefined,
        });

        setCustomTitle(createFormData.title.trim());
        setSelectedBookIdState(String(newBookId));
        setSelectedServiceIdState('');
        setDynamicInputs(prev => ({ ...prev, price: createFormData.regular_price }));
        onSave();
      } catch (err) {
        console.error("Gagal menambahkan karya baru:", err);
        showToast("Gagal menambahkan karya baru", "error");
      }
    }
    
    // Reset form
    setCreateFormData({
      name: '',
      price: 0,
      description: '',
      title: '',
      regular_price: 0,
      author_id: '',
    });
  };

  const allItemOptions: SmartRelationOption[] = useMemo(() => {
    return [
      ...services.map((s) => ({
        value: `service-${s.id}`,
        label: `${s.name} [Layanan]`,
        name: s.name,
        price: s.price,
        isBook: false,
        isNaskah: false,
        source: 'Layanan',
      })),
      ...books.map((b) => ({
        value: `book-${b.id}`,
        label: `${b.title} [Karya]`,
        name: b.title,
        price: b.regular_price,
        isBook: true,
        isNaskah: false,
        source: 'Karya',
      })),
      ...naskah.map((n) => ({
        value: `naskah-${n.id}`,
        label: `${n.title} [Naskah]`,
        name: n.title,
        price: 0,
        isBook: false,
        isNaskah: true,
        source: 'Naskah',
      })),
    ];
  }, [services, books, naskah]);

  const selectedValue = useMemo(() => {
    if (selectedServiceIdState) return `service-${selectedServiceIdState}`;
    if (selectedBookIdState) return `book-${selectedBookIdState}`;
    if (selectedNaskahIdState) return `naskah-${selectedNaskahIdState}`;
    if (customTitle) {
      const found = allItemOptions.find(o => (o as any).name?.toLowerCase() === customTitle.trim().toLowerCase());
      return found ? found.value : '';
    }
    return '';
  }, [selectedServiceIdState, selectedBookIdState, selectedNaskahIdState, customTitle, allItemOptions]);

  const handleSelect = (value: string, option?: SmartRelationOption) => {
    if (!option) {
      setCustomTitle(value);
      setSelectedServiceIdState('');
      setSelectedBookIdState('');
      setSelectedNaskahIdState('');
      return;
    }

    setCustomTitle((option as any).name || option.label);
    if ((option as any).isNaskah) {
      setSelectedNaskahIdState(value.replace('naskah-', ''));
      setSelectedBookIdState('');
      setSelectedServiceIdState('');
    } else if ((option as any).isBook) {
      setSelectedBookIdState(value.replace('book-', ''));
      setSelectedServiceIdState('');
      setSelectedNaskahIdState('');
    } else {
      setSelectedServiceIdState(value.replace('service-', ''));
      setSelectedBookIdState('');
      setSelectedNaskahIdState('');
    }

    setDynamicInputs((prev) => ({
      ...prev,
      price: (option as any).price || 0,
    }));
  };
  
  // Dynamically set default values when activeProfile changes
  useEffect(() => {
    if (!activeProfile?.tableColumns) return;
    
    const initialInputs: Record<string, any> = {};
    activeProfile.tableColumns.forEach(col => {
      if (col.key === 'item_title') return;
      
      let defVal: any = '';
      if (col.key === 'quantity') {
        defVal = 1;
      } else if (col.key === 'price') {
        defVal = 0;
      } else if (col.key === 'pages') {
        defVal = '';
      } else if (col.key === 'paper_type') {
        defVal = '';
      } else if (col.key === 'item_shipping_cost') {
        defVal = 0;
      } else if (col.key === 'package_name') {
        defVal = '';
      } else if (col.key === 'copyright_holder') {
        defVal = customer.name || '';
      }
      initialInputs[col.key] = defVal;
    });
    
    setDynamicInputs(initialInputs);
    setCustomTitle('');
  }, [activeProfile, customer.name]);

  // Dapatkan daftar field input yang diperlukan untuk profil aktif
  const getRequiredFields = () => {
    if (!activeProfile?.tableColumns) return [];
    
    const fieldsMap = new Map<string, { key: string; label: string; type: 'text' | 'number' | 'currency' }>();
    
    activeProfile.tableColumns.forEach(col => {
      if (col.type !== 'formula') {
        fieldsMap.set(col.key, {
          key: col.key,
          label: col.label,
          type: col.type as 'text' | 'number' | 'currency'
        });
      } else if (col.formula) {
        const tokenRegex = /\{([^}]+)\}/g;
        let match;
        while ((match = tokenRegex.exec(col.formula)) !== null) {
          const tokenKey = match[1];
          if (!fieldsMap.has(tokenKey)) {
            let label = tokenKey;
            let type: 'text' | 'number' | 'currency' = 'text';
            
            if (tokenKey === 'quantity') {
              label = 'Jumlah';
              type = 'number';
            } else if (tokenKey === 'price') {
              label = 'Harga';
              type = 'currency';
            } else if (tokenKey === 'item_shipping_cost') {
              label = 'Ongkos Kirim';
              type = 'currency';
            } else if (tokenKey === 'package_name') {
              label = 'Nama Paket';
              type = 'text';
            } else if (tokenKey === 'pages') {
              label = 'Halaman';
              type = 'text';
            } else if (tokenKey === 'paper_type') {
              label = 'Jenis Naskah';
              type = 'text';
            } else if (tokenKey === 'copyright_holder') {
              label = 'Pemegang Hak Cipta';
              type = 'text';
            }
            
            fieldsMap.set(tokenKey, { key: tokenKey, label, type });
          }
        }
      }
    });
    
    const fields = Array.from(fieldsMap.values());
    const titleField = fields.find(f => f.key === 'item_title');
    const priceField = fields.find(f => f.key === 'price');
    const qtyField = fields.find(f => f.key === 'quantity');
    
    const otherFields = fields.filter(f => f.key !== 'item_title' && f.key !== 'price' && f.key !== 'quantity');
    
    const sortedFields = [];
    if (titleField) sortedFields.push(titleField);
    sortedFields.push(...otherFields);
    if (qtyField) sortedFields.push(qtyField);
    if (priceField) sortedFields.push(priceField);
    
    return sortedFields;
  };

  const handleEditMasterOption = (value: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (value.startsWith('service-')) {
      const id = parseInt(value.replace('service-', ''));
      const s = services.find(item => item.id === id);
      if (s) {
        setEditMasterType('service');
        setEditMasterData({
          id: s.id || 0,
          name: s.name,
          price: s.price,
          description: s.description || '',
          author_id: '',
        });
        setShowEditMasterModal(true);
      }
    } else if (value.startsWith('book-')) {
      const id = parseInt(value.replace('book-', ''));
      const b = books.find(item => item.id === id);
      if (b) {
        setEditMasterType('book');
        setEditMasterData({
          id: b.id || 0,
          name: b.title,
          price: b.regular_price,
          description: '',
          author_id: b.author_id ? String(b.author_id) : '',
        });
        setShowEditMasterModal(true);
      }
    }
  };

  const handleDeleteMasterOption = (value: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (value.startsWith('service-')) {
      const id = parseInt(value.replace('service-', ''));
      const s = services.find(item => item.id === id);
      if (s) {
        showConfirm({
          title: 'Hapus Layanan',
          message: `Apakah Anda yakin ingin menghapus layanan "${s.name}" dari master?`,
          confirmText: 'Hapus',
          type: 'danger',
          onConfirm: async () => {
            try {
              await deleteService(id);
              showToast('Layanan berhasil dihapus dari master!', 'success');
            } catch {
              showToast('Gagal menghapus layanan', 'error');
            }
          }
        });
      }
    } else if (value.startsWith('book-')) {
      const id = parseInt(value.replace('book-', ''));
      const b = books.find(item => item.id === id);
      if (b) {
        showConfirm({
          title: 'Hapus Karya / Buku',
          message: `Apakah Anda yakin ingin menghapus karya "${b.title}" dari master?`,
          confirmText: 'Hapus',
          type: 'danger',
          onConfirm: async () => {
            try {
              await deleteBook(id);
              showToast('Karya berhasil dihapus dari master!', 'success');
            } catch {
              showToast('Gagal menghapus karya', 'error');
            }
          }
        });
      }
    }
  };

  const handleSaveMasterEdit = async () => {
    if (editMasterType === 'service') {
      if (!editMasterData.name.trim()) {
        showToast('Nama layanan tidak boleh kosong!', 'error');
        return;
      }
      try {
        const s = services.find(item => item.id === editMasterData.id);
        if (s) {
          await updateService({
            ...s,
            name: editMasterData.name.trim(),
            price: editMasterData.price,
            description: editMasterData.description,
          });
          showToast('Data master layanan berhasil diperbarui!', 'success');
          setShowEditMasterModal(false);
        }
      } catch {
        showToast('Gagal memperbarui data master layanan', 'error');
      }
    } else {
      if (!editMasterData.name.trim()) {
        showToast('Judul karya tidak boleh kosong!', 'error');
        return;
      }
      try {
        const b = books.find(item => item.id === editMasterData.id);
        if (b) {
          await updateBook({
            ...b,
            title: editMasterData.name.trim(),
            regular_price: editMasterData.price,
            author_id: editMasterData.author_id ? parseInt(editMasterData.author_id) : undefined,
          });
          showToast('Data master karya berhasil diperbarui!', 'success');
          setShowEditMasterModal(false);
        }
      } catch {
        showToast('Gagal memperbarui data master karya', 'error');
      }
    }
  };

  const handleStartEdit = (index: number) => {
    const item = items[index];
    setEditingIndex(index);
    setCustomTitle(item.item_title);
    
    // Cari relasi
    if (item.book_id) {
      setSelectedBookIdState(String(item.book_id));
      setSelectedServiceIdState('');
      setSelectedNaskahIdState('');
    } else if (item.naskah_id) {
      setSelectedNaskahIdState(String(item.naskah_id));
      setSelectedBookIdState('');
      setSelectedServiceIdState('');
    } else {
      const matchedService = services.find(s => s.name === item.item_title);
      if (matchedService) {
        setSelectedServiceIdState(String(matchedService.id));
        setSelectedBookIdState('');
        setSelectedNaskahIdState('');
      } else {
        setSelectedServiceIdState('');
        setSelectedBookIdState('');
        setSelectedNaskahIdState('');
      }
    }

    // Muat dynamic inputs
    const inputs: Record<string, any> = {};
    activeProfile?.tableColumns?.forEach(col => {
      if (col.key in item) {
        inputs[col.key] = item[col.key];
      }
    });
    setDynamicInputs(inputs);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    let finalTitle = customTitle.trim();
    let finalPrice = parseFloat(dynamicInputs['price']) || 0;
    const finalQty = parseInt(dynamicInputs['quantity']) || 1;

    if (selectedServiceIdState) {
      const service = services.find((s) => s.id === parseInt(selectedServiceIdState));
      if (service) {
        if (!finalTitle) finalTitle = service.name;
        if (finalPrice === 0) finalPrice = service.price;
      }
    } else if (selectedBookIdState) {
      const book = books.find((b) => b.id === parseInt(selectedBookIdState));
      if (book) {
        if (!finalTitle) finalTitle = book.title;
        if (finalPrice === 0) finalPrice = book.regular_price;
      }
    }

    if (!finalTitle) {
      showToast('Judul buku atau layanan harus diisi!', 'error');
      return;
    }

    const updatedItem: Partial<InvoiceItem> = {
      book_id: selectedBookIdState ? parseInt(selectedBookIdState) : 0,
      naskah_id: selectedNaskahIdState ? parseInt(selectedNaskahIdState) : undefined,
      item_title: finalTitle,
      quantity: finalQty,
      price: finalPrice,
    };

    activeProfile?.tableColumns?.forEach(col => {
      if (col.key !== 'item_title' && col.key !== 'price' && col.key !== 'quantity' && col.key !== 'total') {
        updatedItem[col.key] = dynamicInputs[col.key];
      }
    });

    updateItem(editingIndex, updatedItem);
    showToast('Item berhasil diperbarui!', 'success');
    handleCancelEdit();
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setCustomTitle('');
    setSelectedServiceIdState('');
    setSelectedBookIdState('');
    setSelectedNaskahIdState('');
    
    if (activeProfile?.tableColumns) {
      const initialInputs: Record<string, any> = {};
      activeProfile.tableColumns.forEach(col => {
        if (col.key === 'item_title') return;
        let defVal: any = '';
        if (col.key === 'quantity') defVal = 1;
        else if (col.key === 'price') defVal = 0;
        else if (col.key === 'copyright_holder') defVal = customer.name || '';
        initialInputs[col.key] = defVal;
      });
      setDynamicInputs(initialInputs);
    }
  };
  
  const handleAddItem = () => {
    let finalTitle = customTitle.trim();
    let finalPrice = parseFloat(dynamicInputs['price']) || 0;
    const finalQty = parseInt(dynamicInputs['quantity']) || 1;

    if (selectedServiceIdState) {
      const service = services.find((s) => s.id === parseInt(selectedServiceIdState));
      if (service) {
        if (!finalTitle) finalTitle = service.name;
        if (finalPrice === 0) {
          finalPrice = service.price;
        }
      }
    } else if (selectedBookIdState) {
      const book = books.find((b) => b.id === parseInt(selectedBookIdState));
      if (book) {
        if (!finalTitle) finalTitle = book.title;
        if (finalPrice === 0) {
          finalPrice = book.regular_price;
        }
      }
    } else if (selectedNaskahIdState) {
      const n = naskah.find((nk) => nk.id === parseInt(selectedNaskahIdState));
      if (n) {
        if (!finalTitle) finalTitle = n.title;
      }
    }

    if (!finalTitle) {
      showToast('Judul buku atau layanan harus diisi!', 'error');
      return;
    }

    const newItem: InvoiceItem = {
      book_id: selectedBookIdState ? parseInt(selectedBookIdState) : 0,
      naskah_id: selectedNaskahIdState ? parseInt(selectedNaskahIdState) : undefined,
      item_title: finalTitle,
      quantity: finalQty,
      price: finalPrice,
      discount: 0,
      ...dynamicInputs
    };

    addItem(newItem);

    // Reset form item
    setCustomTitle('');
    setSelectedServiceIdState('');
    setSelectedBookIdState('');
    setSelectedNaskahIdState('');
    
    if (activeProfile?.tableColumns) {
      const initialInputs: Record<string, any> = {};
      activeProfile.tableColumns.forEach(col => {
        if (col.key === 'item_title') return;
        
        let defVal: any = '';
        if (col.key === 'quantity') {
          defVal = 1;
        } else if (col.key === 'price') {
          defVal = 0;
        } else if (col.key === 'pages') {
          defVal = '';
        } else if (col.key === 'paper_type') {
          defVal = '';
        } else if (col.key === 'item_shipping_cost') {
          defVal = 0;
        } else if (col.key === 'package_name') {
          defVal = '';
        } else if (col.key === 'copyright_holder') {
          defVal = customer.name || '';
        }
        initialInputs[col.key] = defVal;
      });
      setDynamicInputs(initialInputs);
    }
  };

  return (
    <>
      {activeProfile?.customLayouts && activeProfile.customLayouts.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSelectedLayoutId('')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '6px',
              cursor: 'pointer',
              border: '1px solid ' + (selectedLayoutId === '' ? 'var(--accent)' : 'var(--border)'),
              background: selectedLayoutId === '' ? 'var(--accent)' : 'transparent',
              color: selectedLayoutId === '' ? '#fff' : 'var(--text-primary)',
              transition: 'all 0.15s ease'
            }}
          >
            {activeProfile?.defaultLayoutName || 'Default / Bawaan'}
          </button>
          {activeProfile.customLayouts.map((layout) => (
            <button
              key={layout.id}
              type="button"
              onClick={() => setSelectedLayoutId(layout.id)}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                border: '1px solid ' + (selectedLayoutId === layout.id ? 'var(--accent)' : 'var(--border)'),
                background: selectedLayoutId === layout.id ? 'var(--accent)' : 'transparent',
                color: selectedLayoutId === layout.id ? '#fff' : 'var(--text-primary)',
                transition: 'all 0.15s ease'
              }}
            >
              {layout.name}
            </button>
          ))}
        </div>
      )}

      {/* Input Form Item */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <SmartRelationField
              label="Judul Buku / Layanan"
              options={allItemOptions}
              value={selectedValue}
              onChange={handleSelect}
              placeholder="Ketik judul buku / layanan atau pilih dari Master..."
              emptyMessage="Belum ada data. Tekan Enter atau klik + Buku/Layanan Baru untuk membuat."
              entityLabel="Buku/Layanan"
              entityLabelPlural="Buku/Layanan"
              fullWidth
              mode="autocomplete"
              onEditOption={handleEditMasterOption}
              onDeleteOption={handleDeleteMasterOption}
              onSearchChange={(search) => setCreateFormData(prev => ({ ...prev, name: search, title: search }))}
              renderCreateForm={({ onSave, onCancel }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Tab Selector */}
                  <div style={{
                    display: 'flex',
                    background: 'var(--bg-panel)',
                    padding: '4px',
                    borderRadius: '8px',
                    gap: '4px',
                    border: '1px solid var(--border)'
                  }}>
                    <button
                      type="button"
                      onClick={() => setCreateType('service')}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: createType === 'service' ? 'var(--bg-card)' : 'transparent',
                        color: createType === 'service' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: createType === 'service' ? '600' : '500',
                        fontSize: '12px',
                        boxShadow: createType === 'service' ? '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Layanan (Jasa)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreateType('book')}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: createType === 'book' ? 'var(--bg-card)' : 'transparent',
                        color: createType === 'book' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: createType === 'book' ? '600' : '500',
                        fontSize: '12px',
                        boxShadow: createType === 'book' ? '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Karya (Buku)
                    </button>
                  </div>

                  {createType === 'service' ? (
                    <>
                      <input
                        type="text"
                        placeholder="Nama Layanan Baru"
                        value={createFormData.name}
                        onChange={(e) => setCreateFormData((prev) => ({ ...prev, name: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          boxSizing: 'border-box',
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Tarif (Rp)"
                        value={createFormData.price || ''}
                        onChange={(e) => setCreateFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          boxSizing: 'border-box',
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Deskripsi (Opsional)"
                        value={createFormData.description}
                        onChange={(e) => setCreateFormData((prev) => ({ ...prev, description: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          boxSizing: 'border-box',
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Judul Karya Baru"
                        value={createFormData.title}
                        onChange={(e) => setCreateFormData((prev) => ({ ...prev, title: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          boxSizing: 'border-box',
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Harga (Rp)"
                        value={createFormData.regular_price || ''}
                        onChange={(e) => setCreateFormData((prev) => ({ ...prev, regular_price: parseFloat(e.target.value) || 0 }))}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          boxSizing: 'border-box',
                        }}
                      />
                      <select
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          boxSizing: 'border-box',
                        }}
                        value={createFormData.author_id}
                        onChange={(e) => setCreateFormData((prev) => ({ ...prev, author_id: e.target.value }))}
                      >
                        <option value="">-- Pilih Penulis --</option>
                        {penulisList.map((p) => (
                          <option key={p.id} value={String(p.id)}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </>
                  )}

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn-secondary" type="button" onClick={onCancel}>
                      Batal
                    </button>
                    <button
                      className="btn-primary"
                      type="button"
                      onClick={() => handleCreateItem(() => onSave({}))}
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {getRequiredFields().map((field) => {
            if (field.key === 'item_title') return null;

            return (
              <div key={field.key} style={{ flex: field.key === 'copyright_holder' ? 2 : 1, minWidth: '110px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>{field.label}</label>
                <input
                  type={field.type === 'number' || field.type === 'currency' ? 'number' : 'text'}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-panel)', color: 'var(--text-primary)' }}
                  value={dynamicInputs[field.key] !== undefined ? dynamicInputs[field.key] : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDynamicInputs(prev => ({
                      ...prev,
                      [field.key]: field.type === 'number' || field.type === 'currency' ? (parseFloat(val) || 0) : val
                    }));
                  }}
                  placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                  min={field.key === 'quantity' ? "1" : undefined}
                />
              </div>
            );
          })}
        </div>

        {/* Tombol Tambah / Edit */}
        {editingIndex === null ? (
          <button
            className="btn-primary"
            onClick={handleAddItem}
            style={{ width: '100%', padding: '10px', fontSize: '14px', fontWeight: '600', borderRadius: '8px', marginTop: '4px' }}
          >
            + Tambah Item
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              className="btn-secondary"
              onClick={handleCancelEdit}
              style={{ flex: 1, padding: '10px', fontSize: '14px', fontWeight: '600', borderRadius: '8px' }}
            >
              Batal
            </button>
            <button
              className="btn-primary"
              onClick={handleSaveEdit}
              style={{ flex: 2, padding: '10px', fontSize: '14px', fontWeight: '600', borderRadius: '8px' }}
            >
              💾 Simpan Perubahan
            </button>
          </div>
        )}
      </div>

      {/* List Item */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}>
            <span style={{ fontWeight: '600', width: '20px', color: 'var(--text-secondary)' }}>{index + 1}.</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>"{item.item_title}"</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {/* Tampilkan ringkasan item berdasarkan kolom yang aktif secara dinamis */}
                {activeProfile?.tableColumns?.filter(col => col.type !== 'formula' && col.key !== 'item_title').map(col => {
                  const val = item[col.key];
                  if (val === undefined || val === null || val === '') return null;
                  const displayVal = col.type === 'currency' ? formatPrice(Number(val)) : String(val);
                  return `${col.label}: ${displayVal}`;
                }).filter(Boolean).join(' | ')}
              </div>
            </div>
            <span style={{ fontWeight: '700', color: 'var(--text-primary)', minWidth: '100px', textAlign: 'right' }}>
              {formatPrice(calculateItemTotal(item))}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                type="button"
                className="btn-secondary" 
                onClick={() => handleStartEdit(index)} 
                title="Ubah Item"
                style={{ padding: '6px 10px', borderRadius: '6px', minWidth: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✏️
              </button>
              <button 
                type="button"
                className="btn-danger" 
                onClick={() => {
                  if (editingIndex === index) {
                    handleCancelEdit();
                  }
                  removeItem(index);
                }} 
                title="Hapus Item"
                style={{ padding: '6px 10px', borderRadius: '6px', minWidth: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Edit Master Layanan / Karya */}
      <Modal
        open={showEditMasterModal}
        onClose={() => setShowEditMasterModal(false)}
        title={editMasterType === 'service' ? 'Ubah Data Master Layanan' : 'Ubah Data Master Karya'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              {editMasterType === 'service' ? 'Nama Layanan' : 'Judul Karya'}
            </label>
            <input
              type="text"
              value={editMasterData.name}
              onChange={(e) => setEditMasterData(prev => ({ ...prev, name: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              {editMasterType === 'service' ? 'Tarif (Rp)' : 'Harga Reguler (Rp)'}
            </label>
            <input
              type="number"
              value={editMasterData.price}
              onChange={(e) => setEditMasterData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          {editMasterType === 'service' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Deskripsi</label>
              <input
                type="text"
                value={editMasterData.description}
                onChange={(e) => setEditMasterData(prev => ({ ...prev, description: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Penulis</label>
              <select
                value={editMasterData.author_id}
                onChange={(e) => setEditMasterData(prev => ({ ...prev, author_id: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
              >
                <option value="">-- Pilih Penulis --</option>
                {penulisList.map(p => (
                  <option key={p.id} value={String(p.id)}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button className="btn-secondary" type="button" onClick={() => setShowEditMasterModal(false)}>
              Batal
            </button>
            <button className="btn-primary" type="button" onClick={handleSaveMasterEdit}>
              Perbarui
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
