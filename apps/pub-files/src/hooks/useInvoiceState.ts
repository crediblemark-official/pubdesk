import { useState } from 'react';
import { Invoice } from '../types/invoice.types';
import { invoke } from '@tauri-apps/api/core';

interface UseInvoiceStateProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function useInvoiceState({ showToast }: UseInvoiceStateProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const loadInvoices = async () => {
    try {
      const data = await invoke<Invoice[]>('get_invoices');
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    }
  };

  const addInvoice = async (invoice: Invoice) => {
    try {
      const id = await invoke<number>('add_invoice', { invoice });
      await loadInvoices();
      return id;
    } catch (error) {
      console.error('Failed to add invoice:', error);
      showToast('Gagal menambahkan invoice', 'error');
      return 0;
    }
  };

  const updateInvoice = async (invoice: Invoice) => {
    try {
      await invoke('update_invoice', { invoice });
      await loadInvoices();
    } catch (error) {
      console.error('Failed to update invoice:', error);
      showToast('Gagal memperbarui invoice', 'error');
    }
  };

  const deleteInvoice = async (id: number) => {
    try {
      await invoke('delete_invoice', { id });
      await loadInvoices();
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      showToast('Gagal menghapus invoice', 'error');
    }
  };

  return {
    invoices,
    loadInvoices,
    addInvoice,
    updateInvoice,
    deleteInvoice
  };
}
