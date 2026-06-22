import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const { appState, setActiveModule } = useAppContext();

  const menuItems = [
    { id: 'home' as const, label: 'Beranda', icon: '🏠' },
    { id: 'tim' as const, label: 'Anggota Tim', icon: '👨‍💼' },
  ];

  const bottomItems = [
    { id: 'activity-log' as const, label: 'Activity Log', icon: '📋' },
    { id: 'settings' as const, label: 'Pengaturan', icon: '⚙️' },
  ];

  return (
    <div style={{ height: '100%', background: 'var(--bg-panel)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Menu */}
      <nav style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
        {menuItems.map((item) => {
          const isActive = appState.activeModule === item.id;
          
          return (
            <div key={item.id}>
              <button
                style={{ 
                  width: '100%', 
                  padding: collapsed ? '12px' : '10px 12px', 
                  border: 'none', 
                  borderRadius: '8px',
                  background: isActive ? 'var(--accent)' : 'transparent', 
                  color: isActive ? '#ffffff' : 'var(--text-secondary)', 
                  textAlign: 'left', 
                  cursor: 'pointer', 
                  fontSize: '14px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: collapsed ? '0' : '12px',
                  marginBottom: '4px',
                  fontWeight: isActive ? '600' : '400',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => setActiveModule(item.id)}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-card)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            </div>
          );
        })}
      </nav>
      
      {/* Bottom Section */}
      <div style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
        {bottomItems.map((item) => {
          const isActive = appState.activeModule === item.id;
          return (
            <button
              key={item.id}
              style={{ 
                width: '100%', 
                padding: collapsed ? '12px' : '10px 12px', 
                border: 'none', 
                borderRadius: '8px',
                background: isActive ? 'var(--accent)' : 'transparent', 
                color: isActive ? '#ffffff' : 'var(--text-secondary)', 
                textAlign: 'left', 
                cursor: 'pointer', 
                fontSize: '14px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? '0' : '12px',
                marginBottom: '4px',
                fontWeight: isActive ? '600' : '400',
                transition: 'all 0.15s ease'
              }}
              onClick={() => setActiveModule(item.id)}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-card)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { Sidebar };
export default Sidebar;
