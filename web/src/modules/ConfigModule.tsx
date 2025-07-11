/**
 * @fileoverview Módulo de gestión de configuración para WoldVirtual3DlucIA
 * @version 1.0.0
 * @author WoldVirtual3DlucIA Team
 */

import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

export interface ConfigSection {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'user' | 'development' | 'production';
  settings: ConfigSetting[];
  isExpanded?: boolean;
}

export interface ConfigSetting {
  id: string;
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'json' | 'file';
  value: any;
  defaultValue: any;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
    custom?: (value: any) => boolean;
  };
  metadata?: {
    unit?: string;
    placeholder?: string;
    helpText?: string;
    deprecated?: boolean;
  };
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: ConfigError[];
  warnings: ConfigWarning[];
}

export interface ConfigError {
  settingId: string;
  message: string;
  severity: 'error' | 'critical';
}

export interface ConfigWarning {
  settingId: string;
  message: string;
  severity: 'warning' | 'info';
}

export interface ConfigModuleState {
  sections: ConfigSection[];
  isLoaded: boolean;
  hasChanges: boolean;
  validationResult: ConfigValidationResult;
  lastSaved: Date | null;
  autoSave: boolean;
}

// ============================================================================
// CLASE CONFIG MANAGER
// ============================================================================

class Logger {
  log(message: string) {
    console.log(`[ConfigManager] ${message}`);
  }
  
  error(message: string) {
    console.error(`[ConfigManager] ${message}`);
  }
}

class ConfigManager {
  private logger: Logger;
  private config: Map<string, any>;
  private listeners: Set<(config: Map<string, any>) => void>;
  private autoSaveInterval: NodeJS.Timeout | null;
  private storageKey: string;

  constructor(storageKey: string = 'woldvirtual_config') {
    this.logger = new Logger();
    this.config = new Map();
    this.listeners = new Set();
    this.autoSaveInterval = null;
    this.storageKey = storageKey;
    this.logger.log(`ConfigManager inicializado con storageKey: ${storageKey}`);
  }

  async loadConfig(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = new Map(Object.entries(parsed));
        this.logger.log(`Configuración cargada: ${this.config.size} elementos`);
      } else {
        this.logger.log('No se encontró configuración guardada, usando valores por defecto');
      }
    } catch (error) {
      this.logger.error(`Error cargando configuración: ${error}`);
      this.config = new Map();
    }
  }

  async saveConfig(): Promise<void> {
    try {
      const configObj = Object.fromEntries(this.config);
      localStorage.setItem(this.storageKey, JSON.stringify(configObj));
      this.logger.log(`Configuración guardada: ${this.config.size} elementos`);
      this.notifyListeners();
    } catch (error) {
      this.logger.error(`Error guardando configuración: ${error}`);
      throw error;
    }
  }

  get<T>(key: string, defaultValue?: T): T {
    if (this.config.has(key)) {
      return this.config.get(key) as T;
    }
    if (defaultValue !== undefined) {
      this.config.set(key, defaultValue);
      return defaultValue;
    }
    throw new Error(`Configuración no encontrada: ${key}`);
  }

  set<T>(key: string, value: T): void {
    this.config.set(key, value);
    this.logger.log(`Configuración actualizada: ${key} = ${value}`);
    this.notifyListeners();
  }

  has(key: string): boolean {
    return this.config.has(key);
  }

  delete(key: string): boolean {
    const deleted = this.config.delete(key);
    if (deleted) {
      this.logger.log(`Configuración eliminada: ${key}`);
      this.notifyListeners();
    }
    return deleted;
  }

  keys(): string[] {
    return Array.from(this.config.keys());
  }

  entries(): [string, any][] {
    return Array.from(this.config.entries());
  }

  validateConfig(sections: ConfigSection[]): ConfigValidationResult {
    const errors: ConfigError[] = [];
    const warnings: ConfigWarning[] = [];

    for (const section of sections) {
      for (const setting of section.settings) {
        const value = this.config.get(setting.id);
        
        // Validar requeridos
        if (setting.required && (value === undefined || value === null || value === '')) {
          errors.push({
            settingId: setting.id,
            message: `Campo requerido: ${setting.name}`,
            severity: 'error'
          });
          continue;
        }

        // Validar tipo
        if (value !== undefined && value !== null) {
          const typeValidation = this.validateType(setting, value);
          if (!typeValidation.isValid) {
            errors.push({
              settingId: setting.id,
              message: typeValidation.message,
              severity: 'error'
            });
          }
        }

        // Validar rango numérico
        if (setting.type === 'number' && typeof value === 'number') {
          if (setting.validation?.min !== undefined && value < setting.validation.min) {
            errors.push({
              settingId: setting.id,
              message: `Valor mínimo: ${setting.validation.min}`,
              severity: 'error'
            });
          }
          if (setting.validation?.max !== undefined && value > setting.validation.max) {
            errors.push({
              settingId: setting.id,
              message: `Valor máximo: ${setting.validation.max}`,
              severity: 'error'
            });
          }
        }

        // Validar patrón
        if (setting.type === 'string' && setting.validation?.pattern && typeof value === 'string') {
          const regex = new RegExp(setting.validation.pattern);
          if (!regex.test(value)) {
            errors.push({
              settingId: setting.id,
              message: `Formato inválido para: ${setting.name}`,
              severity: 'error'
            });
          }
        }

        // Validación personalizada
        if (setting.validation?.custom && value !== undefined) {
          if (!setting.validation.custom(value)) {
            errors.push({
              settingId: setting.id,
              message: `Validación personalizada falló para: ${setting.name}`,
              severity: 'error'
            });
          }
        }

        // Advertencias para campos deprecados
        if (setting.metadata?.deprecated) {
          warnings.push({
            settingId: setting.id,
            message: `Campo deprecado: ${setting.name}`,
            severity: 'warning'
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateType(setting: ConfigSetting, value: any): { isValid: boolean; message: string } {
    switch (setting.type) {
      case 'string':
        if (typeof value !== 'string') {
          return { isValid: false, message: 'Debe ser una cadena de texto' };
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return { isValid: false, message: 'Debe ser un número válido' };
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          return { isValid: false, message: 'Debe ser verdadero o falso' };
        }
        break;
      case 'select':
        if (setting.validation?.options && !setting.validation.options.includes(value)) {
          return { isValid: false, message: `Debe ser uno de: ${setting.validation.options.join(', ')}` };
        }
        break;
      case 'json':
        try {
          JSON.parse(value);
        } catch {
          return { isValid: false, message: 'Debe ser JSON válido' };
        }
        break;
    }
    return { isValid: true, message: '' };
  }

  enableAutoSave(intervalMs: number = 30000): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    this.autoSaveInterval = setInterval(() => {
      this.saveConfig().catch(error => {
        this.logger.error(`Error en auto-save: ${error}`);
      });
    }, intervalMs);
    
    this.logger.log(`Auto-save habilitado cada ${intervalMs}ms`);
  }

  disableAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      this.logger.log('Auto-save deshabilitado');
    }
  }

  subscribe(listener: (config: Map<string, any>) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.config);
      } catch (error) {
        this.logger.error(`Error en listener: ${error}`);
      }
    });
  }

  exportConfig(): string {
    const configObj = Object.fromEntries(this.config);
    return JSON.stringify(configObj, null, 2);
  }

  importConfig(configJson: string): void {
    try {
      const configObj = JSON.parse(configJson);
      this.config = new Map(Object.entries(configObj));
      this.logger.log(`Configuración importada: ${this.config.size} elementos`);
      this.notifyListeners();
    } catch (error) {
      this.logger.error(`Error importando configuración: ${error}`);
      throw error;
    }
  }

  resetToDefaults(sections: ConfigSection[]): void {
    for (const section of sections) {
      for (const setting of section.settings) {
        this.config.set(setting.id, setting.defaultValue);
      }
    }
    this.logger.log('Configuración reseteada a valores por defecto');
    this.notifyListeners();
  }
}

