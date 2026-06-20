import React, { useState, useEffect } from 'react';
import { googleAppsScriptService } from '../../services/googleAppsScript';

interface GASCloudSettingsProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const GASCloudSettings: React.FC<GASCloudSettingsProps> = ({ showToast }) => {
  const [urlInput, setUrlInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const { url, token } = googleAppsScriptService.getSettings();
    setUrlInput(url);
    setTokenInput(token);
  }, []);

  const handleSave = () => {
    if (!urlInput.trim()) {
      showToast('URL Google Apps Script tidak boleh kosong!', 'error');
      return;
    }
    googleAppsScriptService.saveSettings(urlInput, tokenInput);
    showToast('Konfigurasi Google Apps Script berhasil disimpan!', 'success');
  };

  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      showToast('URL Google Apps Script kosong!', 'error');
      return;
    }

    setTesting(true);
    showToast('Menguji koneksi ke Google Apps Script...', 'info');

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const testUrl = `${urlInput.trim()}?auth_token=${encodeURIComponent(tokenInput.trim())}&action=get_invoices`;
      
      const responseText = await invoke<string>('call_gas_api', {
        url: testUrl,
        method: 'GET',
        payloadJson: null
      });

      const data = JSON.parse(responseText);
      if (data && data.status === 'error') {
        showToast(`Koneksi gagal! ${data.message}`, 'error');
      } else {
        showToast('Koneksi sukses! Google Apps Script merespons dengan benar.', 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Koneksi gagal! Error: ${err.message || String(err)}`, 'error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="compact-panel" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            ☁️ Integrasi Google Apps Script (Cloud Sheets & Drive)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
            Hubungkan PubDesk dengan Google Sheets (sebagai cloud database) dan Google Drive (sebagai cloud storage) melalui Web App Google Apps Script.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="compact-form-group">
              <label className="compact-label" style={{ color: 'var(--text-primary)', fontWeight: '600' }}>URL Web App Google Apps Script</label>
              <input
                type="text"
                className="compact-input"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <div className="compact-form-group">
              <label className="compact-label" style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Token Keamanan (Pre-shared Key)</label>
              <input
                type="password"
                className="compact-input"
                placeholder="Masukkan token rahasia..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <button
            type="button"
            className="btn-primary compact-btn"
            onClick={handleSave}
            disabled={testing}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            💾 Simpan Setelan
          </button>

          <button
            type="button"
            className="btn-secondary compact-btn"
            onClick={handleTestConnection}
            disabled={testing}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            🔌 Uji Koneksi
          </button>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <strong>Cara Memasang:</strong>
          <ol style={{ margin: '6px 0 0 18px', padding: 0 }}>
            <li>Buka dokumen API & kode draf GAS di folder proyek <code>docs/google-apps-script/</code>.</li>
            <li>Salin kodenya, tempel di menu <strong>Ekstensi {"→"} Apps Script</strong> di Google Sheets Anda.</li>
            <li>Deploy sebagai <strong>Web App</strong> dengan akses <strong>"Anyone"</strong>.</li>
            <li>Salin URL Web App dan simpan di atas. Masukkan token rahasia jika Anda menyetelnya di properti proyek Apps Script.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default GASCloudSettings;
