import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const WindowControls: React.FC = () => {
  const [appWindow, setAppWindow] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      import('@tauri-apps/api/window')
        .then((m) => setAppWindow(m.getCurrentWindow()))
        .catch((err) => console.error('Gagal memuat Tauri Window API:', err));
    }
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | null = null;

    if (appWindow) {
      appWindow.onCloseRequested(async (event: any) => {
        try {
          const activeSession = await invoke<any>('get_active_work_session');
          if (activeSession) {
            // Cegah window dari penutupan
            event.preventDefault();
            
            // Tampilkan pesan dialog secara asinkron
            const dialog = await import('@tauri-apps/plugin-dialog');
            await dialog.message(
              'Sesi jam kerja Anda masih aktif. Harap hentikan (stop) sesi kerja terlebih dahulu sebelum menutup aplikasi!',
              {
                title: 'Sesi Kerja Masih Aktif',
                kind: 'warning',
              }
            );
          }
        } catch (err) {
          console.error('Gagal memeriksa status jam kerja saat onCloseRequested:', err);
        }
      }).then((unsub: any) => {
        unlisten = unsub;
      });
    }

    return () => {
      if (unlisten) unlisten();
    };
  }, [appWindow]);

  const handleMinimize = () => {
    appWindow ? appWindow.minimize().catch(console.error) : console.log('Minimize window (browser mock)');
  };

  const handleMaximize = () => {
    appWindow ? appWindow.toggleMaximize().catch(console.error) : console.log('Maximize window (browser mock)');
  };

  const handleClose = async () => {
    if (!appWindow) {
      console.log('Close window (browser mock)');
      return;
    }

    try {
      const activeSession = await invoke<any>('get_active_work_session');
      if (activeSession) {
        const dialog = await import('@tauri-apps/plugin-dialog');
        await dialog.message(
          'Sesi jam kerja Anda masih aktif. Harap hentikan (stop) sesi kerja terlebih dahulu sebelum menutup aplikasi!',
          {
            title: 'Sesi Kerja Masih Aktif',
            kind: 'warning',
          }
        );
        return;
      }
    } catch (err) {
      console.error('Gagal memeriksa status jam kerja saat handleClose:', err);
    }

    appWindow.close().catch(console.error);
  };

  const handleDragStart = (e: React.MouseEvent) => {
    appWindow ? appWindow.startDragging().catch(console.error) : console.log('Drag window (browser mock)');
  };

  return (
    <div className="top-bar-gnome-windowcontrols">
      {/* Drag Handle Button untuk menggeser window */}
      <button 
        className="top-bar-window-btn top-bar-window-drag-btn" 
        onMouseDown={handleDragStart} 
        style={{ cursor: 'grab' }}
        title="Geser Window"
        aria-label="Drag Window"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="5" r="1" />
          <circle cx="9" cy="12" r="1" />
          <circle cx="9" cy="19" r="1" />
          <circle cx="15" cy="5" r="1" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="15" cy="19" r="1" />
        </svg>
      </button>

      <button className="top-bar-window-btn" onClick={handleMinimize} aria-label="Minimize">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <button className="top-bar-window-btn" onClick={handleMaximize} aria-label="Maximize">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      </button>
      <button className="top-bar-window-btn top-bar-window-close-btn" onClick={handleClose} aria-label="Close">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};
