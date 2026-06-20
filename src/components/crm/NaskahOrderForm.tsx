import React, { useState, useEffect } from 'react';
import { NaskahOrder } from '../../types/crm.types';
import { useCrmContext } from '../../contexts/CrmContext';
import { useAppContext } from '../../contexts/AppContext';
import { TextField } from '../../ui/atoms/TextField';
import { Select } from '../../ui/atoms/Select';
import { Button } from '../../ui/atoms/Button';
import { Accordion, AccordionSection } from '../../ui/molecules/Accordion';

interface NaskahFormProps {
  initialData?: NaskahOrder | null;
  onSubmit: (data: Omit<NaskahOrder, 'created_at' | 'id'> & { id?: number }) => Promise<void>;
  onCancel: () => void;
}

const NaskahOrderForm: React.FC<NaskahFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { penulis, penerbit } = useCrmContext();
  const { showToast } = useAppContext();

  // Field identitas naskah
  const [naskahIdCode, setNaskahIdCode] = useState('');
  const [title, setTitle] = useState('');
  const [penulisId, setPenulisId] = useState<number | undefined>(undefined);
  const [penerbitId, setPenerbitId] = useState<number | undefined>(undefined);
  const [genre, setGenre] = useState('');
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [synopsis, setSynopsis] = useState('');
  const [status, setStatus] = useState('Belum Dimulai');

  // Field detail penerbitan
  const [packageType, setPackageType] = useState('Standar');
  const [orderType, setOrderType] = useState('Baru');
  const [copies, setCopies] = useState<number>(0);
  const [bookSize, setBookSize] = useState('14x20');
  const [legalType, setLegalType] = useState('ISBN');

  const [expandedSection, setExpandedSection] = useState<number | null>(1);

  useEffect(() => {
    if (initialData) {
      setNaskahIdCode(initialData.naskah_id_code || '');
      setTitle(initialData.title);
      setPenulisId(initialData.penulis_id || undefined);
      setPenerbitId(initialData.penerbit_id || undefined);
      setGenre(initialData.genre || '');
      setTotalPages(initialData.total_pages || undefined);
      setSynopsis(initialData.synopsis || '');
      setStatus(initialData.status);
      setPackageType(initialData.package_type || 'Standar');
      setOrderType(initialData.order_type || 'Baru');
      setCopies(initialData.copies || 0);
      setBookSize(initialData.book_size || '14x20');
      setLegalType(initialData.legal_type || 'ISBN');
    } else {
      setNaskahIdCode('');
      setTitle('');
      setPenulisId(undefined);
      setPenerbitId(undefined);
      setGenre('');
      setTotalPages(undefined);
      setSynopsis('');
      setStatus('Belum Dimulai');
      setPackageType('Standar');
      setOrderType('Baru');
      setCopies(0);
      setBookSize('14x20');
      setLegalType('ISBN');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Judul naskah tidak boleh kosong!', 'error');
      return;
    }

    onSubmit({
      id: initialData?.id,
      naskah_id_code: naskahIdCode.trim() || undefined,
      title: title.trim(),
      penulis_id: penulisId || undefined,
      penerbit_id: penerbitId || undefined,
      genre: genre.trim() || undefined,
      total_pages: totalPages || undefined,
      synopsis: synopsis.trim() || undefined,
      status,
      package_type: packageType,
      order_type: orderType,
      copies,
      book_size: bookSize,
      legal_type: legalType,
    });
  };

  const penulisOptions = [
    { value: '', label: '-- Pilih Penulis --' },
    ...penulis.map((p) => ({ value: String(p.id), label: p.name }))
  ];

  const penerbitOptions = [
    { value: '', label: '-- Pilih Penerbit --' },
    ...penerbit.map((pub) => ({ value: String(pub.id), label: pub.name }))
  ];

  const genreOptions = [
    { value: '', label: '-- Pilih Genre --' },
    { value: 'Novel', label: 'Novel' },
    { value: 'Cerpen', label: 'Cerpen' },
    { value: 'Puisi', label: 'Puisi' },
    { value: 'Non-Fiksi', label: 'Non-Fiksi' },
    { value: 'Biografi', label: 'Biografi' },
    { value: 'Antologi', label: 'Antologi' },
    { value: 'Akademis', label: 'Akademis' },
    { value: 'Panduan/Teknis', label: 'Panduan/Teknis' },
    { value: 'Anak-anak', label: 'Anak-anak' },
    { value: 'Religi', label: 'Religi' },
    { value: 'Komik/Manga', label: 'Komik/Manga' },
    { value: 'Lainnya', label: 'Lainnya' },
  ];

  const packageOptions = [
    { value: 'Standar', label: 'Standar' },
    { value: 'Populer', label: 'Populer' },
    { value: 'Eksklusif', label: 'Eksklusif' },
    { value: 'Kustom', label: 'Kustom' }
  ];

  const orderTypeOptions = [
    { value: 'Baru', label: 'Baru' },
    { value: 'Cetak Ulang', label: 'Cetak Ulang' },
    { value: 'Revisi', label: 'Revisi' }
  ];

  const legalOptions = [
    { value: 'ISBN', label: 'ISBN' },
    { value: 'QRCBN', label: 'QRCBN' },
    { value: 'Tanpa ISBN', label: 'Tanpa ISBN' }
  ];

  const statusOptions = [
    { value: 'Belum Dimulai', label: 'Belum Dimulai' },
    { value: 'Sedang Dikerjakan', label: 'Sedang Dikerjakan' },
    { value: 'Selesai', label: 'Selesai' },
    { value: 'Batal', label: 'Batal' }
  ];

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical'
  };

  return (
    <div className="customer-form" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
        {initialData ? '📝 Edit Data Naskah' : '📚 Tambah Naskah Baru'}
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Accordion>
          {/* Accordion 1: Identitas Naskah */}
          <AccordionSection index={1} title="📖 Identitas Naskah" expandedSection={expandedSection} onToggle={setExpandedSection}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                <TextField
                  label="Kode ID Naskah"
                  placeholder="Contoh: NSK-010"
                  value={naskahIdCode}
                  onChange={(e) => setNaskahIdCode(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Judul Naskah / Buku"
                  placeholder="Masukkan judul lengkap..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  fullWidth
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Select
                  label="Penulis (Relasi CRM)"
                  options={penulisOptions}
                  value={penulisId || ''}
                  onChange={(e) => setPenulisId(e.target.value ? Number(e.target.value) : undefined)}
                  fullWidth
                />
                <Select
                  label="Penerbit Mitra (Relasi CRM)"
                  options={penerbitOptions}
                  value={penerbitId || ''}
                  onChange={(e) => setPenerbitId(e.target.value ? Number(e.target.value) : undefined)}
                  fullWidth
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Select
                  label="Genre / Kategori"
                  options={genreOptions}
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Jumlah Halaman"
                  type="number"
                  placeholder="Contoh: 240"
                  value={totalPages ?? ''}
                  onChange={(e) => setTotalPages(e.target.value ? Number(e.target.value) : undefined)}
                  min={0}
                  fullWidth
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                  Sinopsis / Deskripsi Naskah
                </label>
                <textarea
                  style={{ ...textareaStyle, height: '90px' }}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="Ringkasan singkat isi naskah..."
                />
              </div>

              <Select
                label="Status Naskah"
                options={statusOptions}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                fullWidth
              />
            </div>
          </AccordionSection>

          {/* Accordion 2: Detail Penerbitan */}
          <AccordionSection index={2} title="📦 Detail Penerbitan" expandedSection={expandedSection} onToggle={setExpandedSection}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Select
                  label="Paket Penerbitan"
                  options={packageOptions}
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value)}
                  fullWidth
                />
                <Select
                  label="Tipe Order"
                  options={orderTypeOptions}
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  fullWidth
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <TextField
                  label="Jumlah Cetak (Copies)"
                  type="number"
                  value={copies}
                  onChange={(e) => setCopies(Number(e.target.value))}
                  min={0}
                  fullWidth
                />
                <TextField
                  label="Ukuran Buku"
                  placeholder="Contoh: 14x20 cm atau A5"
                  value={bookSize}
                  onChange={(e) => setBookSize(e.target.value)}
                  fullWidth
                />
              </div>

              <Select
                label="Legalitas / Perizinan"
                options={legalOptions}
                value={legalType}
                onChange={(e) => setLegalType(e.target.value)}
                fullWidth
              />
            </div>
          </AccordionSection>
        </Accordion>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button type="submit" variant="primary" style={{ flex: 1 }} size="lg">
            💾 Simpan &amp; Catat
          </Button>
          <Button type="button" variant="secondary" style={{ flex: 1 }} size="lg" onClick={onCancel}>
            ❌ Batal
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NaskahOrderForm;
