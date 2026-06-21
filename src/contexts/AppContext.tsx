import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { AppState } from '../types/app.types';
import { Book } from '../types/book.types';
import { Contact } from '../types/contact.types';
import { Invoice } from '../types/invoice.types';
import { File } from '../types/file.types';
import { Service } from '../types/service.types';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export interface GDriveAccount {
  email: string;
  name: string;
  token: string;
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}

export interface WatchFolder {
  id?: number;
  path: string;
  created_at: string;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'primary' | 'danger' | 'warning';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface ImportExportActions {
  onImport?: () => void | Promise<void>;
  onExport?: () => void | Promise<void>;
  onDownloadTemplate?: () => void | Promise<void>;
  label?: string;
}


interface AppContextType {
  appState: AppState;
  setActiveModule: (module: AppState['activeModule']) => void;
  books: Book[];
  contacts: Contact[];
  invoices: Invoice[];
  files: File[];
  services: Service[];
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  selectedFileId: number | null;
  setSelectedFileId: (id: number | null) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  fileCategory: 'all' | 'invoice' | 'service' | 'other' | 'gdrive' | 'pdf' | 'spreadsheet' | 'text' | 'image' | 'presentation';
  setFileCategory: (category: 'all' | 'invoice' | 'service' | 'other' | 'gdrive' | 'pdf' | 'spreadsheet' | 'text' | 'image' | 'presentation') => void;
  loadBooks: () => Promise<void>;
  loadContacts: () => Promise<void>;
  loadInvoices: () => Promise<void>;
  loadFiles: () => Promise<void>;
  loadServices: () => Promise<void>;
  addBook: (book: Book) => Promise<number>;
  deleteBook: (id: number) => Promise<void>;
  updateBook: (book: Book) => Promise<void>;
  addContact: (contact: Contact) => Promise<number>;
  updateContact: (contact: Contact) => Promise<void>;
  deleteContact: (id: number) => Promise<void>;
  addInvoice: (invoice: Invoice) => Promise<number>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (id: number) => Promise<void>;
  addFile: (file: File) => Promise<number>;
  deleteFile: (id: number) => Promise<void>;
  updateFile: (file: File) => Promise<void>;
  addService: (service: Service) => Promise<number>;
  updateService: (service: Service) => Promise<void>;
  deleteService: (id: number) => Promise<void>;
  rightPanelVisible: boolean;
  setRightPanelVisible: (visible: boolean) => void;
  selectedBookId: number | null;
  setSelectedBookId: (id: number | null) => void;
  selectedServiceId: number | null;
  setSelectedServiceId: (id: number | null) => void;
  activeSettingsTab: 'invoice' | 'local-folders' | 'google-drive' | 'google-apps-script' | 'data-reset';
  setActiveSettingsTab: (tab: 'invoice' | 'local-folders' | 'google-drive' | 'google-apps-script' | 'data-reset') => void;
  confirmOptions: ConfirmOptions | null;
  showConfirm: (options: ConfirmOptions) => void;
  hideConfirm: () => void;
  currentFolderId: string;
  setCurrentFolderId: (id: string) => void;
  folderHistory: string[];
  folderHistoryIndex: number;
  fileLayoutMode: 'list' | 'grid';
  setFileLayoutMode: (mode: 'list' | 'grid') => void;
  navigateFolder: (folderId: string) => void;
  navigateBack: () => void;
  navigateForward: () => void;
  canNavigateBack: boolean;
  canNavigateForward: boolean;
  connectedUser: { name: string, email: string } | null;
  setConnectedUser: (user: { name: string, email: string } | null) => void;
  testConnection: (token: string) => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  gdriveAccounts: GDriveAccount[];
  setGdriveAccounts: (accounts: GDriveAccount[]) => void;
  refreshAccountToken: (email: string) => Promise<string | null>;
  watchFolders: WatchFolder[];
  loadWatchFolders: () => Promise<void>;
  addWatchFolder: (path: string) => Promise<string>;
  removeWatchFolder: (id: number) => Promise<void>;
  addFileTag: (fileId: number, tag: string) => Promise<void>;
  removeFileTag: (fileId: number, tag: string) => Promise<void>;
  getFileTags: (fileId: number) => Promise<string[]>;
  getAllTags: () => Promise<string[]>;
  getAllFileTags: () => Promise<Record<number, string[]>>;
  selectedInsightMetric: 'total' | 'lunas' | 'belum_lunas' | 'bermasalah' | 'dp' | null;
  setSelectedInsightMetric: (metric: 'total' | 'lunas' | 'belum_lunas' | 'bermasalah' | 'dp' | null) => void;
  editingCustomer: Contact | null;
  setEditingCustomer: (customer: Contact | null) => void;
  selectedCustomerId: number | null;
  setSelectedCustomerId: (id: number | null) => void;
  selectedPenulisId: number | null;
  setSelectedPenulisId: (id: number | null) => void;
  selectedPenerbitId: number | null;
  setSelectedPenerbitId: (id: number | null) => void;
  selectedNaskahId: number | null;
  setSelectedNaskahId: (id: number | null) => void;
  selectedTimId: number | null;
  setSelectedTimId: (id: number | null) => void;
  selectedLegalitasId: number | null;
  setSelectedLegalitasId: (id: number | null) => void;
  selectedTaskId: number | null;
  setSelectedTaskId: (id: number | null) => void;
  importExportActions: Record<string, ImportExportActions>;
  registerImportExportActions: (module: string, actions: ImportExportActions | null) => void;
  updateSyncStatus: (tableName: string, id: number, syncStatus: string, cloudFileUrl?: string) => Promise<void>;
  syncAllDataToCloud: (dataMaster: {
    penulis: any[];
    penerbit: any[];
    naskah: any[];
    tim: any[];
    legalitas: any[];
    services: any[];
    tasks: any[];
  }) => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>({
    activeModule: 'home'
  });

