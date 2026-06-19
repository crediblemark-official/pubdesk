import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { InvoiceItem, Contact } from '../types';

interface InvoiceContextType {
  customer: Partial<Contact>;
  items: InvoiceItem[];
  shippingCost: number;
  adminFee: number;
  invoiceType: 'kbm_cetak' | 'kbm_creator' | 'spt_mitra';
  invoiceNo: string;
  invoiceHal: string;
  invoiceLampiran: string;
  invoiceDate: string;
  paymentStatus: string;
  spesifikasiFasilitas: string;
  bankAccountInfo: string;
  setCustomer: (customer: Partial<Contact> | ((prev: Partial<Contact>) => Partial<Contact>)) => void;
  addItem: (item: InvoiceItem) => void;
  updateItem: (index: number, item: Partial<InvoiceItem>) => void;
  removeItem: (index: number) => void;
  setShippingCost: (cost: number) => void;
  setAdminFee: (fee: number) => void;
  setInvoiceType: (type: 'kbm_cetak' | 'kbm_creator' | 'spt_mitra') => void;
  setInvoiceNo: (no: string) => void;
  setInvoiceHal: (hal: string) => void;
  setInvoiceLampiran: (lampiran: string) => void;
  setInvoiceDate: (date: string) => void;
  setPaymentStatus: (status: string) => void;
  setSpesifikasiFasilitas: (val: string) => void;
  setBankAccountInfo: (val: string) => void;
  calculateTotal: () => number;
  calculateItemTotal: (item: InvoiceItem) => number;
  resetInvoice: () => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

const getIndonesianDate = () => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const d = new Date();
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export const InvoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customer, setCustomerState] = useState<Partial<Contact>>({
    name: '',
    wa_number: '',
    address: ''
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [adminFee, setAdminFee] = useState(0);
  const [invoiceType, setInvoiceType] = useState<'kbm_cetak' | 'kbm_creator' | 'spt_mitra'>('kbm_cetak');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceHal, setInvoiceHal] = useState('');
  const [invoiceLampiran, setInvoiceLampiran] = useState('-');
  const [invoiceDate, setInvoiceDate] = useState(getIndonesianDate());
  const [paymentStatus, setPaymentStatus] = useState('LUNAS');
  const [spesifikasiFasilitas, setSpesifikasiFasilitas] = useState('Sesuai poster paket yang diambil');
  const [bankAccountInfo, setBankAccountInfo] = useState('');

  const setCustomer = (customerOrUpdater: Partial<Contact> | ((prev: Partial<Contact>) => Partial<Contact>)) => {
    setCustomerState(customerOrUpdater);
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    // For KBM Cetak, item.item_shipping_cost is included in the item total in the original KBM format
    const itemShip = item.item_shipping_cost || 0;
    return (item.price * item.quantity) - item.discount + itemShip;
  };

  const calculateTotalValue = useMemo(() => {
    const itemsTotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    // If shippingCost is set globally (for types other than KBM Cetak), add it
    const globalShip = invoiceType === 'kbm_cetak' ? 0 : shippingCost;
    return itemsTotal + globalShip + adminFee;
  }, [items, shippingCost, adminFee, invoiceType]);

  const calculateTotal = () => calculateTotalValue;

  const addItem = (item: InvoiceItem) => {
    setItems(prev => [...prev, item]);
  };

  const updateItem = (index: number, updates: Partial<InvoiceItem>) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const resetInvoice = () => {
    setCustomer({ name: '', wa_number: '', address: '' });
    setItems([]);
    setShippingCost(0);
    setAdminFee(0);
    setInvoiceType('kbm_cetak');
    setInvoiceNo('');
    setInvoiceHal('');
    setInvoiceLampiran('-');
    setInvoiceDate(getIndonesianDate());
    setPaymentStatus('LUNAS');
    setSpesifikasiFasilitas('Sesuai poster paket yang diambil');
    setBankAccountInfo('');
  };

  return (
    <InvoiceContext.Provider value={{
      customer,
      items,
      shippingCost,
      adminFee,
      invoiceType,
      invoiceNo,
      invoiceHal,
      invoiceLampiran,
      invoiceDate,
      paymentStatus,
      spesifikasiFasilitas,
      bankAccountInfo,
      setCustomer,
      addItem,
      updateItem,
      removeItem,
      setShippingCost,
      setAdminFee,
      setInvoiceType,
      setInvoiceNo,
      setInvoiceHal,
      setInvoiceLampiran,
      setInvoiceDate,
      setPaymentStatus,
      setSpesifikasiFasilitas,
      setBankAccountInfo,
      calculateTotal,
      calculateItemTotal,
      resetInvoice,
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoiceContext = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoiceContext must be used within InvoiceProvider');
  }
  return context;
};
