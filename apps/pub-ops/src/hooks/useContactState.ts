import { useState } from 'react';
import { Contact } from '../types/contact.types';
import { invoke } from '@tauri-apps/api/core';

interface UseContactStateProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function useContactState({ showToast: _showToast }: UseContactStateProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);

  const loadContacts = async () => {
    try {
      const data = await invoke<Contact[]>('get_contacts');
      setContacts(data);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const addContact = async (contact: Contact) => {
    try {
      const id = await invoke<number>('add_contact', { contact });
      await loadContacts();
      return id;
    } catch (error) {
      console.error('Failed to add contact:', error);
      throw error;
    }
  };

  const updateContact = async (contact: Contact) => {
    try {
      await invoke('update_contact', { contact });
      await loadContacts();
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw error;
    }
  };

  const deleteContact = async (id: number) => {
    try {
      await invoke('delete_contact', { id });
      await loadContacts();
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw error;
    }
  };

  return {
    contacts,
    loadContacts,
    addContact,
    updateContact,
    deleteContact
  };
}
