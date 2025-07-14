/**
 * @fileoverview Tests unitarios para el módulo de configuración
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfigModule, { ConfigManager, useConfigManager } from '../ConfigModule';
import { Logger } from '../../utils/logger';

// Mock del Logger
jest.mock('../../utils/logger', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }))
}));

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock de URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Configuración de prueba
const mockSections = [
  {
    id: 'system',
    name: 'Configuración del Sistema',
    description: 'Configuraciones básicas del sistema',
    category: 'system' as const,
    settings: [
      {
        id: 'app_name',
        name: 'Nombre de la Aplicación',
        description: 'Nombre que se mostrará en la aplicación',
        type: 'string' as const,
        value: 'WoldVirtual3DlucIA',
        defaultValue: 'WoldVirtual3DlucIA',
        required: true,
        validation: {
          pattern: '^[a-zA-Z0-9\\s]+$'
        }
      },
      {
        id: 'max_file_size',
        name: 'Tamaño Máximo de Archivo',
        description: 'Tamaño máximo permitido para archivos (MB)',
        type: 'number' as const,
        value: 50,
        defaultValue: 50,
        required: true,
        validation: {
          min: 1,
          max: 1000
        },
        metadata: {
          unit: 'MB'
        }
      },
      {
        id: 'debug_mode',
        name: 'Modo Debug',
        description: 'Habilitar modo de depuración',
        type: 'boolean' as const,
        value: false,
        defaultValue: false,
        required: false
      },
      {
        id: 'environment',
        name: 'Entorno',
        description: 'Entorno de ejecución',
        type: 'select' as const,
        value: 'development',
        defaultValue: 'development',
        required: true,
        validation: {
          options: ['development', 'staging', 'production']
        }
      }
    ]
  }
];

describe('ConfigModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
  });

  describe('ConfigManager Class', () => {
    let configManager: ConfigManager;

    beforeEach(() => {
      configManager = new ConfigManager('test_config');
    });

    test('should create ConfigManager with default storage key', () => {
      const manager = new ConfigManager();
      expect(manager).toBeInstanceOf(ConfigManager);
    });

    test('should load empty config when no stored data', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      await configManager.loadConfig();
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test_config');
    });

    test('should load existing config from localStorage', async () => {
      const mockConfig = { app_name: 'Test App', debug_mode: true };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockConfig));
      
      await configManager.loadConfig();
      
      expect(configManager.get('app_name')).toBe('Test App');
      expect(configManager.get('debug_mode')).toBe(true);
    });

    test('should save config to localStorage', async () => {
      configManager.set('app_name', 'Test App');
      configManager.set('debug_mode', true);
      
      await configManager.saveConfig();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test_config',
        expect.stringContaining('"app_name":"Test App"')
      );
    });

    test('should get config value with default', () => {
      const value = configManager.get('app_name', 'Default App');
      expect(value).toBe('Default App');
    });

    test('should set config value', () => {
      configManager.set('app_name', 'New App');
      expect(configManager.get('app_name')).toBe('New App');
    });

    test('should check if config key exists', () => {
      expect(configManager.has('app_name')).toBe(false);
      
      configManager.set('app_name', 'Test');
      expect(configManager.has('app_name')).toBe(true);
    });

    test('should delete config key', () => {
      configManager.set('app_name', 'Test');
      expect(configManager.has('app_name')).toBe(true);
      
      const deleted = configManager.delete('app_name');
      expect(deleted).toBe(true);
      expect(configManager.has('app_name')).toBe(false);
    });

    test('should get all config keys', () => {
      configManager.set('key1', 'value1');
      configManager.set('key2', 'value2');
      
      const keys = configManager.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toHaveLength(2);
    });

    test('should get all config entries', () => {
      configManager.set('key1', 'value1');
      configManager.set('key2', 'value2');
      
      const entries = configManager.entries();
      expect(entries).toContainEqual(['key1', 'value1']);
      expect(entries).toContainEqual(['key2', 'value2']);
    });

    test('should validate config successfully', () => {
      configManager.set('app_name', 'Valid App');
      configManager.set('max_file_size', 100);
      configManager.set('debug_mode', false);
      configManager.set('environment', 'development');
      
      const result = configManager.validateConfig(mockSections);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect validation errors', () => {
      configManager.set('app_name', ''); // Required field empty
      configManager.set('max_file_size', 2000); // Exceeds max
      configManager.set('environment', 'invalid'); // Invalid option
      
      const result = configManager.validateConfig(mockSections);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should enable and disable auto save', () => {
      jest.useFakeTimers();
      
      configManager.enableAutoSave(1000);
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
      
      configManager.disableAutoSave();
      expect(clearInterval).toHaveBeenCalled();
      
      jest.useRealTimers();
    });

    test('should subscribe to config changes', () => {
      const listener = jest.fn();
      const unsubscribe = configManager.subscribe(listener);
      
      configManager.set('test_key', 'test_value');
      
      expect(listener).toHaveBeenCalledWith(expect.any(Map));
      
      unsubscribe();
      configManager.set('another_key', 'another_value');
      
      expect(listener).toHaveBeenCalledTimes(1);
    });

    test('should export config as JSON', () => {
      configManager.set('key1', 'value1');
      configManager.set('key2', 42);
      
      const exported = configManager.exportConfig();
      const parsed = JSON.parse(exported);
      
      expect(parsed.key1).toBe('value1');
      expect(parsed.key2).toBe(42);
    });

    test('should import config from JSON', () => {
      const configJson = JSON.stringify({
        imported_key: 'imported_value',
        number_setting: 123
      });
      
      configManager.importConfig(configJson);
      
      expect(configManager.get('imported_key')).toBe('imported_value');
      expect(configManager.get('number_setting')).toBe(123);
    });

    test('should reset config to defaults', () => {
      configManager.set('custom_key', 'custom_value');
      configManager.resetToDefaults(mockSections);
      
      expect(configManager.get('app_name')).toBe('WoldVirtual3DlucIA');
      expect(configManager.get('max_file_size')).toBe(50);
      expect(configManager.get('debug_mode')).toBe(false);
      expect(configManager.get('environment')).toBe('development');
      expect(configManager.has('custom_key')).toBe(false);
    });
  });

  describe('useConfigManager Hook', () => {
    const TestComponent = () => {
      const { config, isLoaded, saveConfig, getConfig, setConfigValue } = useConfigManager('test_hook');
      
      return (
        <div>
          <div data-testid="loaded">{isLoaded.toString()}</div>
          <div data-testid="config-size">{config.size}</div>
          <button onClick={() => setConfigValue('test_key', 'test_value')}>
            Set Config
          </button>
          <button onClick={saveConfig}>Save Config</button>
          <div data-testid="test-value">{getConfig('test_key', 'default')}</div>
        </div>
      );
    };

    test('should initialize hook with default state', () => {
      render(<TestComponent />);
      
      expect(screen.getByTestId('loaded')).toHaveTextContent('false');
      expect(screen.getByTestId('config-size')).toHaveTextContent('0');
    });

    test('should set and get config values', async () => {
      render(<TestComponent />);
      
      const setButton = screen.getByText('Set Config');
      fireEvent.click(setButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('test-value')).toHaveTextContent('test_value');
      });
    });

    test('should save config when requested', async () => {
      render(<TestComponent />);
      
      const saveButton = screen.getByText('Save Config');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled();
      });
    });
  });

  describe('ConfigModule Component', () => {
    const mockOnConfigChange = jest.fn();
    const mockOnValidationChange = jest.fn();

    beforeEach(() => {
      mockOnConfigChange.mockClear();
      mockOnValidationChange.mockClear();
    });

    test('should render ConfigModule with sections', () => {
      render(
        <ConfigModule
          sections={mockSections}
          onConfigChange={mockOnConfigChange}
          onValidationChange={mockOnValidationChange}
        />
      );
      
      expect(screen.getByText('⚙️ Gestión de Configuración')).toBeInTheDocument();
      expect(screen.getByText('Configuración del Sistema')).toBeInTheDocument();
    });

    test('should show loading state initially', () => {
      render(<ConfigModule sections={mockSections} />);
      
      expect(screen.getByText('Cargando configuración...')).toBeInTheDocument();
    });

    test('should handle string input changes', async () => {
      render(<ConfigModule sections={mockSections} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Cargando configuración...')).not.toBeInTheDocument();
      });
      
      const input = screen.getByDisplayValue('WoldVirtual3DlucIA');
      fireEvent.change(input, { target: { value: 'New App Name' } });
      
      expect(input).toHaveValue('New App Name');
    });

    test('should handle number input changes', async () => {
      render(<ConfigModule sections={mockSections} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Cargando configuración...')).not.toBeInTheDocument();
      });
      
      const input = screen.getByDisplayValue('50');
      fireEvent.change(input, { target: { value: '75' } });
      
      expect(input).toHaveValue(75);
    });

    test('should handle boolean input changes', async () => {
      render(<ConfigModule sections={mockSections} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Cargando configuración...')).not.toBeInTheDocument();
      });
      
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      
      expect(checkbox).toBeChecked();
    });

    test('should handle select input changes', async () => {
      render(<ConfigModule sections={mockSections} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Cargando configuración...')).not.toBeInTheDocument();
      });
      
      const select = screen.getByDisplayValue('development');
      fireEvent.change(select, { target: { value: 'production' } });
      
      expect(select).toHaveValue('production');
    });

    test('should expand and collapse sections', async () => {
      render(<ConfigModule sections={mockSections} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Cargando configuración...')).not.toBeInTheDocument();
      });
      
      const sectionHeader = screen.getByText('Configuración del Sistema');
      fireEvent.click(sectionHeader);
      
      // Section should be expanded and show settings
      expect(screen.getByText('Nombre de la Aplicación')).toBeInTheDocument();
      
      // Click again to collapse
      fireEvent.click(sectionHeader);
    });

    test('should save configuration when save button is clicked', async () => {
      render(<ConfigModule sections={mockSections} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Cargando configuración...')).not.toBeInTheDocument();
      });
      
      const saveButton = screen.getByText('💾 Guardar Cambios');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled();
      });
    });

    test('should reset configuration when reset button is clicked', async () => {
      render(<ConfigModule sections={mockSections} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Cargando configuración...')).not.toBeInTheDocument();
      });
      
      const resetButton = screen.getByText('🔄 Resetear');
      fireEvent.click(resetButton);
      
      // Should reset to default values
      expect(screen.getByDisplayValue('WoldVirtual3DlucIA')).toBeInTheDocument();
    });

    test('should export configuration', async () => {
      render(<ConfigModule sections={mockSections} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Cargando configuración...')).not.toBeInTheDocument();
      });
      
      const exportButton = screen.getByText('📤 Exportar');
      fireEvent.click(exportButton);
      
      // Should trigger download
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    test('should import configuration from file', async () => {
      render(<ConfigModule sections={mockSections} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Cargando configuración...')).not.toBeInTheDocument();
      });
      
      const file = new File(['{"imported_key": "imported_value"}'], 'config.json', {
        type: 'application/json'
      });
      
      const importInput = screen.getByText('📥 Importar').parentElement?.querySelector('input');
      if (importInput) {
        fireEvent.change(importInput, { target: { files: [file] } });
      }
    });

    test('should show validation errors', async () => {
      const sectionsWithValidation = [
        {
          ...mockSections[0],
          settings: [
            {
              id: 'required_field',
              name: 'Campo Requerido',
              description: 'Campo que debe estar lleno',
              type: 'string' as const,
              value: '',
              defaultValue: '',
              required: true
            }
          ]
        }
      ];
      
      render(<ConfigModule sections={sectionsWithValidation} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Cargando configuración...')).not.toBeInTheDocument();
      });
      
      // Should show validation errors
      expect(screen.getByText('❌ Errores de Validación:')).toBeInTheDocument();
    });

    test('should show configuration statistics', async () => {
      render(<ConfigModule sections={mockSections} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Cargando configuración...')).not.toBeInTheDocument();
      });
      
      expect(screen.getByText(/📊 Configuraciones:/)).toBeInTheDocument();
      expect(screen.getByText(/✅ Válidas:/)).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete configuration workflow', async () => {
      const { rerender } = render(
        <ConfigModule
          sections={mockSections}
          onConfigChange={mockOnConfigChange}
          onValidationChange={mockOnValidationChange}
        />
      );
      
      await waitFor(() => {
        expect(screen.queryByText('Cargando configuración...')).not.toBeInTheDocument();
      });
      
      // Change a setting
      const appNameInput = screen.getByDisplayValue('WoldVirtual3DlucIA');
      fireEvent.change(appNameInput, { target: { value: 'Updated App' } });
      
      // Save configuration
      const saveButton = screen.getByText('💾 Guardar Cambios');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled();
      });
      
      // Verify callbacks were called
      expect(mockOnConfigChange).toHaveBeenCalled();
      expect(mockOnValidationChange).toHaveBeenCalled();
    });

    test('should handle configuration with all input types', async () => {
      const complexSections = [
        {
          id: 'complex',
          name: 'Configuración Compleja',
          description: 'Prueba con todos los tipos de entrada',
          category: 'system' as const,
          settings: [
            {
              id: 'string_setting',
              name: 'Configuración String',
              type: 'string' as const,
              value: 'test',
              defaultValue: 'test',
              required: false
            },
            {
              id: 'number_setting',
              name: 'Configuración Number',
              type: 'number' as const,
              value: 42,
              defaultValue: 42,
              required: false
            },
            {
              id: 'boolean_setting',
              name: 'Configuración Boolean',
              type: 'boolean' as const,
              value: false,
              defaultValue: false,
              required: false
            },
            {
              id: 'select_setting',
              name: 'Configuración Select',
              type: 'select' as const,
              value: 'option1',
              defaultValue: 'option1',
              required: false,
              validation: {
                options: ['option1', 'option2', 'option3']
              }
            },
            {
              id: 'json_setting',
              name: 'Configuración JSON',
              type: 'json' as const,
              value: '{"key": "value"}',
              defaultValue: '{}',
              required: false
            }
          ]
        }
      ];
      
      render(<ConfigModule sections={complexSections} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Cargando configuración...')).not.toBeInTheDocument();
      });
      
      // All input types should be rendered
      expect(screen.getByDisplayValue('test')).toBeInTheDocument();
      expect(screen.getByDisplayValue('42')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByDisplayValue('option1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('{"key": "value"}')).toBeInTheDocument();
    });
  });
}); 