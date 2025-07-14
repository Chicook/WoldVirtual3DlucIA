//! # Sistema de UI Moderna
//! 
//! Componentes de interfaz moderna y responsive para el metaverso.
//! Incluye diseño system, temas y componentes reutilizables.

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiHome, FiUser, FiSettings, FiCreditCard, FiMenu, FiX, FiChevronDown } from 'react-icons/fi'

// Tipos
interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    success: string
    warning: string
    error: string
  }
}

interface ModernUIProps {
  children: React.ReactNode
  theme?: Theme
  className?: string
}

// Temas predefinidos
const themes: Record<string, Theme> = {
  dark: {
    name: 'dark',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      border: '#334155',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  light: {
    name: 'light',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  cyberpunk: {
    name: 'cyberpunk',
    colors: {
      primary: '#ff0080',
      secondary: '#00ffff',
      accent: '#ffff00',
      background: '#000000',
      surface: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#888888',
      border: '#ff0080',
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0000'
    }
  }
}

// Componente principal de UI moderna
export const ModernUI: React.FC<ModernUIProps> = ({ 
  children, 
  theme = themes.dark,
  className = '' 
}) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(theme)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Aplicar tema a CSS variables
    const root = document.documentElement
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
  }, [currentTheme])

  return (
    <div 
      className={`modern-ui ${className}`}
      style={{
        backgroundColor: currentTheme.colors.background,
        color: currentTheme.colors.text,
        minHeight: '100vh'
      }}
    >
      <ModernSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        theme={currentTheme}
      />
      
      <div className="main-content">
        <ModernHeader 
          onMenuClick={() => setSidebarOpen(true)}
          theme={currentTheme}
          onThemeChange={setCurrentTheme}
        />
        
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  )
}

// Header moderno
interface ModernHeaderProps {
  onMenuClick: () => void
  theme: Theme
  onThemeChange: (theme: Theme) => void
}

