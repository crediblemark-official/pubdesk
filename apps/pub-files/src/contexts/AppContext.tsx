import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState } from '../types/app.types';
import { File } from '../types/file.types';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// Import hooks
import { useUIState, ConfirmOptions, ImportExportActions } from '../hooks/useUIState';
import { useFileState } from '../hooks/useFileState';
import { useGDriveState, GDriveAccount } from '../hooks/useGDriveState';

export type { ConfirmOptions, ImportExportActions, GDriveAccount };

export interface WatchFolder {
  id?: number;
  path: string;
  created_at?: string;
}

interface AppContextType {
  appState: AppState;
  setActiveModule: (module: AppState['activeModule']) => void;
  files: File[];
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  selectedFileId: number | null;
  setSelectedFileId: (id: number | null) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  fileCategory: 'all' | 'other' | 'gdrive' | 'pdf' | 'spreadsheet' | 'text' | 'image' | 'presentation';
  setFileCategory: (category: 'all' | 'other' | 'gdrive' | 'pdf' | 'spreadsheet' | 'text' | 'image' | 'presentation') => void;
  loadFiles: () => Promise<void>;
  addFile: (file: File) => Promise<number>;
  deleteFile: (id: number) => Promise<void>;
  updateFile: (file: File) => Promise<void>;
  rightPanelVisible: boolean;
  setRightPanelVisible: (visible: boolean) => void;
  activeSettingsTab: 'local-folders' | 'google-drive';
  setActiveSettingsTab: (tab: 'local-folders' | 'google-drive') => void;
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
  navigateModuleBack: () => void;
  navigateModuleForward: () => void;
  canNavigateModuleBack: boolean;
  canNavigateModuleForward: boolean;
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
  importExportActions: Record<string, ImportExportActions>;
  registerImportExportActions: (module: string, actions: ImportExportActions | null) => void;
  directAddNewModule: string | null;
  setDirectAddNewModule: (module: string | null) => void;
  isDbInitialized: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const ui = useUIState();
  const [fileCategory, setFileCategory] = useState<'all' | 'other' | 'gdrive' | 'pdf' | 'spreadsheet' | 'text' | 'image' | 'presentation'>('all');
  const [directAddNewModule, setDirectAddNewModule] = useState<string | null>(null);
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  const filesState = useFileState({ 
    showToast: ui.showToast, 
    selectedFileId: ui.selectedFileId, 
    setSelectedFileId: ui.setSelectedFileId 
  });
  const gdriveState = useGDriveState({ 
    showToast: ui.showToast, 
    fileCategory 
  });

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let unlistenLocal: (() => void) | undefined;
    const init = async () => {
      try {
        await invoke('init_database');
        setIsDbInitialized(true);
        await filesState.loadFiles();
        await filesState.loadWatchFolders();
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
            await gdriveState.exchangeCodeForToken(code);
          }
        });
        unlistenLocal = await listen<void>('local-files-changed', async () => {
          await filesState.loadFiles();
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

  return (
    <AppContext.Provider value={{
      appState: ui.appState,
      setActiveModule: ui.setActiveModule,
      files: filesState.files,
      toast: ui.toast,
      selectedFileId: ui.selectedFileId,
      setSelectedFileId: ui.setSelectedFileId,
      showToast: ui.showToast,
      fileCategory,
      setFileCategory,
      loadFiles: filesState.loadFiles,
      addFile: filesState.addFile,
      deleteFile: filesState.deleteFile,
      updateFile: filesState.updateFile,
      rightPanelVisible: ui.rightPanelVisible,
      setRightPanelVisible: ui.setRightPanelVisible,
      activeSettingsTab: ui.activeSettingsTab,
      setActiveSettingsTab: ui.setActiveSettingsTab,
      confirmOptions: ui.confirmOptions,
      showConfirm: ui.showConfirm,
      hideConfirm: ui.hideConfirm,
      currentFolderId: gdriveState.currentFolderId,
      setCurrentFolderId: gdriveState.setCurrentFolderId,
      folderHistory: gdriveState.folderHistory,
      folderHistoryIndex: gdriveState.folderHistoryIndex,
      fileLayoutMode: ui.fileLayoutMode,
      setFileLayoutMode: ui.setFileLayoutMode,
      navigateFolder: gdriveState.navigateFolder,
      navigateBack: gdriveState.navigateBack,
      navigateForward: gdriveState.navigateForward,
      canNavigateBack: gdriveState.canNavigateBack,
      canNavigateForward: gdriveState.canNavigateForward,
      navigateModuleBack: ui.navigateModuleBack,
      navigateModuleForward: ui.navigateModuleForward,
      canNavigateModuleBack: ui.canNavigateModuleBack,
      canNavigateModuleForward: ui.canNavigateModuleForward,
      connectedUser: gdriveState.connectedUser,
      setConnectedUser: gdriveState.setConnectedUser,
      testConnection: gdriveState.testConnection,
      refreshAccessToken: gdriveState.refreshAccessToken,
      gdriveAccounts: gdriveState.gdriveAccounts,
      setGdriveAccounts: gdriveState.setGdriveAccounts,
      refreshAccountToken: gdriveState.refreshAccountToken,
      watchFolders: filesState.watchFolders,
      loadWatchFolders: filesState.loadWatchFolders,
      addWatchFolder: filesState.addWatchFolder,
      removeWatchFolder: filesState.removeWatchFolder,
      addFileTag: filesState.addFileTag,
      removeFileTag: filesState.removeFileTag,
      getFileTags: filesState.getFileTags,
      getAllTags: filesState.getAllTags,
      getAllFileTags: filesState.getAllFileTags,
      importExportActions: ui.importExportActions,
      registerImportExportActions: ui.registerImportExportActions,
      directAddNewModule,
      setDirectAddNewModule,
      isDbInitialized,
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
