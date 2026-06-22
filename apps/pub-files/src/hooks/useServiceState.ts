import { useState } from 'react';
import { Service } from '../types/service.types';
import { invoke } from '@tauri-apps/api/core';

interface UseServiceStateProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  selectedServiceId: number | null;
  setSelectedServiceId: (id: number | null) => void;
}

export function useServiceState({ showToast: _showToast, selectedServiceId, setSelectedServiceId }: UseServiceStateProps) {
  const [services, setServices] = useState<Service[]>([]);

  const loadServices = async () => {
    try {
      const data = await invoke<Service[]>('get_services');
      setServices(data);
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const addService = async (service: Service) => {
    try {
      const id = await invoke<number>('add_service', { service });
      await loadServices();
      return id;
    } catch (error) {
      console.error('Failed to add service:', error);
      throw error;
    }
  };

  const updateService = async (service: Service) => {
    try {
      await invoke('update_service', { service });
      await loadServices();
    } catch (error) {
      console.error('Failed to update service:', error);
      throw error;
    }
  };

  const deleteService = async (id: number) => {
    try {
      await invoke('delete_service', { id });
      await loadServices();
      if (selectedServiceId === id) {
        setSelectedServiceId(null);
      }
    } catch (error) {
      console.error('Failed to delete service:', error);
      throw error;
    }
  };

  return {
    services,
    loadServices,
    addService,
    updateService,
    deleteService
  };
}
