import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAppContext } from '../../../contexts/AppContext';
import { WorkflowTemplate, WorkflowTemplateStep } from '../../../types/workflow.types';
import { TextField } from '../../../ui/atoms/TextField';
import { Select } from '../../../ui/atoms/Select';
import { Button } from '../../../ui/atoms/Button';

const WorkflowTemplatesTab: React.FC = () => {
  const { showToast } = useAppContext();
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [steps, setSteps] = useState<WorkflowTemplateStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);

  // State untuk form template baru
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // State untuk form langkah baru
  const [stepSelect, setStepSelect] = useState('Penulisan');
  const [customStepInput, setCustomStepInput] = useState('');
  const [defaultDuration, setDefaultDuration] = useState('5');

  // Mengambil daftar template
  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await invoke<WorkflowTemplate[]>('get_workflow_templates');
      setTemplates(data || []);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat template alur kerja', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Mengambil langkah-langkah detail template terpilih
  const loadSteps = async (templateId: number) => {
    setIsLoadingSteps(true);
    try {
      const data = await invoke<WorkflowTemplateStep[]>('get_workflow_template_steps', { templateId });
      setSteps(data || []);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat langkah alur kerja', 'error');
    } finally {
      setIsLoadingSteps(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate?.id) {
      loadSteps(selectedTemplate.id);
    } else {
      setSteps([]);
    }
  }, [selectedTemplate]);

  // Submit template baru
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) {
      showToast('Nama rumus workflow tidak boleh kosong!', 'error');
      return;
    }

    try {
      const newTpl = {
        name: newTemplateName.trim(),
        description: newTemplateDesc.trim(),
        is_active: 1,
        created_at: new Date().toISOString()
      };
      const id = await invoke<number>('add_workflow_template', { template: newTpl });
      showToast('Rumus workflow berhasil dibuat!', 'success');
      setNewTemplateName('');
      setNewTemplateDesc('');
      setShowCreateForm(false);
      await loadTemplates();
      // Pilih template yang baru saja dibuat
      const createdTpl: WorkflowTemplate = { ...newTpl, id };
      setSelectedTemplate(createdTpl);
    } catch (err) {
      console.error(err);
      showToast('Gagal membuat rumus workflow', 'error');
    }
  };

  // Hapus template
  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus rumus alur kerja ini? Semua langkah di dalamnya juga akan dihapus.')) {
      return;
    }

    try {
      await invoke('delete_workflow_template', { id });
      showToast('Rumus workflow berhasil dihapus', 'success');
      setSelectedTemplate(null);
      await loadTemplates();
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus rumus workflow', 'error');
    }
  };

  // Tambah langkah baru ke template
  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate?.id) return;

    const finalStepName = stepSelect === 'custom' ? customStepInput.trim() : stepSelect;
    if (!finalStepName) {
      showToast('Nama tahap tidak boleh kosong!', 'error');
      return;
    }

    try {
      const nextOrder = steps.length > 0 ? Math.max(...steps.map(s => s.step_order)) + 1 : 1;
      const newStep: WorkflowTemplateStep = {
        template_id: selectedTemplate.id,
        step_order: nextOrder,
        step_name: finalStepName,
        default_duration_days: Number(defaultDuration) || 0,
        is_required: 1
      };

      await invoke('add_workflow_template_step', { step: newStep });
      showToast('Langkah berhasil ditambahkan!', 'success');
      setCustomStepNameState();
      await loadSteps(selectedTemplate.id);
    } catch (err) {
      console.error(err);
      showToast('Gagal menambahkan langkah', 'error');
    }
  };

  const setCustomStepNameState = () => {
    setCustomStepInput('');
    setDefaultDuration('5');
  };

  return (
    <div style={{ display: 'flex', gap: '24px', height: '100%', alignItems: 'start' }}>
      {/* Panel Kiri: Daftar Template */}
      <div style={{
        width: '320px',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
            📋 Rumus Alur Kerja
          </h3>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {showCreateForm ? 'Batal' : '➕ Baru'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateTemplate} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'var(--bg-card)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
            <TextField
              required
              label="Nama Rumus"
              placeholder="Misal: Paket Novel Reguler"
              value={newTemplateName}
              onChange={e => setNewTemplateName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Deskripsi (Opsional)"
              placeholder="Keterangan alur..."
              value={newTemplateDesc}
              onChange={e => setNewTemplateDesc(e.target.value)}
              fullWidth
            />
            <Button type="submit" variant="primary" size="sm" fullWidth>
              Simpan Rumus
            </Button>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '400px' }}>
          {isLoading ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', padding: '12px' }}>
              Memuat data...
            </div>
          ) : templates.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', padding: '12px' }}>
              Belum ada rumus workflow.
            </div>
          ) : (
            templates.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                style={{
                  padding: '10px 12px',
                  background: selectedTemplate?.id === t.id ? 'var(--accent)' : 'var(--bg-card)',
                  color: selectedTemplate?.id === t.id ? '#fff' : 'var(--text-primary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '13px' }}>{t.name}</div>
                {t.description && (
                  <div style={{
                    fontSize: '11px',
                    color: selectedTemplate?.id === t.id ? '#e0e0e0' : 'var(--text-secondary)',
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {t.description}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Panel Kanan: Detail Template & Langkah */}
      <div style={{
        flex: 1,
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '20px',
        minHeight: '300px'
      }}>
        {selectedTemplate ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {selectedTemplate.name}
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {selectedTemplate.description || 'Tidak ada deskripsi.'}
                </p>
              </div>
              <button
                onClick={() => selectedTemplate.id && handleDeleteTemplate(selectedTemplate.id)}
                style={{
                  background: 'transparent',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#ef4444';
                }}
              >
                🗑️ Hapus Rumus
              </button>
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Tahapan Alur Kerja (Urutan Eksekusi)
              </h3>

              {isLoadingSteps ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', padding: '12px 0' }}>
                  Memuat tahapan...
                </div>
              ) : steps.length === 0 ? (
                <div style={{
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  padding: '24px',
                  background: 'var(--bg-card)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px dashed var(--border)'
                }}>
                  Belum ada langkah di dalam rumus ini. Silakan tambahkan langkah di bawah.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {steps.map((s, idx) => (
                    <div
                      key={s.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          background: 'var(--accent)',
                          color: '#fff',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          {s.step_order}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {s.step_name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          ⏱️ Durasi Bawaan: <strong>{s.default_duration_days} Hari</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Tambah Langkah */}
            <form onSubmit={handleAddStep} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                ➕ Tambah Tahap Baru ke Rumus
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'end' }}>
                <Select
                  label="Pilih Tahapan"
                  value={stepSelect}
                  onChange={e => setStepSelect(e.target.value)}
                  options={[
                    { value: 'Penulisan', label: 'Penulisan' },
                    { value: 'Editing', label: 'Editing (Penyuntingan)' },
                    { value: 'Layouting', label: 'Layouting (Tata Letak)' },
                    { value: 'Desain Cover', label: 'Desain Cover (Sampul)' },
                    { value: 'Proofreading', label: 'Proofreading (Koreksi)' },
                    { value: 'Legalitas', label: 'Legalitas (ISBN/QRCBN)' },
                    { value: 'Cetak', label: 'Cetak (Produksi Fisik)' },
                    { value: 'Distribusi', label: 'Distribusi / Pemasaran' },
                    { value: 'custom', label: 'Tulis Kustom...' }
                  ]}
                  fullWidth
                />
                <TextField
                  label="Durasi Bawaan (Hari)"
                  type="number"
                  min="0"
                  value={defaultDuration}
                  onChange={e => setDefaultDuration(e.target.value)}
                  fullWidth
                />
              </div>

              {stepSelect === 'custom' && (
                <TextField
                  required
                  label="Nama Tahap Kustom"
                  placeholder="Masukkan nama tahapan kustom..."
                  value={customStepInput}
                  onChange={e => setCustomStepInput(e.target.value)}
                  fullWidth
                />
              )}

              <Button type="submit" variant="primary" size="sm" style={{ alignSelf: 'flex-end', minWidth: '150px' }}>
                Tambah Tahap
              </Button>
            </form>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '240px',
            color: 'var(--text-secondary)'
          }}>
            <span>👈 Pilih rumus workflow di sebelah kiri untuk melihat atau mengelola tahapan detailnya.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowTemplatesTab;
