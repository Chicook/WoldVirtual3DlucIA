import { useState } from 'react';
import { messageBus } from '../core/InterModuleMessageBus';

interface NavigationProps {
  userId?: string;
}

const NavigationComponent = ({ userId }: NavigationProps) => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'editor', name: 'Editor 3D', icon: '🎨' },
    { id: 'blockchain', name: 'Blockchain', icon: '⛓️' },
    { id: 'ai', name: 'LucIA AI', icon: '🤖' },
    { id: 'assets', name: 'Assets', icon: '🎮' },
    { id: 'tools', name: 'Herramientas', icon: '🔧' },
    { id: 'settings', name: 'Configuración', icon: '⚙️' }
  ];

  const handleNavigation = (sectionId: string) => {
    setActiveSection(sectionId);
    messageBus.publish('navigate', { section: sectionId, userId });
  };

  return (
    <nav className="navigation-component">
      <div className="nav-header">
        <h3>Navegación</h3>
        <div className="user-info">
          <span>👤 {userId || 'Usuario'}</span>
        </div>
      </div>

      <div className="nav-menu">
        {navigationItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.id)}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.name}</span>
          </button>
        ))}
      </div>

      <div className="nav-footer">
        <div className="nav-status">
          <span className="status-indicator online"></span>
          <span>Conectado</span>
        </div>
      </div>
    </nav>
  );
};

export default NavigationComponent; 