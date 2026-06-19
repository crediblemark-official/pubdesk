import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { InvoiceItem, Contact } from '../types';

interface InvoiceContextType {
  customer: Partial<Contact>;
  items: InvoiceItem[];
  shippingCost: number;
  adminFee: number;
  setCustomer: (customer: Partial<Contact> | ((prev: Partial<Contact>) => Partial<Contact>)) => void;
  addItem: (item: InvoiceItem) => void;
  updateItem: (index: number, item: Partial<InvoiceItem>) => void;
  removeItem: (index: number) => void;
  setShippingCost: (cost: number) => void;
  setAdminFee: (fee: number) => void;
  calculateTotal: () => number;
  calculateItemTotal: (item: InvoiceItem) => number;
  resetInvoice: () => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customer, setCustomerState] = useState<Partial<Contact>>({
    name: '',
    wa_number: '',
    address: ''
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [adminFee, setAdminFee] = useState(0);

  const setCustomer = (customerOrUpdater: Partial<Contact> | ((prev: Partial<Contact>) => Partial<Contact>)) => {
    setCustomerState(customerOrUpdater);
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    return (item.price * item.quantity) - item.discount;
  };

  const calculateTotalValue = useMemo(() => {
    const itemsTotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    return itemsTotal + shippingCost + adminFee;
  }, [items, shippingCost, adminFee]);

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
  };

  return (
    <InvoiceContext.Provider value={{
      customer,
      items,
      shippingCost,
      adminFee,
      setCustomer,
      addItem,
      updateItem,
      removeItem,
      setShippingCost,
      setAdminFee,
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