  const [books, setBooks] = useState<Book[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [fileCategory, setFileCategory] = useState<'all' | 'invoice' | 'service' | 'other' | 'gdrive' | 'pdf' | 'spreadsheet' | 'text' | 'image' | 'presentation'>('all');
  const [rightPanelVisible, setRightPanelVisible] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'invoice' | 'local-folders' | 'google-drive' | 'google-apps-script' | 'data-reset'>('invoice');
  const [selectedInsightMetric, setSelectedInsightMetric] = useState<'total' | 'lunas' | 'belum_lunas' | 'bermasalah' | 'dp' | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Contact | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedPenulisId, setSelectedPenulisId] = useState<number | null>(null);
  const [selectedPenerbitId, setSelectedPenerbitId] = useState<number | null>(null);
  const [selectedNaskahId, setSelectedNaskahId] = useState<number | null>(null);
  const [selectedTimId, setSelectedTimId] = useState<number | null>(null);
  const [selectedLegalitasId, setSelectedLegalitasId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [importExportActions, setImportExportActions] = useState<Record<string, ImportExportActions>>({});

  const registerImportExportActions = (module: string, actions: ImportExportActions | null) => {
    setImportExportActions(prev => {
      if (!actions) {
        const next = { ...prev };
        delete next[module];
        return next;
      }
      return { ...prev, [module]: actions };
    });
  };

  const rootFolderId = localStorage.getItem('gdrive_parent_folder_id') || 'root';
  const [currentFolderId, setCurrentFolderId] = useState<string>(rootFolderId);
  const [folderHistory, setFolderHistory] = useState<string[]>([rootFolderId]);
  const [folderHistoryIndex, setFolderHistoryIndex] = useState<number>(0);
  const [fileLayoutMode, setFileLayoutMode] = useState<'list' | 'grid'>('list');
  const [connectedUser, setConnectedUser] = useState<{ name: string, email: string } | null>(null);
  const [watchFolders, setWatchFolders] = useState<WatchFolder[]>([]);
  const [gdriveAccounts, setGdriveAccountsState] = useState<GDriveAccount[]>(() => {
    try {
      const saved = localStorage.getItem('gdrive_accounts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const gdriveAccountsRef = useRef<GDriveAccount[]>(gdriveAccounts);
  useEffect(() => {
    gdriveAccountsRef.current = gdriveAccounts;
  }, [gdriveAccounts]);

  const setGdriveAccounts = (accounts: GDriveAccount[]) => {
    setGdriveAccountsState(accounts);
    localStorage.setItem('gdrive_accounts', JSON.stringify(accounts));
  };

  const exchangeCodeForToken = async (code: string) => {
    const clientId = localStorage.getItem('gdrive_client_id') || '935478440552-k48b61cglp06gskchsc7qg6l2i1pkhn1.apps.googleusercontent.com';
    const clientSecret = localStorage.getItem('gdrive_client_secret') || '';
    const port = 50007;

    showToast('Menukar kode otorisasi...', 'info');
    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          redirect_uri: `http://localhost:${port}`,
          grant_type: 'authorization_code'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const accessToken = data.access_token;
        const refreshToken = data.refresh_token || '';

        const profileRes = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const email = profileData.user.emailAddress;
          const name = profileData.user.displayName;

          const currentAccounts = gdriveAccountsRef.current;
          const existingAccIdx = currentAccounts.findIndex(acc => acc.email === email);
          let updatedAccounts = [...currentAccounts];

          if (existingAccIdx > -1) {
            const existingAcc = currentAccounts[existingAccIdx];
            updatedAccounts[existingAccIdx] = {
              ...existingAcc,
              name,
              token: accessToken,
              refreshToken: refreshToken || existingAcc.refreshToken,
              clientId,
              clientSecret
            };
          } else {
            updatedAccounts.push({
              email,
              name,
              token: accessToken,
              refreshToken: refreshToken,
              clientId,
              clientSecret
            });
          }

          setGdriveAccounts(updatedAccounts);

          // Set akun default
          localStorage.setItem('gdrive_token', accessToken);
          if (refreshToken) {
            localStorage.setItem('gdrive_refresh_token', refreshToken);
          }
          localStorage.setItem('gdrive_client_id', clientId);
          localStorage.setItem('gdrive_client_secret', clientSecret);

          setConnectedUser({ name, email });
          showToast(`Akun ${email} berhasil dihubungkan!`, 'success');
        } else {
          showToast('Gagal mendapatkan profil pengguna Google', 'error');
        }
      } else {
        const errData = await res.json();
        console.error('Exchange token error:', errData);
        showToast(`Gagal menukar kode otorisasi: ${errData.error_description || errData.error}`, 'error');
      }
    } catch (err: any) {
      console.error('Exchange token error:', err);
      showToast(`Error penukaran token: ${err.message || err}`, 'error');
    }
  };

  const testConnection = async (currentToken: string) => {
    if (!currentToken) {
      setConnectedUser(null);
      return;
    }
    try {
      const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setConnectedUser({
          name: data.user.displayName,
          email: data.user.emailAddress
        });
      } else {
        setConnectedUser(null);
      }
    } catch (err) {
      console.error('Gagal menghubungkan Google API:', err);
      setConnectedUser(null);
    }
  };

  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const refreshAccountToken = async (email: string): Promise<string | null> => {
    const currentAccounts = gdriveAccountsRef.current;
    const account = currentAccounts.find(acc => acc.email === email);
    if (!account) return null;

    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: account.clientId,
          client_secret: account.clientSecret,
          refresh_token: account.refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const newAccessToken = data.access_token;
        
        const updatedAccounts = currentAccounts.map(acc => {
          if (acc.email === email) {
            return { ...acc, token: newAccessToken };
          }
          return acc;
        });
        setGdriveAccounts(updatedAccounts);

        const defaultToken = localStorage.getItem('gdrive_token');
        const defaultEmail = connectedUser?.email;
        if (defaultEmail === email || !defaultToken) {
          localStorage.setItem('gdrive_token', newAccessToken);
          setConnectedUser({ name: account.name, email: account.email });
        }
        
        return newAccessToken;
      }
    } catch (e) {
      console.error(`Gagal refresh token untuk ${email}:`, e);
    }
    return null;
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const defaultEmail = connectedUser?.email;
    const currentAccounts = gdriveAccountsRef.current;
    if (defaultEmail && currentAccounts.some(acc => acc.email === defaultEmail)) {
      refreshPromiseRef.current = refreshAccountToken(defaultEmail);
      const res = await refreshPromiseRef.current;
      refreshPromiseRef.current = null;
      return res;
    }