// ============================================================================
// HOOK PERSONALIZADO
// ============================================================================

export const useConfigManager = (storageKey?: string) => {
  const [configManager] = useState(() => new ConfigManager(storageKey));
  const [config, setConfig] = useState<Map<string, any>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      await configManager.loadConfig();
      setConfig(new Map(configManager.entries()));
      setIsLoaded(true);
    };

    loadConfig();
  }, [configManager]);

  useEffect(() => {
    const unsubscribe = configManager.subscribe((newConfig) => {
      setConfig(new Map(newConfig));
    });

    return unsubscribe;
  }, [configManager]);

  const saveConfig = useCallback(async () => {
    await configManager.saveConfig();
  }, [configManager]);

  const getConfig = useCallback(function<T>(key: string, defaultValue?: T): T {
    return configManager.get(key, defaultValue);
  }, [configManager]);

  const setConfigValue = useCallback(function<T>(key: string, value: T) {
    configManager.set(key, value);
  }, [configManager]);

  return {
    configManager,
    config,
    isLoaded,
    saveConfig,
    getConfig,
    setConfigValue
  };
};

// ============================================================================
// COMPONENTE REACT DEL MÓDULO
// ============================================================================

interface ConfigModuleProps {
  storageKey?: string;
  sections?: ConfigSection[];
  onConfigChange?: (config: Map<string, any>) => void;
  onValidationChange?: (result: ConfigValidationResult) => void;
}

