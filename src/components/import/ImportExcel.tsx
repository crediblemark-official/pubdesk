import React, { useState } from 'react';
import * as xlsx from 'xlsx';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

interface ImportRow {
  judul: string;
  pic: string;
  tanggal: string;
  status: string;
  raw: any;
}

interface PreviewRow extends ImportRow {
  validationStatus: 'Valid' | 'Invalid' | 'Duplikat';
  action: string;
}

const ImportExcel: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [jenisImport, setJenisImport] = useState<'alur_naskah' | 'naskah_masuk' | 'legalitas'>('alur_naskah');
  const [filePath, setFilePath] = useState<string | null>(null);
  
  // Mapping State
  const [mapping, setMapping] = useState({
    judul: 'Judul Buku',
    pic: 'Layouter',
    tanggal: 'Tanggal',
    status: 'Status'
  });

  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);

  const [isImporting, setIsImporting] = useState(false);

  const handleSelectFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Excel', extensions: ['xlsx', 'xls'] }]
      });
      if (selected) {
        setFilePath(selected as string);
        
        // Read file bytes via rust
        const bytes = await invoke<number[]>('read_file_bytes', { path: selected as string });
        const buffer = new Uint8Array(bytes);
        
        // Parse with xlsx
        const workbook = xlsx.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const data = xlsx.utils.sheet_to_json(worksheet);
        
        if (data.length > 0) {
          const cols = Object.keys(data[0] as object);
          setAvailableColumns(cols);
          setRawData(data);
          
          // Auto-mapping if column names are similar
          const autoMap = { ...mapping };
          cols.forEach(col => {
            const lower = col.toLowerCase();
            if (lower.includes('judul')) autoMap.judul = col;
            else if (lower.includes('layouter') || lower.includes('pic')) autoMap.pic = col;
            else if (lower.includes('tanggal')) autoMap.tanggal = col;
            else if (lower.includes('status')) autoMap.status = col;
          });
          setMapping(autoMap);
        } else {
          setAvailableColumns([]);
          setRawData([]);
        }
        
        setStep(3);
      }
    } catch (err) {
      console.error('Gagal membuka file:', err);
    }
  };

  const handlePreview = () => {
    // Generate preview from rawData based on mapping
    const generatedPreview: PreviewRow[] = rawData.map(row => {
      const judul = row[mapping.judul] || '-';
      const pic = row[mapping.pic] || '-';
      const tanggalStr = row[mapping.tanggal] ? String(row[mapping.tanggal]) : '';
      const statusRaw = row[mapping.status] || '';
      
      // Validation Logic
      let validationStatus: 'Valid' | 'Invalid' | 'Duplikat' = 'Valid';
      let action = 'Import';
      
      if (!row[mapping.judul]) {
        validationStatus = 'Invalid';
        action = 'Perbaiki';
      }
      
      // Return mapped row
      return {
        validationStatus,
        action,
        judul,
        pic,
        tanggal: tanggalStr,
        status: String(statusRaw),
        raw: row
      };
    });

    setPreviewData(generatedPreview);
    setStep(4);
  };

  const handleRunImport = async () => {
    const validData = previewData.filter(d => d.validationStatus !== 'Invalid');
    if (validData.length === 0) {
      alert("Tidak ada data valid untuk diimpor!");
      return;
    }

    setIsImporting(true);
    try {
      const payloads = validData.map(d => ({
        judul: d.judul,
        pic: d.pic,
        tanggal: d.tanggal,
        status: d.status
      }));

      const count = await invoke<number>('import_alur_naskah_batch', { payloads });
      alert(`Berhasil mengimpor ${count} data!`);
      // Reset State
      setStep(1);
      setFilePath(null);
      setRawData([]);
      setPreviewData([]);
    } catch (err) {
      console.error("Gagal import batch:", err);
      alert("Gagal mengimpor data: " + String(err));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="module-content" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '28px', fontWeight: '700' }}>Import Excel Lama</h2>
        <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '15px' }}>
          Migrasi data dari file Excel lama ke sistem PubDesk.
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Step 1 to 3 View */}
        {step < 4 && (
          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '24px', maxWidth: '800px' }}>
            
            {/* Step 1 */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: 'var(--text-primary)' }}>Step 1: Jenis Import</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input type="radio" checked={jenisImport === 'alur_naskah'} onChange={() => setJenisImport('alur_naskah')} />
                  Alur Naskah
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input type="radio" checked={jenisImport === 'naskah_masuk'} onChange={() => setJenisImport('naskah_masuk')} />
                  Naskah Masuk
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input type="radio" checked={jenisImport === 'legalitas'} onChange={() => setJenisImport('legalitas')} />
                  Legalitas
                </label>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: 'var(--text-primary)' }}>Step 2: File</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button className="btn-secondary" onClick={handleSelectFile} style={{ padding: '8px 16px' }}>
                  Pilih File Excel
                </button>
                {filePath && <span style={{ color: 'var(--accent)', fontSize: '13px' }}>{filePath}</span>}
              </div>
            </div>

            {/* Step 3 */}
            {step === 3 && (
              <div style={{ marginBottom: '32px', padding: '16px', background: 'var(--bg-panel)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-primary)' }}>Step 3: Mapping Kolom</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px 1fr', gap: '16px', alignItems: 'center', marginBottom: '12px', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  <div>Kolom Excel</div>
                  <div></div>
                  <div>Field Sistem</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px 1fr', gap: '16px', alignItems: 'center' }}>
                    <select value={mapping.judul} onChange={e => setMapping({...mapping, judul: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                      {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <span style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>→</span>
                    <div style={{ padding: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>naskah.title</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px 1fr', gap: '16px', alignItems: 'center' }}>
                    <select value={mapping.pic} onChange={e => setMapping({...mapping, pic: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                      {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <span style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>→</span>
                    <div style={{ padding: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>tasks.assigned_team_id</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px 1fr', gap: '16px', alignItems: 'center' }}>
                    <select value={mapping.tanggal} onChange={e => setMapping({...mapping, tanggal: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                      {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <span style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>→</span>
                    <div style={{ padding: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>tasks.start_date</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px 1fr', gap: '16px', alignItems: 'center' }}>
                    <select value={mapping.status} onChange={e => setMapping({...mapping, status: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                      {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <span style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>→</span>
                    <div style={{ padding: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>tasks.status</div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-primary" onClick={handlePreview} disabled={step < 3} style={{ padding: '10px 20px', opacity: step < 3 ? 0.5 : 1 }}>
                Preview Data
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Preview View */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '24px', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                <span>Total: {previewData.length}</span>
                <span style={{ color: '#22c55e' }}>Valid: {previewData.filter(d => d.validationStatus === 'Valid').length}</span>
                <span style={{ color: '#ef4444' }}>Invalid: {previewData.filter(d => d.validationStatus === 'Invalid').length}</span>
                <span style={{ color: '#f59e0b' }}>Duplikat: {previewData.filter(d => d.validationStatus === 'Duplikat').length}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-secondary" onClick={() => setStep(3)} disabled={isImporting} style={{ padding: '8px 16px' }}>Kembali</button>
                <button className="btn-primary" onClick={handleRunImport} disabled={isImporting} style={{ padding: '8px 16px' }}>
                  {isImporting ? 'Mengimpor...' : 'Jalankan Import'}
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Status</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Judul Naskah</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>PIC</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Tanggal</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600',
                          background: row.validationStatus === 'Valid' ? 'rgba(34, 197, 94, 0.1)' : row.validationStatus === 'Duplikat' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: row.validationStatus === 'Valid' ? '#22c55e' : row.validationStatus === 'Duplikat' ? '#f59e0b' : '#ef4444'
                        }}>
                          {row.validationStatus}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: '500' }}>{row.judul}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{row.pic}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{row.tanggal || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button style={{ 
                          padding: '4px 12px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px'
                        }}>
                          {row.action}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportExcel;
