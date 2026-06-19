import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { appState, setActiveModule } = useAppContext();

  const menuItems = [
    { id: 'invoice' as const, label: 'Invoice Generator', icon: '🧾' },
    { id: 'extractor' as const, label: 'Pre-order Extractor', icon: '📥' },
    { id: 'files' as const, label: 'Smart Folders', icon: '📁' },
    { id: 'ledger' as const, label: 'Buku Besar', icon: '📊' },
  ];

  const bottomItems = [
    { id: 'settings' as const, label: 'Pengaturan', icon: '⚙️' },
  ];

  return (
    <div style={{ height: '100vh', background: '#2d2720', color: '#a89880', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: '0 12px' }}>
        {!collapsed && (
          <button style={{ background: 'transparent', border: 'none', color: '#a89880', cursor: 'pointer', fontSize: '18px', padding: '8px', borderRadius: '6px' }}>
            🔍
          </button>
        )}
        {!collapsed && (
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#f8f4e9' }}>
            PubHub
          </div>
        )}
        <button 
          onClick={onToggle}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: '#a89880', 
            cursor: 'pointer', 
            fontSize: '18px', 
            padding: '8px',
            borderRadius: '6px'
          }}
        >
          {collapsed ? '→' : '☰'}
        </button>
      </div>
      
      {/* Menu */}
      <nav style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            style={{ 
              width: '100%', 
              padding: collapsed ? '12px' : '10px 12px', 
              border: 'none', 
              borderRadius: '8px',
              background: appState.activeModule === item.id ? '#f0e0b5' : 'transparent', 
              color: appState.activeModule === item.id ? '#2d2720' : '#a89880', 
              textAlign: 'left', 
              cursor: 'pointer', 
              fontSize: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: collapsed ? '0' : '12px',
              marginBottom: '4px',
              fontWeight: appState.activeModule === item.id ? '600' : '400',
              transition: 'all 0.15s ease'
            }}
            onClick={() => setActiveModule(item.id)}
            onMouseOver={(e) => {
              if (appState.activeModule !== item.id) {
                e.currentTarget.style.background = '#3c342a';
                e.currentTarget.style.color = '#f8f4e9';
              }
            }}
            onMouseOut={(e) => {
              if (appState.activeModule !== item.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#a89880';
              }
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
      
      {/* Bottom Section */}
      <div style={{ padding: '8px', borderTop: '1px solid #42382d' }}>
        {!collapsed && (
          <div style={{ padding: '10px 12px', color: '#a89880', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '18px' }}>🧑‍💻</span>
            <span>info.rasyiq@gmail.com</span>
          </div>
        )}
        {!collapsed && (
          <div style={{ padding: '10px 12px', color: '#a89880', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px' }}>📂</span>
              <span>PROJECT</span>
            </div>
            <span style={{ fontSize: '14px' }}>▴</span>
          </div>
        )}
        {bottomItems.map((item) => (
          <button
            key={item.id}
            style={{ 
              width: '100%', 
              padding: collapsed ? '12px' : '10px 12px', 
              border: 'none', 
              borderRadius: '8px',
              background: 'transparent', 
              color: '#a89880', 
              textAlign: 'left', 
              cursor: 'pointer', 
              fontSize: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: collapsed ? '0' : '12px',
              marginBottom: '4px',
              transition: 'all 0.15s ease'
            }}
            onClick={() => setActiveModule(item.id)}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#3c342a';
              e.currentTarget.style.color = '#f8f4e9';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#a89880';
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
