import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { useInvoiceContext } from '../../../contexts/InvoiceContext';
import { InvoiceItem } from '../../../types/invoice.types';
import { formatPrice } from '../../../utils/format';

export const ItemsSection: React.FC = () => {
  const { services, showToast } = useAppContext();
  const {
    customer,
    items,
    addItem,
    removeItem,
    calculateItemTotal,
    activeProfile,
  } = useInvoiceContext();

  const [customTitle, setCustomTitle] = useState('');
  const [selectedServiceIdState, setSelectedServiceIdState] = useState('');
  const [dynamicInputs, setDynamicInputs] = useState<Record<string, any>>({});

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
    }

    if (!finalTitle) {
      showToast('Nama layanan atau karya harus diisi!', 'error');
      return;
    }

    const newItem: InvoiceItem = {
      book_id: selectedServiceIdState ? parseInt(selectedServiceIdState) : 0,
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
      {/* Input Form Item */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>Nama Layanan / Karya</label>
            <input
              list="services-datalist"
              type="text"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-panel)', color: 'var(--text-primary)' }}
              value={customTitle}
              onChange={(e) => {
                const val = e.target.value;
                setCustomTitle(val);
                
                // Periksa jika input cocok dengan salah satu layanan master
                const matchedService = services.find(s => s.name === val);
                if (matchedService) {
                  setSelectedServiceIdState(String(matchedService.id));
                  setDynamicInputs(prev => ({
                    ...prev,
                    price: matchedService.price
                  }));
                } else {
                  setSelectedServiceIdState('');
                }
              }}
              placeholder="Ketik nama layanan / karya atau pilih dari Master Layanan..."
            />
            <datalist id="services-datalist">
              {services.map((service) => (
                <option key={service.id} value={service.name}>
                  Tarif: Rp {new Intl.NumberFormat('id-ID').format(service.price)}
                </option>
              ))}
            </datalist>
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

        {/* Tombol Tambah — full width di bawah form */}
        <button
          className="btn-primary"
          onClick={handleAddItem}
          style={{ width: '100%', padding: '10px', fontSize: '14px', fontWeight: '600', borderRadius: '8px', marginTop: '4px' }}
        >
          + Tambah Item
        </button>
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
                  const displayVal = col.type === 'currency' ? `Rp ${formatPrice(Number(val))}` : String(val);
                  return `${col.label}: ${displayVal}`;
                }).filter(Boolean).join(' | ')}
              </div>
            </div>
            <span style={{ fontWeight: '700', color: 'var(--text-primary)', minWidth: '100px', textAlign: 'right' }}>
              Rp {formatPrice(calculateItemTotal(item))}
            </span>
            <button className="btn-danger" onClick={() => removeItem(index)} style={{ padding: '6px 10px', borderRadius: '6px' }}>
              🗑️
            </button>
          </div>
        ))}
      </div>
    </>
  );
};
