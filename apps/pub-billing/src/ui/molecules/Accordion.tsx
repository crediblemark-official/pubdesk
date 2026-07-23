import React from 'react';

interface AccordionSectionProps {
  index: number;
  title: string;
  icon?: string;
  expandedSection: number | null;
  onToggle: (index: number | null) => void;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({
  index, title, icon, expandedSection, onToggle, children, headerAction
}) => {
  const isOpen = expandedSection === index;
  return (
    <div style={{ 
      border: '1px solid var(--border)', 
      borderRadius: '8px', 
      overflow: isOpen ? 'visible' : 'hidden', 
      background: 'var(--bg-card)' 
    }}>
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 16px',
          height: '40px',
          boxSizing: 'border-box',
          background: isOpen ? 'var(--bg-panel)' : 'transparent',
          border: 'none',
          color: isOpen ? 'var(--accent)' : 'var(--text-primary)',
          fontSize: '12px',
          fontWeight: '700',
          textAlign: 'left',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          outline: 'none',
        }}
      >
        <span 
          onClick={() => onToggle(isOpen ? null : index)} 
          style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', flex: 1 }}
        >
          <span>{icon && <span>{icon} </span>}{title}</span>
          {headerAction && (
            <span
              onClick={(e) => e.stopPropagation()}
              style={{ display: 'flex', gap: '8px', textTransform: 'initial', letterSpacing: 'initial' }}
            >
              {headerAction}
            </span>
          )}
        </span>
        <span 
          onClick={() => onToggle(isOpen ? null : index)} 
          style={{ fontSize: '10px', color: 'var(--text-secondary)', cursor: 'pointer', paddingLeft: '8px' }}
        >
          {isOpen ? '▲' : '▼'}
        </span>
      </div>
      {isOpen && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          {children}
        </div>
      )}
    </div>
  );
};

interface AccordionProps {
  children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({ children }) => {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{children}</div>;
};
