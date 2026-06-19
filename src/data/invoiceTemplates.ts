/**
 * Registry template invoice bawaan.
 *
 * Setiap template adalah InvoiceProfile lengkap yang dapat dimuat ke form
 * pengaturan lalu disimpan sebagai profil baru dengan ID unik.
 *
 * Untuk menambah template baru:
 * 1. Buat file JSON di src/assets/invoice-templates/
 * 2. Import dan daftarkan di array invoiceTemplates di bawah
 */

import { InvoiceProfile } from '../types';

// Template KBM
import kbmKreatorCetak from '../assets/invoice-templates/kbm_kreator_cetak.json';
import kbmIndonesiaHaki from '../assets/invoice-templates/kbm_indonesia_haki.json';

// Template SPT Mitra Penerbit
import univedPress from '../assets/invoice-templates/unived_press.json';
import undiksha from '../assets/invoice-templates/undiksha_press.json';

// Template generik (pola kolom umum)
import generikDenganOngkir from '../assets/invoice-templates/kbm_cetak.json';
import generikLayananTunggal from '../assets/invoice-templates/kbm_creator.json';
import generikPaket from '../assets/invoice-templates/spt_mitra.json';

export interface InvoiceTemplate {
  /** ID unik template — berbeda dari ID profil yang akan dibuat */
  templateId: string;
  /** Nama template yang ditampilkan ke user */
  label: string;
  /** Deskripsi singkat pola kolom yang dipakai */
  description: string;
  /** Tag kategori untuk mengelompokkan template dalam modal */
  category: string;
  /** Data profil lengkap dari file JSON — tanpa field id agar tidak bentrok */
  profile: Omit<InvoiceProfile, 'id'>;
}

/** Daftar semua template bawaan yang tersedia, diurutkan per kategori */
export const invoiceTemplates: InvoiceTemplate[] = [
  // ─── KBM ───────────────────────────────────────────────────────────────────
  {
    templateId: 'kbm_kreator_cetak',
    label: 'KBM Kreator – Cetak Buku',
    description: 'Kolom: Judul, Hal, Naskah, Qty, Cetak/pcs, Ongkir, Total',
    category: 'KBM',
    profile: kbmKreatorCetak as Omit<InvoiceProfile, 'id'>
  },
  {
    templateId: 'kbm_indonesia_haki',
    label: 'KBM Indonesia – Pengajuan HAKI',
    description: 'Kolom: Judul Karya, Pemegang Hak Cipta, Total Biaya',
    category: 'KBM',
    profile: kbmIndonesiaHaki as Omit<InvoiceProfile, 'id'>
  },

  // ─── SPT Mitra Penerbit ────────────────────────────────────────────────────
  {
    templateId: 'unived_press',
    label: 'Unived Press – Penerbitan (+ Ongkir)',
    description: 'Kolom: Judul, Hal, Naskah, Jml+Paket, Harga Paket, Ongkir, Total',
    category: 'SPT Mitra',
    profile: univedPress as Omit<InvoiceProfile, 'id'>
  },
  {
    templateId: 'undiksha_press',
    label: 'Undiksha Press – Penerbitan (tanpa Ongkir)',
    description: 'Kolom: Judul, Hal, Naskah, Jml+Paket, Harga Paket',
    category: 'SPT Mitra',
    profile: undiksha as Omit<InvoiceProfile, 'id'>
  },

  // ─── Pola Generik ──────────────────────────────────────────────────────────
  {
    templateId: 'generik_dengan_ongkir',
    label: 'Generik – Item dengan Ongkos Kirim',
    description: 'Kolom: Nama Item, Qty, Harga Satuan, Ongkir, Total',
    category: 'Generik',
    profile: generikDenganOngkir as Omit<InvoiceProfile, 'id'>
  },
  {
    templateId: 'generik_layanan_tunggal',
    label: 'Generik – Layanan Tunggal (tanpa Qty)',
    description: 'Kolom: Nama Layanan, Total Biaya',
    category: 'Generik',
    profile: generikLayananTunggal as Omit<InvoiceProfile, 'id'>
  },
  {
    templateId: 'generik_paket',
    label: 'Generik – Pengadaan Paket',
    description: 'Kolom: Nama Item, Nama Paket, Qty, Harga Paket, Total',
    category: 'Generik',
    profile: generikPaket as Omit<InvoiceProfile, 'id'>
  }
];
