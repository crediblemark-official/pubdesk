import React, { useEffect, useState } from 'react';

export const WindowControls: React.FC = () => {
  const [appWindow, setAppWindow] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      import('@tauri-apps/api/window')
        .then((m) => setAppWindow(m.getCurrentWindow()))
        .catch((err) => console.error('Gagal memuat Tauri Window API:', err));
    }
  }, []);

  const handleMinimize = () => {
    appWindow ? appWindow.minimize().catch(console.error) : console.log('Minimize window (browser mock)');
  };

  const handleMaximize = () => {
    appWindow ? appWindow.toggleMaximize().catch(console.error) : console.log('Maximize window (browser mock)');
  };

  const handleClose = () => {
    appWindow ? appWindow.close().catch(console.error) : console.log('Close window (browser mock)');
  };

  return (
    <div className="top-bar-gnome-windowcontrols">
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
