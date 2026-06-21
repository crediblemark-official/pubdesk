/**
 * Utilitas format — fungsi pemformatan yang berulang di banyak komponen.
 * Sebelumnya diduplikasi di: InvoiceManager, BookManager, ServiceManager,
 * InvoiceInsight, InvoiceGenerator, dll.
 */

/**
 * Format angka ke format mata uang Rupiah (IDR).
 * Contoh: 150000 → "Rp 150.000"
 */
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format string ISO tanggal ke format lokal Indonesia.
 * Contoh: "2024-06-20T12:00:00Z" → "20/6/2024"
 */
export const formatDate = (isoString: string): string => {
  if (!isoString) return '-';
  try {
    return new Date(isoString).toLocaleDateString('id-ID');
  } catch {
    return isoString;
  }
};

/**
 * Format tanggal panjang Indonesia: "20 Jun 2024".
 * Digunakan di modul produksi dan panel preview.
 */
export const formatDateLong = (dateStr?: string): string => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
};

/**
 * Format string ISO ke tanggal + waktu lokal Indonesia.
 * Contoh: "2024-06-20T12:00:00Z" → "20/6/2024, 19.00"
 */
export const formatDateTime = (isoString: string): string => {
  if (!isoString) return '-';
  try {
    return new Date(isoString).toLocaleString('id-ID');
  } catch {
    return isoString;
  }
};

/**
 * Singkat ukuran file dalam bytes ke format mudah dibaca.
 * Contoh: 1500000 → "1,4 MB"
 */
export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Format nomor WhatsApp ke format internasional (62xxxx).
 * Contoh: "08123456789" → "628123456789"
 */
export const formatWhatsAppNumber = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('08')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
};

/**
 * Konversi nomor telepon ke link WhatsApp.
 * Contoh: "081234567890" → "https://wa.me/6281234567890"
 */
export const getWhatsAppLink = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62') && cleaned.length > 0) {
    cleaned = '62' + cleaned;
  }
  return `https://wa.me/${cleaned}`;
};
