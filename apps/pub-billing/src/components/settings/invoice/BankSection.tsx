import React from 'react';
import { useSettingsForm } from './SettingsFormContext';
import { useAppContext } from '../../../contexts/AppContext';

const BankSection: React.FC = () => {
  const {
    showBankInfo,
    setShowBankInfo,
    bankName,
    setBankName,
    bankAccountNo,
    setBankAccountNo,
    bankAccountOwner,
    setBankAccountOwner
  } = useSettingsForm();

  const { rightPanelVisible } = useAppContext();

  const names = bankName ? bankName.split('|') : [''];
  const nos = bankAccountNo ? bankAccountNo.split('|') : [''];
  const owners = bankAccountOwner ? bankAccountOwner.split('|') : [''];
  const maxLen = Math.max(names.length, nos.length, owners.length);

  const updateItem = (index: number, field: 'name' | 'no' | 'owner', value: string) => {
    const newNames = [...names];
    const newNos = [...nos];
    const newOwners = [...owners];

    while (newNames.length < maxLen) newNames.push('');
    while (newNos.length < maxLen) newNos.push('');
    while (newOwners.length < maxLen) newOwners.push('');

    if (field === 'name') newNames[index] = value;
    if (field === 'no') newNos[index] = value;
    if (field === 'owner') newOwners[index] = value;

    setBankName(newNames.join('|'));
    setBankAccountNo(newNos.join('|'));
    setBankAccountOwner(newOwners.join('|'));
  };

  const addItem = () => {
    if (maxLen >= 3) return;

    const newNames = [...names, ''];
    const newNos = [...nos, ''];
    const newOwners = [...owners, ''];

    setBankName(newNames.join('|'));
    setBankAccountNo(newNos.join('|'));
    setBankAccountOwner(newOwners.join('|'));
  };

  const removeItem = (index: number) => {
    if (maxLen <= 1) return;

    const newNames = names.filter((_, i) => i !== index);
    const newNos = nos.filter((_, i) => i !== index);
    const newOwners = owners.filter((_, i) => i !== index);

    setBankName(newNames.join('|'));
    setBankAccountNo(newNos.join('|'));
    setBankAccountOwner(newOwners.join('|'));
  };

  return (
    <>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <input
            type="checkbox"
            id="showBankInfo"
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            checked={showBankInfo}
            onChange={(e) => setShowBankInfo(e.target.checked)}
          />
          <label htmlFor="showBankInfo" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', cursor: 'pointer' }}>
            Tampilkan Blok Informasi Bank
          </label>
        </div>

        {showBankInfo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Array.from({ length: maxLen }).map((_, index) => {
              const nameVal = names[index] || '';
              const noVal = nos[index] || '';
              const ownerVal = owners[index] || '';

              return (
                <div 
                  key={index}
                  style={{ 
                    border: '1px solid var(--border)', 
                    borderRadius: '8px', 
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.02)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                      Rekening #{index + 1}
                    </span>
                    {maxLen > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent)',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'background 0.1s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        🗑️ Hapus Rekening
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: rightPanelVisible ? '1fr' : '1.2fr 1fr 1.2fr', gap: '12px' }}>
                    <div className="compact-form-group">
                      <label className="compact-label">Nama Bank / Layanan</label>
                      <input
                        type="text"
                        className="compact-input"
                        style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                        value={nameVal}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        placeholder="Contoh: BCA / Mandiri / BSI"
                      />
                    </div>

                    <div className="compact-form-group">
                      <label className="compact-label">Nomor Rekening</label>
                      <input
                        type="text"
                        className="compact-input"
                        style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                        value={noVal}
                        onChange={(e) => updateItem(index, 'no', e.target.value)}
                        placeholder="Contoh: 7187174923"
                      />
                    </div>

                    <div className="compact-form-group">
                      <label className="compact-label">Nama Pemilik Rekening</label>
                      <input
                        type="text"
                        className="compact-input"
                        style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                        value={ownerVal}
                        onChange={(e) => updateItem(index, 'owner', e.target.value)}
                        placeholder="Contoh: Ahmad Fathur Rozaq"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {maxLen < 3 && (
              <button
                type="button"
                className="btn-secondary compact-btn"
                onClick={addItem}
                style={{ 
                  alignSelf: 'flex-start',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  padding: '6px 12px',
                  height: '32px'
                }}
              >
                ➕ Tambah Rekening Lain ({3 - maxLen} Tersisa)
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default BankSection;