    const refreshToken = localStorage.getItem('gdrive_refresh_token');
    const clientId = localStorage.getItem('gdrive_client_id');
    const clientSecret = localStorage.getItem('gdrive_client_secret');

    if (!refreshToken || !clientId || !clientSecret) {
      return null;
    }

    const runRefresh = async (): Promise<string | null> => {
      try {
        const res = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
          })
        });

        if (res.ok) {
          const data = await res.json();
          const newAccessToken = data.access_token;
          localStorage.setItem('gdrive_token', newAccessToken);
          
          await testConnection(newAccessToken);
          return newAccessToken;
        } else {
          console.error('Respon Google OAuth refresh gagal:', res.status);
          return null;
        }
      } catch (err) {
        console.error('Gagal melakukan refresh token:', err);
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    };

    refreshPromiseRef.current = runRefresh();
    return refreshPromiseRef.current;
  };

  useEffect(() => {
    const initConnection = async () => {
      const token = localStorage.getItem('gdrive_token');
      if (token) {
        try {
          const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setConnectedUser({
              name: data.user.displayName,
              email: data.user.emailAddress
            });
          } else if (res.status === 401) {
            await refreshAccessToken();
          }
        } catch {
          await refreshAccessToken();
        }
      }
    };
    initConnection();
  }, []);

  useEffect(() => {
    const rootId = localStorage.getItem('gdrive_parent_folder_id') || 'root';
    setCurrentFolderId(rootId);
    setFolderHistory([rootId]);
    setFolderHistoryIndex(0);
  }, [fileCategory]);

  const navigateFolder = (folderId: string) => {
    const newHistory = folderHistory.slice(0, folderHistoryIndex + 1);
    newHistory.push(folderId);
    setFolderHistory(newHistory);
    setFolderHistoryIndex(newHistory.length - 1);
    setCurrentFolderId(folderId);
  };

  const navigateBack = () => {
    if (folderHistoryIndex > 0) {
      const newIndex = folderHistoryIndex - 1;
      setFolderHistoryIndex(newIndex);
      setCurrentFolderId(folderHistory[newIndex]);
    }
  };

  const navigateForward = () => {
    if (folderHistoryIndex < folderHistory.length - 1) {
      const newIndex = folderHistoryIndex + 1;
      setFolderHistoryIndex(newIndex);
      setCurrentFolderId(folderHistory[newIndex]);
    }
  };

  const canNavigateBack = folderHistoryIndex > 0;
  const canNavigateForward = folderHistoryIndex < folderHistory.length - 1;

  const showConfirm = (options: ConfirmOptions) => {
    setConfirmOptions(options);
  };

  const hideConfirm = () => {
    setConfirmOptions(null);
  };

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let unlistenLocal: (() => void) | undefined;
    const init = async () => {
      try {
        await invoke('init_database');
        await loadBooks();
        await loadContacts();
        await loadInvoices();
        await loadFiles();
        await loadServices();
        await loadWatchFolders();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    init();

    const setupListener = async () => {
      try {
        unlisten = await listen<string>('gdrive-oauth-code', async (event) => {
          const code = event.payload;
          if (code) {
            await exchangeCodeForToken(code);
          }
        });
        unlistenLocal = await listen<void>('local-files-changed', async () => {
          await loadFiles();
        });
      } catch (err) {
        console.error('Gagal memasang event listener oauth:', err);
      }
    };
    setupListener();

    return () => {
      if (unlisten) unlisten();
      if (unlistenLocal) unlistenLocal();
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const setActiveModule = (module: AppState['activeModule']) => {
    setAppState(prev => ({ ...prev, activeModule: module }));
    setSelectedFileId(null);
    setSelectedBookId(null);
    setSelectedServiceId(null);
    setSelectedCustomerId(null);
    setSelectedPenulisId(null);
    setSelectedPenerbitId(null);
    setSelectedTaskId(null);
    setRightPanelVisible(false);
  };


  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const loadBooks = async () => {
    try {
      const data = await invoke<Book[]>('get_books');
      setBooks(data);
    } catch (error) {
      console.error('Failed to load books:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const data = await invoke<Contact[]>('get_contacts');
      setContacts(data);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const loadInvoices = async () => {
    try {
      const data = await invoke<Invoice[]>('get_invoices');
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    }
  };

  const loadFiles = async () => {
    try {
      const data = await invoke<File[]>('get_files');
      setFiles(data);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const addBook = async (book: Book) => {
    try {
      const id = await invoke<number>('add_book', { book });
      await loadBooks();
      return id;
    } catch (error) {
      console.error('Failed to add book:', error);
      showToast('Gagal menambahkan buku', 'error');
      return 0;
    }
  };

  const deleteBook = async (id: number) => {
    try {
      await invoke('delete_book', { id });
      await loadBooks();
    } catch (error) {
      console.error('Failed to delete book:', error);
      showToast('Gagal menghapus buku', 'error');
    }
  };

  const updateBook = async (book: Book) => {
    try {
      await invoke('update_book', { book });
      await loadBooks();
    } catch (error) {
      console.error('Failed to update book:', error);
      showToast('Gagal memperbarui buku', 'error');
    }
  };

  const addContact = async (contact: Contact) => {
    try {
      const id = await invoke<number>('add_contact', { contact });
      await loadContacts();
      return id;
    } catch (error) {
      console.error('Failed to add contact:', error);
      showToast('Gagal menambahkan kontak', 'error');
      return 0;
    }
  };

  const updateContact = async (contact: Contact) => {
    try {
      await invoke('update_contact', { contact });
      await loadContacts();
    } catch (error) {
      console.error('Failed to update contact:', error);
      showToast('Gagal memperbarui kontak', 'error');
    }
  };

  const deleteContact = async (id: number) => {
    try {
      await invoke('delete_contact', { id });
      await loadContacts();
    } catch (error) {
      console.error('Failed to delete contact:', error);
      showToast('Gagal menghapus kontak', 'error');
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

  const addFile = async (file: File) => {
    try {
      const id = await invoke<number>('add_file', { file });
      await loadFiles();
      return id;
    } catch (error) {
      console.error('Failed to add file:', error);
      showToast('Gagal menambahkan file', 'error');
      return 0;
    }
  };

  const deleteFile = async (id: number) => {
    try {
      await invoke('delete_file', { id });
      await loadFiles();
      if (selectedFileId === id) {
        setSelectedFileId(null);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      showToast('Gagal menghapus file', 'error');
    }
  };

  const updateFile = async (file: File) => {
    try {
      await invoke('update_file', { file });
      await loadFiles();
    } catch (error) {
      console.error('Failed to update file:', error);
      showToast('Gagal memperbarui file', 'error');
    }
  };

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
      showToast('Gagal menambahkan layanan', 'error');
      return 0;
    }
  };

  const updateService = async (service: Service) => {
    try {
      await invoke('update_service', { service });
      await loadServices();
    } catch (error) {
      console.error('Failed to update service:', error);
      showToast('Gagal memperbarui layanan', 'error');
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
      showToast('Gagal menghapus layanan', 'error');
    }
  };

  const loadWatchFolders = async () => {
    try {
      const data = await invoke<WatchFolder[]>('get_watch_folders');
      setWatchFolders(data);
    } catch (error) {
      console.error('Failed to load watch folders:', error);
    }
  };

  const addWatchFolder = async (path: string) => {
    try {
      const result = await invoke<string>('add_watch_folder', { path });
      await loadWatchFolders();
      await loadFiles();
      return result;
    } catch (error) {
      console.error('Failed to add watch folder:', error);
      showToast('Gagal menambahkan folder pantauan', 'error');
      return '';
    }
  };

  const removeWatchFolder = async (id: number) => {
    try {
      await invoke('remove_watch_folder', { id });
      await loadWatchFolders();
      await loadFiles();
    } catch (error) {
      console.error('Failed to remove watch folder:', error);
      showToast('Gagal menghapus folder pantauan', 'error');
    }
  };

  const addFileTag = async (fileId: number, tag: string) => {
    try {
      await invoke('add_file_tag', { fileId, tag });
    } catch (error) {
      console.error('Failed to add file tag:', error);
    }
  };

  const removeFileTag = async (fileId: number, tag: string) => {
    try {
      await invoke('remove_file_tag', { fileId, tag });
    } catch (error) {
      console.error('Failed to remove file tag:', error);
    }
  };

  const getFileTags = async (fileId: number): Promise<string[]> => {
    try {
      return await invoke<string[]>('get_file_tags', { fileId });
    } catch (error) {
      console.error('Failed to get file tags:', error);
      return [];
    }
  };

  const getAllTags = async (): Promise<string[]> => {
    try {
      return await invoke<string[]>('get_all_tags');
    } catch (error) {
      console.error('Failed to get all tags:', error);
      return [];
    }
  };
  const getAllFileTags = async (): Promise<Record<number, string[]>> => {
    try {
      return await invoke<Record<number, string[]>>('get_all_file_tags');
    } catch (error) {
      console.error('Failed to get all file tags:', error);
      return {};
    }
  };

  const updateSyncStatus = async (tableName: string, id: number, syncStatus: string, cloudFileUrl?: string) => {
    try {
      await invoke('update_sync_status', {
        tableName,
        id,
        syncStatus,
        cloudFileUrl: cloudFileUrl || null
      });
      if (tableName === 'contacts') await loadContacts();
      else if (tableName === 'books') await loadBooks();
      else if (tableName === 'services') await loadServices();
      else if (tableName === 'files') await loadFiles();
      else if (tableName === 'invoices') await loadInvoices();
    } catch (error) {
      console.error(`Failed to update sync status for ${tableName} id ${id}:`, error);
    }
  };

  const syncAllDataToCloud = async (dataMaster: {
    penulis: any[];
    penerbit: any[];
    naskah: any[];
    tim: any[];
    legalitas: any[];
    services: any[];
    tasks: any[];
  }) => {
    const { googleAppsScriptService } = await import('../services/googleAppsScript');
    if (!googleAppsScriptService.isConfigured()) {
      return { success: false, message: 'Google Apps Script belum dikonfigurasi di Pengaturan!' };
    }

    try {
      // 1. Contacts
      if (contacts.length > 0) {
        const payload = contacts.map(c => ({
          id: c.id,
          name: c.name,
          wa_number: c.wa_number || '',
          email: c.email || '',
          address: c.address || '',
          province: c.province || '',
          city: c.city || '',
          job: c.job || '',
          institution: c.institution || '',
          data_source: c.data_source || '',
          email_valid: c.email_valid,
          wa_valid: c.wa_valid,
          followup_status: c.followup_status || '',
          notes: c.notes || '',
          type: c.type,
          created_at: c.created_at,
          updated_at: c.updated_at || c.created_at
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Contacts', payload);
        for (const c of contacts) {
          if (c.id) {
            await invoke('update_sync_status', { tableName: 'contacts', id: c.id, syncStatus: 'synced', cloudFileUrl: null });
          }
        }
        await loadContacts();
      }

      // 2. Books
      if (books.length > 0) {
        const payload = books.map(b => ({
          id: b.id,
          title: b.title,
          isbn: b.isbn || '',
          regular_price: b.regular_price,
          po_price: b.po_price,
          weight_grams: b.weight_grams,
          author_id: b.author_id || '',
          cover_path: b.cover_path || '',
          created_at: b.created_at || new Date().toISOString(),
          updated_at: b.updated_at || b.created_at || new Date().toISOString()
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Books', payload);
        for (const b of books) {
          if (b.id) {
            await invoke('update_sync_status', { tableName: 'books', id: b.id, syncStatus: 'synced', cloudFileUrl: b.cover_path || null });
          }
        }
        await loadBooks();
      }

      // 3. Services
      if (services.length > 0) {
        const payload = services.map(s => ({
          id: s.id,
          name: s.name,
          price: s.price,
          description: s.description || '',
          category: s.category,
          created_at: s.created_at || new Date().toISOString(),
          updated_at: s.updated_at || s.created_at || new Date().toISOString()
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Services', payload);
        for (const s of services) {
          if (s.id) {
            await invoke('update_sync_status', { tableName: 'services', id: s.id, syncStatus: 'synced', cloudFileUrl: null });
          }
        }
        await loadServices();
      }

      // 4. Files
      const cloudFiles = files.filter(f => f.path.startsWith('gdrive://') || f.path.startsWith('http://') || f.path.startsWith('https://'));
      if (cloudFiles.length > 0) {
        const payload = cloudFiles.map(f => ({
          id: f.id,
          path: f.path,
          filename: f.filename,
          type: f.type,
          project_id: f.project_id || '',
          status: f.status,
          version_label: f.version_label || '',
          last_modified: f.last_modified,
          modified_by: f.modified_by || '',
          is_readonly: f.is_readonly ? 1 : 0,
          description: f.description || '',
          responsible_parties: f.responsible_parties || '',
          created_at: f.created_at || f.last_modified,
          updated_at: f.updated_at || f.last_modified
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Files', payload);
        for (const f of cloudFiles) {
          if (f.id) {
            await invoke('update_sync_status', { tableName: 'files', id: f.id, syncStatus: 'synced', cloudFileUrl: null });
          }
        }
        await loadFiles();
      }

      // 5. Invoices
      if (invoices.length > 0) {
        const payload = invoices.map(inv => ({
          id: inv.id,
          created_at: inv.created_at,
          customer_id: inv.customer_id || '',
          items_json: inv.items_json,
          shipping_cost: inv.shipping_cost,
          admin_fee: inv.admin_fee,
          total: inv.total,
          export_format: inv.export_format || '',
          file_path: inv.file_path || '',
          sync_status: 'synced',
          cloud_file_url: inv.cloud_file_url || ''
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Invoices', payload);
        for (const inv of invoices) {
          if (inv.id) {
            await invoke('update_sync_status', { tableName: 'invoices', id: inv.id, syncStatus: 'synced', cloudFileUrl: inv.cloud_file_url || null });
          }
        }
        await loadInvoices();
      }

      // 6. Penerbit
      if (dataMaster.penerbit.length > 0) {
        const payload = dataMaster.penerbit.map(p => ({
          id: p.id,
          name: p.name,
          city: p.city || '',
          instagram: p.instagram || '',
          facebook: p.facebook || '',
          email: p.email || '',
          wa_number: p.wa_number || '',
          linkedin: p.linkedin || '',
          twitter: p.twitter || '',
          tiktok: p.tiktok || '',
          wa_valid: p.wa_valid,
          email_valid: p.email_valid,
          cooperation_status: p.cooperation_status || 'Aktif',
          address: p.address || '',
          notes: p.notes || '',
          province: p.province || '',
          created_at: p.created_at,
          updated_at: p.updated_at || p.created_at
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Penerbit', payload);
        for (const p of dataMaster.penerbit) {
          if (p.id) {
            await invoke('update_sync_status', { tableName: 'penerbit', id: p.id, syncStatus: 'synced', cloudFileUrl: null });
          }
        }
      }

      // 7. Naskah
      if (dataMaster.naskah.length > 0) {
        const payload = dataMaster.naskah.map(n => ({
          id: n.id,
          naskah_id_code: n.naskah_id_code || '',
          title: n.title,
          penulis_id: n.penulis_id || '',
          penerbit_id: n.penerbit_id || '',
          package_type: n.package_type || '',
          order_type: n.order_type || '',
          copies: n.copies || 0,
          book_size: n.book_size || '',
          initial_request: n.initial_request || '',
          revised_request: n.revised_request || '',
          legal_type: n.legal_type || '',
          shipping_address: n.shipping_address || '',
          store_links: n.store_links || '',
          status: n.status,
          genre: n.genre || '',
          total_pages: n.total_pages || 0,
          synopsis: n.synopsis || '',
          assigned_team_ids: n.assigned_team_ids || '',
          created_at: n.created_at,
          updated_at: n.updated_at || n.created_at
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Naskah', payload);
        for (const n of dataMaster.naskah) {
          if (n.id) {
            await invoke('update_sync_status', { tableName: 'naskah', id: n.id, syncStatus: 'synced', cloudFileUrl: null });
          }
        }
      }

      // 8. Tim
      if (dataMaster.tim.length > 0) {
        const payload = dataMaster.tim.map(t => ({
          id: t.id,
          name: t.name,
          role: t.role,
          is_active: t.is_active,
          weekly_target: t.weekly_target || 0,
          notes: t.notes || '',
          department: t.department || '',
          created_at: t.created_at,
          updated_at: t.updated_at || t.created_at
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Tim', payload);
        for (const t of dataMaster.tim) {
          if (t.id) {
            await invoke('update_sync_status', { tableName: 'tim', id: t.id, syncStatus: 'synced', cloudFileUrl: null });
          }
        }
      }

      // 9. Legalitas
      if (dataMaster.legalitas.length > 0) {
        const payload = dataMaster.legalitas.map(l => ({
          id: l.id,
          naskah_id: l.naskah_id || '',
          judul_buku: l.judul_buku,
          nama_penulis: l.nama_penulis,
          tipe: l.tipe,
          tanggal_pengajuan: l.tanggal_pengajuan || '',
          keterangan: l.keterangan || '',
          status: l.status,
          nomor_dokumen: l.nomor_dokumen || '',
          tanggal_keluar: l.tanggal_keluar || '',
          tanggal_revisi: l.tanggal_revisi || '',
          pic_id: l.pic_id || '',
          rejection_reason: l.rejection_reason || '',
          proof_path_or_link: l.proof_path_or_link || '',
          created_at: l.created_at,
          updated_at: l.updated_at || l.created_at
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Legalitas', payload);
        for (const l of dataMaster.legalitas) {
          if (l.id) {
            await invoke('update_sync_status', { tableName: 'legalitas', id: l.id, syncStatus: 'synced', cloudFileUrl: l.proof_path_or_link || null });
          }
        }
      }

      // 10. Tasks
      if (dataMaster.tasks.length > 0) {
        const payload = dataMaster.tasks.map(t => ({
          id: t.id,
          naskah_id: t.naskah_id,
          step_name: t.step_name,
          step_order: t.step_order || 0,
          assigned_team_id: t.assigned_team_id || '',
          status: t.status,
          priority: t.priority || 'Normal',
          start_date: t.start_date || '',
          due_date: t.due_date || '',
          completed_date: t.completed_date || '',
          notes: t.notes || '',
          proof_path_or_link: t.proof_path_or_link || '',
          created_at: t.created_at,
          updated_at: t.updated_at || t.created_at
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Tasks', payload);
        for (const t of dataMaster.tasks) {
          if (t.id) {
            await invoke('update_sync_status', { tableName: 'tasks', id: t.id, syncStatus: 'synced', cloudFileUrl: t.proof_path_or_link || null });
          }
        }
      }

      return { success: true, message: 'Seluruh data master dan operasional berhasil disinkronkan ke Cloud Google Sheets!' };
    } catch (err: any) {
      console.error('Error during bulk sync:', err);
      return { success: false, message: `Gagal sinkronisasi cloud: ${err.message || String(err)}` };
    }
  };

  return (
    <AppContext.Provider value={{
      appState,
      setActiveModule,
      books,
      contacts,
      invoices,
      files,
      services,
      toast,
      selectedFileId,
      setSelectedFileId,
      showToast,
      fileCategory,
      setFileCategory,
      loadBooks,
      loadContacts,
      loadInvoices,
      loadFiles,
      loadServices,
      addBook,
      deleteBook,
      updateBook,
      addContact,
      updateContact,
      deleteContact,
      editingCustomer,
      setEditingCustomer,
      selectedCustomerId,
      setSelectedCustomerId,
      selectedPenulisId,
      setSelectedPenulisId,
      selectedPenerbitId,
      setSelectedPenerbitId,
      selectedNaskahId,
      setSelectedNaskahId,
      selectedTimId,
      setSelectedTimId,
      selectedLegalitasId,
      setSelectedLegalitasId,
      selectedTaskId,
      setSelectedTaskId,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      addFile,
      deleteFile,
      updateFile,
      addService,
      updateService,
      deleteService,
      rightPanelVisible,
      setRightPanelVisible,
      selectedBookId,
      setSelectedBookId,
      selectedServiceId,
      setSelectedServiceId,
      confirmOptions,
      showConfirm,
      hideConfirm,
      currentFolderId,
      setCurrentFolderId,
      folderHistory,
      folderHistoryIndex,
      fileLayoutMode,
      setFileLayoutMode,
      navigateFolder,
      navigateBack,
      navigateForward,
      canNavigateBack,
      canNavigateForward,
      activeSettingsTab,
      setActiveSettingsTab,
      connectedUser,
      setConnectedUser,
      testConnection,
      refreshAccessToken,
      gdriveAccounts,
      setGdriveAccounts,
      refreshAccountToken,
      watchFolders,
      loadWatchFolders,
      addWatchFolder,
      removeWatchFolder,
      addFileTag,
      removeFileTag,
      getFileTags,
      getAllTags,
      getAllFileTags,
      selectedInsightMetric,
      setSelectedInsightMetric,
      importExportActions,
      registerImportExportActions,
      updateSyncStatus,
      syncAllDataToCloud,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
