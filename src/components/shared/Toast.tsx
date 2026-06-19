import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useAppContext();

  if (!toast) return null;

  const { message, type } = toast;

  // Warna aksen berdasarkan tipe
  let iconColor = 'var(--accent)';
  let iconSvg = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  ); // default info

  if (type === 'success') {
    iconColor = '#2ec27e'; // GNOME green
    iconSvg = (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    );
  } else if (type === 'error') {
    iconColor = '#e01b24'; // GNOME red
    iconSvg = (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 18px',
        borderRadius: '24px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        animation: 'slideUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        maxWidth: '90%',
        pointerEvents: 'none'
      }}
    >
      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translate(-50%, 12px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
      <span style={{ color: iconColor, display: 'flex', alignItems: 'center' }}>
        {iconSvg}
      </span>
      <span>{message}</span>
    </div>
  );
};

export default Toast;