const ModernHeader: React.FC<ModernHeaderProps> = ({ 
  onMenuClick, 
  theme, 
  onThemeChange 
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false)

  return (
    <motion.header 
      className="modern-header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      style={{
        backgroundColor: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`
      }}
    >
      <div className="header-content">
        <button 
          className="menu-button"
          onClick={onMenuClick}
          style={{ color: theme.colors.text }}
        >
          <FiMenu size={24} />
        </button>

        <div className="header-title">
          <h1>Metaverso 3D</h1>
        </div>

        <div className="header-actions">
          <div className="theme-selector">
            <button 
              className="theme-button"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              style={{ 
                backgroundColor: theme.colors.primary,
                color: theme.colors.text 
              }}
            >
              <span>{theme.name}</span>
              <FiChevronDown size={16} />
            </button>

            <AnimatePresence>
              {showThemeMenu && (
                <motion.div 
                  className="theme-menu"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    backgroundColor: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`
                  }}
                >
                  {Object.values(themes).map((t) => (
                    <button
                      key={t.name}
                      className="theme-option"
                      onClick={() => {
                        onThemeChange(t)
                        setShowThemeMenu(false)
                      }}
                      style={{
                        color: theme.colors.text,
                        backgroundColor: t.name === theme.name ? theme.colors.primary : 'transparent'
                      }}
                    >
                      {t.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

// Sidebar moderna
interface ModernSidebarProps {
  isOpen: boolean
  onClose: () => void
  theme: Theme
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({ 
  isOpen, 
  onClose, 
  theme 
}) => {
  const menuItems = [
    { icon: FiHome, label: 'Inicio', path: '/' },
    { icon: FiUser, label: 'Perfil', path: '/profile' },
    { icon: FiCreditCard, label: 'Wallet', path: '/wallet' },
    { icon: FiSettings, label: 'Configuración', path: '/settings' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.aside 
            className="modern-sidebar"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            style={{
              backgroundColor: theme.colors.surface,
              borderRight: `1px solid ${theme.colors.border}`
            }}
          >
            <div className="sidebar-header">
              <h2>Navegación</h2>
              <button 
                className="close-button"
                onClick={onClose}
                style={{ color: theme.colors.text }}
              >
                <FiX size={24} />
              </button>
            </div>

            <nav className="sidebar-nav">
              {menuItems.map((item) => (
                <motion.a
                  key={item.path}
                  href={item.path}
                  className="nav-item"
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    color: theme.colors.text,
                    borderBottom: `1px solid ${theme.colors.border}`
                  }}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </motion.a>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// Botón moderno
interface ModernButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  className?: string
  theme?: Theme
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  theme = themes.dark
}) => {
  const getButtonStyles = () => {
    const baseStyles = {
      border: 'none',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    }

    const sizeStyles = {
      sm: { padding: '8px 16px', fontSize: '14px' },
      md: { padding: '12px 24px', fontSize: '16px' },
      lg: { padding: '16px 32px', fontSize: '18px' }
    }

    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.primary,
        color: theme.colors.text,
        '&:hover': {
          backgroundColor: theme.colors.secondary
        }
      },
      secondary: {
        backgroundColor: theme.colors.secondary,
        color: theme.colors.text,
        '&:hover': {
          backgroundColor: theme.colors.accent
        }
      },
      outline: {
        backgroundColor: 'transparent',
        color: theme.colors.primary,
        border: `2px solid ${theme.colors.primary}`,
        '&:hover': {
          backgroundColor: theme.colors.primary,
          color: theme.colors.text
        }
      },
      ghost: {
        backgroundColor: 'transparent',
        color: theme.colors.text,
        '&:hover': {
          backgroundColor: theme.colors.surface
        }
      }
    }

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.5 : 1
    }
  }

  return (
    <motion.button
      className={`modern-button ${className}`}
      style={getButtonStyles()}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {children}
    </motion.button>
  )
}

// Card moderna
interface ModernCardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
  theme?: Theme
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  theme = themes.dark
}) => {
  return (
    <motion.div
      className={`modern-card ${className}`}
      style={{
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '12px',
        padding: '24px'
      }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
    >
      {(title || subtitle) && (
        <div className="card-header">
          {title && (
            <h3 style={{ color: theme.colors.text, margin: 0 }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{ color: theme.colors.textSecondary, margin: '8px 0 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className="card-content">
        {children}
      </div>
    </motion.div>
  )
}

// Input moderno
interface ModernInputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'password' | 'email' | 'number'
  error?: string
  className?: string
  theme?: Theme
}

export const ModernInput: React.FC<ModernInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  className = '',
  theme = themes.dark
}) => {
  return (
    <div className={`modern-input ${className}`}>
      {label && (
        <label style={{ color: theme.colors.text, marginBottom: '8px', display: 'block' }}>
          {label}
        </label>
      )}
      
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 16px',
          border: `2px solid ${error ? theme.colors.error : theme.colors.border}`,
          borderRadius: '8px',
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          fontSize: '16px',
          outline: 'none',
          transition: 'border-color 0.2s ease'
        }}
      />
      
      {error && (
        <p style={{ color: theme.colors.error, fontSize: '14px', marginTop: '4px' }}>
          {error}
        </p>
      )}
    </div>
  )
}

// Modal moderna
interface ModernModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  theme?: Theme
}

export const ModernModal: React.FC<ModernModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  theme = themes.dark
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1000
            }}
          />
          
          <motion.div
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              zIndex: 1001
            }}
          >
            {title && (
              <h2 style={{ color: theme.colors.text, margin: '0 0 16px 0' }}>
                {title}
              </h2>
            )}
            
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Estilos CSS
const styles = `
  .modern-ui {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .main-content {
    margin-left: 0;
    transition: margin-left 0.3s ease;
  }

  .modern-header {
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 16px 24px;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
  }

  .menu-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background-color 0.2s ease;
  }

  .menu-button:hover {
    background-color: rgba(255,255,255,0.1);
  }

  .header-title h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
  }

  .theme-selector {
    position: relative;
  }

  .theme-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
  }

  .theme-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    border-radius: 8px;
    padding: 8px 0;
    min-width: 120px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  }

  .theme-option {
    display: block;
    width: 100%;
    padding: 8px 16px;
    border: none;
    background: none;
    cursor: pointer;
    text-align: left;
    font-size: 14px;
    transition: background-color 0.2s ease;
  }

  .theme-option:hover {
    background-color: rgba(255,255,255,0.1);
  }

  .modern-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 300px;
    height: 100vh;
    z-index: 1000;
    padding: 24px;
  }

  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    z-index: 999;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
  }

  .sidebar-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background-color 0.2s ease;
  }

  .close-button:hover {
    background-color: rgba(255,255,255,0.1);
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    text-decoration: none;
    border-radius: 8px;
    transition: background-color 0.2s ease;
  }

  .nav-item:hover {
    background-color: rgba(255,255,255,0.1);
  }

  .content {
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    .modern-sidebar {
      width: 100%;
    }
    
    .content {
      padding: 16px;
    }
  }
`

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

export default ModernUI 