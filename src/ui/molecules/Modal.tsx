import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open, onClose, title, children, width = '420px'
}) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          width,
          maxWidth: '90vw',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
};
