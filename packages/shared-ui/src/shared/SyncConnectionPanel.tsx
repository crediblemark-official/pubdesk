import React, { useEffect, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Belum pernah';
  const diff = Date.now() - new Date(dateStr).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 10) return 'baru saja';
  if (sec < 60) return `${sec} detik lalu`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} menit lalu`;
  const jam = Math.floor(min / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  return `${hari} hari lalu`;
}

export const SyncConnectionPanel: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const showMsg = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(null), 3000); };

  const load = useCallback(async () => {
    try {
      const raw = await invoke<string>('get_sync_config_full');
      const c = JSON.parse(raw);
      setEnabled(c.enabled);
      setWorkspaceId(c.workspace_id);
      setDeviceId(c.device_id);

      const st = await invoke<any>('get_sync_status');
      setLastSyncAt(st.last_sync_at || null);
      setError(st.error || null);
    } catch {}
  }, []);

  useEffect(() => { load(); const i = setInterval(load, 5000); return () => clearInterval(i); }, [load]);

  const toggle = async () => {
    try {
      await invoke('set_sync_enabled', { enabled: !enabled });
      setEnabled(!enabled);
    } catch (e: any) { showMsg('Gagal: ' + (e.message || String(e))); }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const raw = await invoke<string>('test_sync_connection');
      const r = JSON.parse(raw);
      if (r.gas_ok) showMsg('GAS terhubung secara sukses.');
      else showMsg('Gagal terhubung ke GAS: ' + (r.gas_error || 'tidak ada koneksi'));
    } catch (e: any) {
      showMsg('Test gagal: ' + (e.message || String(e)));
    } finally { setTesting(false); }
  };

  return (
    <div style={{ width: '100%', padding: '8px 0' }}>
      <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        Sinkronisasi
      </h2>

      {message && (
        <div style={{ marginBottom: '16px', padding: '10px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '12px', color: '#10b981' }}>
          {message}
        </div>
      )}

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderLeft: `4px solid ${enabled ? '#10b981' : '#ef4444'}`, marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: enabled ? '#10b981' : '#ef4444', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Status</div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>{enabled ? 'Aktif' : 'Nonaktif'}</div>
          </div>
        </div>
        <button onClick={toggle} style={btnSecondaryStyle}>{enabled ? 'Matikan' : 'Aktifkan'}</button>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div style={{ flex: 1, minWidth: '100px', padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Sync Terakhir</div>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>{timeAgo(lastSyncAt)}</div>
        </div>
        <div style={{ flex: 1, minWidth: '100px', padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Device ID</div>
          <div style={{ fontSize: '12px', fontWeight: 600, wordBreak: 'break-all' }} title={deviceId || ''}>{(deviceId || '-').slice(0, 12)}...</div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '8px 12px', marginBottom: '16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '12px' }}>
          Error: {error}
        </div>
      )}

      {workspaceId && (
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Workspace: <code style={{ fontSize: '11px', wordBreak: 'break-all' }}>{workspaceId}</code>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button onClick={testConnection} disabled={testing} style={btnSecondaryStyle}>
          {testing ? 'Testing...' : 'Test Koneksi'}
        </button>
        <SyncNowButton />
      </div>

      {/* Config */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>Konfigurasi</h4>
        <SyncConfigForm onSaved={() => { load(); showMsg('Konfigurasi disimpan.'); }} />
      </div>
    </div>
  );
};

const SyncNowButton: React.FC = () => {
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const syncNow = async () => {
    setSyncing(true);
    try {
      const raw = await invoke<string>('run_sync_now');
      const r = JSON.parse(raw);
      setMsg(`Push: ${r.pushed}, Pull: ${r.pulled}` + (r.error ? ` (Error: ${r.error})` : ''));
    } catch (e: any) {
      setMsg('Gagal: ' + (e.message || String(e)));
    } finally { setSyncing(false); setTimeout(() => setMsg(null), 5000); }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button onClick={syncNow} disabled={syncing} style={btnPrimaryStyle}>
        {syncing ? 'Syncing...' : 'Sync Sekarang'}
      </button>
      {msg && <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{msg}</span>}
    </div>
  );
};

const SyncConfigForm: React.FC<{ onSaved: () => void }> = ({ onSaved }) => {
  const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbznI3Q4IqjG1T3BvduLlymBJUaMaNdDNjj4OF9krkfjUsXIvAamD8emMcZedwd5El0e2g/exec';
  const DEFAULT_GAS_TOKEN = 'PubDesk_Secret_Token_2026';

  const [gasUrl, setGasUrl] = useState(DEFAULT_GAS_URL);
  const [gasToken, setGasToken] = useState(DEFAULT_GAS_TOKEN);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    invoke<string>('get_sync_config_full').then((raw) => {
      try {
        const c = JSON.parse(raw);
        setGasUrl(c.gas_url || DEFAULT_GAS_URL);
        setGasToken(c.gas_token || DEFAULT_GAS_TOKEN);
      } catch {}
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await invoke('set_sync_config', { syncMethod: 'gas', workerUrl: '', gasUrl, gasToken });
      onSaved();
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        URL Google Apps Script
        <input type="text" value={gasUrl} onChange={(e) => setGasUrl(e.target.value)} style={{ ...inputStyle, marginTop: '4px' }} />
      </label>
      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        Token GAS
        <input type="text" value={gasToken} onChange={(e) => setGasToken(e.target.value)} style={{ ...inputStyle, marginTop: '4px' }} />
      </label>
      <button onClick={save} disabled={saving} style={btnPrimaryStyle}>
        {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
      </button>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', marginBottom: '10px', borderRadius: '0px',
  border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)',
  fontSize: '13px', outline: 'none', boxSizing: 'border-box',
};
const btnPrimaryStyle: React.CSSProperties = {
  width: '100%', padding: '10px', borderRadius: '0px', border: 'none',
  background: '#10b981', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
};
const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 14px', borderRadius: '0px', border: '1px solid var(--border)',
  background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '12px', cursor: 'pointer',
};
