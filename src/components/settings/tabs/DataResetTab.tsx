import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAppContext } from '../../../contexts/AppContext';

const DataResetTab: React.FC = () => {
  const { showToast } = useAppContext();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await invoke<string>('seed_sample_data');
      showToast(result, 'success');
    } catch (err) {
      showToast(`Gagal memuat sample data: ${err}`, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setIsResetting(true);
    try {
      const result = await invoke<string>('reset_workflow_data');
      showToast(result, 'success');
      setConfirmReset(false);
    } catch (err) {
      showToast(`Gagal mereset data: ${err}`, 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
        Data & Reset
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 24px 0' }}>
        Kelola data sample untuk pengujian fitur produksi naskah.
      </p>

      {/* Muat Data Sample */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', color: 'var(--text-primary)' }}>
              📦 Muat Data Sample
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Menyisipkan data contoh: 3 naskah, 3 tim, 12 tugas dengan berbagai status,
              riwayat perubahan, kendala, dan approval. Cocok untuk demo dan pengujian.
            </p>
          </div>
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            style={{
              padding: '8px 20px',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: isSeeding ? 'wait' : 'pointer',
              fontSize: '13px',
              whiteSpace: 'nowrap',
              marginLeft: '16px',
              opacity: isSeeding ? 0.7 : 1
            }}
          >
            {isSeeding ? 'Memuat...' : 'Muat Sample'}
          </button>
        </div>
      </div>

      {/* Reset Data Workflow */}
      <div style={{
        background: 'var(--bg-card)',
        border: `1px solid ${confirmReset ? '#ef4444' : 'var(--border)'}`,
        borderRadius: '12px',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', color: confirmReset ? '#ef4444' : 'var(--text-primary)' }}>
              🗑️ Reset Data Workflow
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Menghapus semua data tugas, riwayat, kendala, approval, dan template workflow.
              <br />
              <strong style={{ color: 'var(--text-primary)' }}>Data master (naskah, tim, penulis, penerbit) tidak akan terhapus.</strong>
            </p>
            {confirmReset && (
              <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#ef4444', fontWeight: '600' }}>
                ⚠️ Klik sekali lagi untuk mengonfirmasi penghapusan.
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginLeft: '16px', flexShrink: 0 }}>
            {confirmReset && (
              <button
                onClick={() => setConfirmReset(false)}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Batal
              </button>
            )}
            <button
              onClick={handleReset}
              disabled={isResetting}
              style={{
                padding: '8px 20px',
                background: confirmReset ? '#ef4444' : 'transparent',
                color: confirmReset ? '#fff' : '#ef4444',
                border: confirmReset ? 'none' : '1px solid #ef4444',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: isResetting ? 'wait' : 'pointer',
                fontSize: '13px',
                whiteSpace: 'nowrap',
                opacity: isResetting ? 0.7 : 1
              }}
            >
              {isResetting ? 'Menghapus...' : confirmReset ? 'Ya, Hapus Semua' : 'Reset Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataResetTab;
