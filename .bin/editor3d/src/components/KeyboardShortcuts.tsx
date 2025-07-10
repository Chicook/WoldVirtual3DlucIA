import React, { useEffect, useRef, useCallback, useState } from 'react';
import './KeyboardShortcuts.css';

interface ShortcutAction {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  category: string;
  enabled?: boolean;
}

interface KeyboardShortcutsProps {
  shortcuts: ShortcutAction[];
  onShortcutTriggered?: (shortcut: ShortcutAction) => void;
  showHelp?: boolean;
  onToggleHelp?: () => void;
  className?: string;
  enableGlobal?: boolean;
  preventDefault?: boolean;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  shortcuts,
  onShortcutTriggered,
  showHelp = false,
  onToggleHelp,
  className = '',
  enableGlobal = true,
  preventDefault = true
}) => {
  const [activeShortcuts, setActiveShortcuts] = useState<Set<string>>(new Set());
  const [showShortcutsPanel, setShowShortcutsPanel] = useState(false);
  const shortcutsRef = useRef<Map<string, ShortcutAction>>(new Map());
  const pressedKeysRef = useRef<Set<string>>(new Set());

  // Función para generar la clave única del shortcut
  const getShortcutKey = useCallback((shortcut: ShortcutAction): string => {
    const modifiers = [];
    if (shortcut.ctrl) modifiers.push('Ctrl');
    if (shortcut.shift) modifiers.push('Shift');
    if (shortcut.alt) modifiers.push('Alt');
    if (shortcut.meta) modifiers.push('Meta');
    modifiers.push(shortcut.key.toUpperCase());
    return modifiers.join('+');
  }, []);

  // Función para verificar si un shortcut coincide con las teclas presionadas
  const checkShortcut = useCallback((shortcut: ShortcutAction, pressedKeys: Set<string>): boolean => {
    const requiredKeys = new Set<string>();
    
    if (shortcut.ctrl) requiredKeys.add('Control');
    if (shortcut.shift) requiredKeys.add('Shift');
    if (shortcut.alt) requiredKeys.add('Alt');
    if (shortcut.meta) requiredKeys.add('Meta');
    requiredKeys.add(shortcut.key.toLowerCase());

    // Verificar que todas las teclas requeridas estén presionadas
    for (const key of requiredKeys) {
      if (!pressedKeys.has(key)) {
        return false;
      }
    }

    // Verificar que no haya teclas extra presionadas
    for (const key of pressedKeys) {
      if (!requiredKeys.has(key)) {
        return false;
      }
    }

    return true;
  }, []);

  // Función para manejar el evento keydown
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enableGlobal) return;

    const key = event.key.toLowerCase();
    const pressedKeys = new Set(pressedKeysRef.current);
    
    // Agregar la tecla presionada
    pressedKeys.add(key);
    pressedKeysRef.current = pressedKeys;

    // Verificar shortcuts
    for (const [shortcutKey, shortcut] of shortcutsRef.current) {
      if (!shortcut.enabled) continue;
      
      if (checkShortcut(shortcut, pressedKeys)) {
        if (preventDefault) {
          event.preventDefault();
          event.stopPropagation();
        }
        
        // Ejecutar la acción
        try {
          shortcut.action();
          onShortcutTriggered?.(shortcut);
        } catch (error) {
          console.error(`Error executing shortcut ${shortcutKey}:`, error);
        }
        
        // Limpiar teclas presionadas
        pressedKeysRef.current.clear();
        setActiveShortcuts(new Set());
        break;
      }
    }

    // Actualizar shortcuts activos para UI
    const active = new Set<string>();
    for (const [shortcutKey, shortcut] of shortcutsRef.current) {
      if (checkShortcut(shortcut, pressedKeys)) {
        active.add(shortcutKey);
      }
    }
    setActiveShortcuts(active);
  }, [enableGlobal, preventDefault, checkShortcut, onShortcutTriggered]);

  // Función para manejar el evento keyup
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!enableGlobal) return;

    const key = event.key.toLowerCase();
    const pressedKeys = new Set(pressedKeysRef.current);
    
    // Remover la tecla liberada
    pressedKeys.delete(key);
    pressedKeysRef.current = pressedKeys;

    // Actualizar shortcuts activos
    const active = new Set<string>();
    for (const [shortcutKey, shortcut] of shortcutsRef.current) {
      if (checkShortcut(shortcut, pressedKeys)) {
        active.add(shortcutKey);
      }
    }
    setActiveShortcuts(active);
  }, [enableGlobal, checkShortcut]);

  // Función para manejar el evento keydown local
  const handleLocalKeyDown = useCallback((event: React.KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const pressedKeys = new Set(pressedKeysRef.current);
    pressedKeys.add(key);
    pressedKeysRef.current = pressedKeys;

    // Verificar shortcuts
    for (const [shortcutKey, shortcut] of shortcutsRef.current) {
      if (!shortcut.enabled) continue;
      
      if (checkShortcut(shortcut, pressedKeys)) {
        if (preventDefault) {
          event.preventDefault();
          event.stopPropagation();
        }
        
        try {
          shortcut.action();
          onShortcutTriggered?.(shortcut);
        } catch (error) {
          console.error(`Error executing shortcut ${shortcutKey}:`, error);
        }
        
        pressedKeysRef.current.clear();
        setActiveShortcuts(new Set());
        break;
      }
    }

    const active = new Set<string>();
    for (const [shortcutKey, shortcut] of shortcutsRef.current) {
      if (checkShortcut(shortcut, pressedKeys)) {
        active.add(shortcutKey);
      }
    }
    setActiveShortcuts(active);
  }, [preventDefault, checkShortcut, onShortcutTriggered]);

  // Función para manejar el evento keyup local
  const handleLocalKeyUp = useCallback((event: React.KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const pressedKeys = new Set(pressedKeysRef.current);
    pressedKeys.delete(key);
    pressedKeysRef.current = pressedKeys;

    const active = new Set<string>();
    for (const [shortcutKey, shortcut] of shortcutsRef.current) {
      if (checkShortcut(shortcut, pressedKeys)) {
        active.add(shortcutKey);
      }
    }
    setActiveShortcuts(active);
  }, [checkShortcut]);

  // Función para renderizar la tecla del shortcut
  const renderShortcutKey = useCallback((shortcut: ShortcutAction): string => {
    const parts = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.meta) parts.push('⌘');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  }, []);

  // Función para agrupar shortcuts por categoría
  const groupShortcutsByCategory = useCallback(() => {
    const groups = new Map<string, ShortcutAction[]>();
    
    for (const shortcut of shortcuts) {
      if (!groups.has(shortcut.category)) {
        groups.set(shortcut.category, []);
      }
      groups.get(shortcut.category)!.push(shortcut);
    }
    
    return groups;
  }, [shortcuts]);

  // Función para mostrar el panel de shortcuts
  const toggleShortcutsPanel = useCallback(() => {
    setShowShortcutsPanel(prev => !prev);
  }, []);

  // Efecto para inicializar shortcuts
  useEffect(() => {
    shortcutsRef.current.clear();
    for (const shortcut of shortcuts) {
      const key = getShortcutKey(shortcut);
      shortcutsRef.current.set(key, shortcut);
    }
  }, [shortcuts, getShortcutKey]);

  // Efecto para agregar/remover event listeners globales
  useEffect(() => {
    if (!enableGlobal) return;

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [enableGlobal, handleKeyDown, handleKeyUp]);

  // Efecto para limpiar al desmontar
  useEffect(() => {
    return () => {
      pressedKeysRef.current.clear();
      setActiveShortcuts(new Set());
    };
  }, []);

  // Renderizar el panel de shortcuts
  const renderShortcutsPanel = () => {
    if (!showShortcutsPanel) return null;

    const groupedShortcuts = groupShortcutsByCategory();

    return (
      <div className="shortcuts-panel">
        <div className="shortcuts-header">
          <h3>Keyboard Shortcuts</h3>
          <button 
            className="shortcuts-close-btn"
            onClick={toggleShortcutsPanel}
            title="Close shortcuts panel"
          >
            ×
          </button>
        </div>
        
        <div className="shortcuts-content">
          {Array.from(groupedShortcuts.entries()).map(([category, categoryShortcuts]) => (
            <div key={category} className="shortcuts-category">
              <h4 className="category-title">{category}</h4>
              <div className="category-shortcuts">
                {categoryShortcuts.map((shortcut, index) => {
                  const shortcutKey = getShortcutKey(shortcut);
                  const isActive = activeShortcuts.has(shortcutKey);
                  
                  return (
                    <div 
                      key={`${category}-${index}`}
                      className={`shortcut-item ${isActive ? 'active' : ''} ${!shortcut.enabled ? 'disabled' : ''}`}
                    >
                      <span className="shortcut-description">{shortcut.description}</span>
                      <span className="shortcut-keys">
                        {renderShortcutKey(shortcut)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar indicador de shortcuts activos
  const renderActiveShortcuts = () => {
    if (activeShortcuts.size === 0) return null;

    return (
      <div className="active-shortcuts-indicator">
        {Array.from(activeShortcuts).map(shortcutKey => (
          <span key={shortcutKey} className="active-shortcut">
            {shortcutKey}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div 
      className={`keyboard-shortcuts ${className}`}
      tabIndex={-1}
      onKeyDown={handleLocalKeyDown}
      onKeyUp={handleLocalKeyUp}
    >
      {/* Botón para mostrar shortcuts */}
      {onToggleHelp && (
        <button 
          className="shortcuts-help-btn"
          onClick={onToggleHelp}
          title="Show keyboard shortcuts"
        >
          ⌨️
        </button>
      )}
      
      {/* Botón para mostrar panel de shortcuts */}
      <button 
        className="shortcuts-panel-btn"
        onClick={toggleShortcutsPanel}
        title="Keyboard shortcuts reference"
      >
        ?
      </button>
      
      {/* Indicador de shortcuts activos */}
      {renderActiveShortcuts()}
      
      {/* Panel de shortcuts */}
      {renderShortcutsPanel()}
    </div>
  );
};

export default KeyboardShortcuts; 