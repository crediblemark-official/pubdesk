import { useState } from 'react';
import { File } from '../types/file.types';
import { WatchFolder } from '../contexts/AppContext';
import { invoke } from '@tauri-apps/api/core';

interface UseFileStateProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  selectedFileId: number | null;
  setSelectedFileId: (id: number | null) => void;
}

export function useFileState({ showToast, selectedFileId, setSelectedFileId }: UseFileStateProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [watchFolders, setWatchFolders] = useState<WatchFolder[]>([]);

  const loadFiles = async () => {
    try {
      const data = await invoke<File[]>('get_files');
      setFiles(data);
    } catch (error) {
      console.error('Failed to load files:', error);
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

  return {
    files,
    setFiles,
    watchFolders,
    loadFiles,
    addFile,
    deleteFile,
    updateFile,
    loadWatchFolders,
    addWatchFolder,
    removeWatchFolder,
    addFileTag,
    removeFileTag,
    getFileTags,
    getAllTags,
    getAllFileTags
  };
}