export const ConfigModule: React.FC<ConfigModuleProps> = ({
  storageKey,
  sections = [],
  onConfigChange,
  onValidationChange
}) => {
  const { configManager, config, isLoaded, saveConfig, setConfigValue } = useConfigManager(storageKey);
  const [state, setState] = useState<ConfigModuleState>({
    sections: sections,
    isLoaded: false,
    hasChanges: false,
    validationResult: { isValid: true, errors: [], warnings: [] },
    lastSaved: null,
    autoSave: true
  });

  useEffect(() => {
    setState(prev => ({ ...prev, isLoaded }));
  }, [isLoaded]);

  useEffect(() => {
    onConfigChange?.(config);
  }, [config, onConfigChange]);

  const handleSettingChange = useCallback((settingId: string, value: any) => {
    setConfigValue(settingId, value);
    setState(prev => ({ ...prev, hasChanges: true }));
    
    // Validar configuración
    const validationResult = configManager.validateConfig(state.sections);
    setState(prev => ({ ...prev, validationResult }));
    onValidationChange?.(validationResult);
  }, [setConfigValue, configManager, state.sections, onValidationChange]);

  const handleSave = useCallback(async () => {
    try {
      await saveConfig();
      setState(prev => ({ 
        ...prev, 
        hasChanges: false, 
        lastSaved: new Date() 
      }));
    } catch (error) {
      console.error('Error guardando configuración:', error);
    }
  }, [saveConfig]);

  const handleReset = useCallback(() => {
    configManager.resetToDefaults(state.sections);
    setState(prev => ({ ...prev, hasChanges: false }));
  }, [configManager, state.sections]);

  const handleExport = useCallback(() => {
    const configJson = configManager.exportConfig();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'woldvirtual-config.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [configManager]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const configJson = e.target?.result as string;
        configManager.importConfig(configJson);
        setState(prev => ({ ...prev, hasChanges: true }));
      } catch (error) {
        console.error('Error importando configuración:', error);
      }
    };
    reader.readAsText(file);
  }, [configManager]);

  if (!isLoaded) {
    return (
      <div className="config-module-loading">
        <div className="loading-spinner">⏳</div>
        <p>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="config-module">
      <div className="config-module-header">
        <h2>⚙️ Gestión de Configuración</h2>
        <div className="config-module-stats">
          <span>📊 Configuraciones: {config.size}</span>
          <span>✅ Válidas: {state.validationResult.isValid ? 'Sí' : 'No'}</span>
          {state.lastSaved && (
            <span>💾 Último guardado: {state.lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      <div className="config-module-controls">
        <button 
          onClick={handleSave} 
          disabled={!state.hasChanges}
          className="config-save-btn"
        >
          💾 Guardar Cambios
        </button>
        
        <button onClick={handleReset} className="config-reset-btn">
          🔄 Resetear
        </button>
        
        <button onClick={handleExport} className="config-export-btn">
          📤 Exportar
        </button>
        
        <label className="config-import-btn">
          📥 Importar
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {state.validationResult.errors.length > 0 && (
        <div className="config-errors">
          <h4>❌ Errores de Validación:</h4>
          <ul>
            {state.validationResult.errors.map((error, index) => (
              <li key={index} className={`error-${error.severity}`}>
                <strong>{error.settingId}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.validationResult.warnings.length > 0 && (
        <div className="config-warnings">
          <h4>⚠️ Advertencias:</h4>
          <ul>
            {state.validationResult.warnings.map((warning, index) => (
              <li key={index} className={`warning-${warning.severity}`}>
                <strong>{warning.settingId}:</strong> {warning.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="config-sections">
        {state.sections.map((section) => (
          <div key={section.id} className="config-section">
            <div 
              className="config-section-header"
              onClick={() => setState(prev => ({
                ...prev,
                sections: prev.sections.map(s => 
                  s.id === section.id 
                    ? { ...s, isExpanded: !s.isExpanded }
                    : s
                )
              }))}
            >
              <h3>{section.name}</h3>
              <span className="section-category">{section.category}</span>
              <span className="expand-icon">
                {section.isExpanded ? '▼' : '▶'}
              </span>
            </div>
            
            {section.isExpanded && (
              <div className="config-section-content">
                <p className="section-description">{section.description}</p>
                <div className="config-settings">
                  {section.settings.map((setting) => (
                    <div key={setting.id} className="config-setting">
                      <label className="setting-label">
                        <span className="setting-name">{setting.name}</span>
                        {setting.required && <span className="required">*</span>}
                      </label>
                      <p className="setting-description">{setting.description}</p>
                      {renderSettingInput(setting, config.get(setting.id), handleSettingChange)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// FUNCIÓN AUXILIAR PARA RENDERIZAR INPUTS
// ============================================================================

function renderSettingInput(
  setting: ConfigSetting,
  value: any,
  onChange: (settingId: string, value: any) => void
): React.ReactNode {
  const handleChange = (newValue: any) => {
    onChange(setting.id, newValue);
  };

  switch (setting.type) {
    case 'string':
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={setting.metadata?.placeholder}
          className="config-input"
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => handleChange(Number(e.target.value))}
          min={setting.validation?.min}
          max={setting.validation?.max}
          step="any"
          className="config-input"
        />
      );

    case 'boolean':
      return (
        <label className="config-checkbox">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => handleChange(e.target.checked)}
          />
          <span className="checkmark"></span>
        </label>
      );

    case 'select':
      return (
        <select
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="config-select"
        >
          {setting.validation?.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );

    case 'json':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="{}"
          className="config-textarea"
          rows={4}
        />
      );

    case 'file':
      return (
        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleChange(file.name);
            }
          }}
          className="config-file"
        />
      );

    default:
      return <div>Tipo no soportado: {setting.type}</div>;
  }
} 