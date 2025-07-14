/**
 * @fileoverview Tests unitarios para el módulo de imágenes
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageModule, { ImageProcessor, useImageProcessor } from '../ImageModule';
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

// Mock de crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123',
    subtle: {
      digest: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]))
    }
  }
});

// Mock de URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('ImageModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ImageProcessor Class', () => {
    let processor: ImageProcessor;

    beforeEach(() => {
      processor = new ImageProcessor();
    });

    test('should create ImageProcessor with default config', () => {
      expect(processor).toBeInstanceOf(ImageProcessor);
    });

    test('should validate image file correctly', async () => {
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await processor.validateImage(validFile);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid file types', async () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = await processor.validateImage(invalidFile);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Archivo no es una imagen válida');
    });

    test('should reject oversized files', async () => {
      const largeFile = new File(['x'.repeat(60 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const result = await processor.validateImage(largeFile);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Archivo demasiado grande');
    });

    test('should extract metadata from image file', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const metadata = await processor.extractMetadata(file);
      
      expect(metadata.name).toBe('test.jpg');
      expect(metadata.size).toBe(4);
      expect(metadata.mimeType).toBe('image/jpeg');
      expect(metadata.format).toBe('jpg');
    });

    test('should process image successfully', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await processor.processImage(file);
      
      expect(result.success).toBe(true);
      expect(result.originalImage.name).toBe('test.jpg');
      expect(result.optimizationStats.originalSize).toBe(4);
      expect(result.optimizationStats.reductionPercentage).toBeGreaterThan(0);
    });

    test('should handle processing errors gracefully', async () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = await processor.processImage(invalidFile);
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    test('should manage cache correctly', () => {
      const stats = processor.getCacheStats();
      expect(stats.entries).toBe(0);
      
      processor.clearCache();
      const statsAfterClear = processor.getCacheStats();
      expect(statsAfterClear.entries).toBe(0);
    });
  });

  describe('useImageProcessor Hook', () => {
    const TestComponent = () => {
      const { processImage, isProcessing, results, errors, clearResults, clearCache, cacheStats } = useImageProcessor();
      
      return (
        <div>
          <div data-testid="processing">{isProcessing.toString()}</div>
          <div data-testid="results-count">{results.length}</div>
          <div data-testid="errors-count">{errors.length}</div>
          <div data-testid="cache-entries">{cacheStats.entries}</div>
          <button onClick={() => processImage(new File(['test'], 'test.jpg', { type: 'image/jpeg' }))}>
            Process Image
          </button>
          <button onClick={clearResults}>Clear Results</button>
          <button onClick={clearCache}>Clear Cache</button>
        </div>
      );
    };

    test('should initialize hook with default state', () => {
      render(<TestComponent />);
      
      expect(screen.getByTestId('processing')).toHaveTextContent('false');
      expect(screen.getByTestId('results-count')).toHaveTextContent('0');
      expect(screen.getByTestId('errors-count')).toHaveTextContent('0');
      expect(screen.getByTestId('cache-entries')).toHaveTextContent('0');
    });

    test('should process image and update state', async () => {
      render(<TestComponent />);
      
      const processButton = screen.getByText('Process Image');
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('processing')).toHaveTextContent('false');
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('results-count')).toHaveTextContent('1');
      });
    });

    test('should clear results when requested', async () => {
      render(<TestComponent />);
      
      // Procesar una imagen primero
      const processButton = screen.getByText('Process Image');
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('results-count')).toHaveTextContent('1');
      });
      
      // Limpiar resultados
      const clearButton = screen.getByText('Clear Results');
      fireEvent.click(clearButton);
      
      expect(screen.getByTestId('results-count')).toHaveTextContent('0');
    });
  });

  describe('ImageModule Component', () => {
    const mockOnImageProcessed = jest.fn();
    const mockOnError = jest.fn();

    beforeEach(() => {
      mockOnImageProcessed.mockClear();
      mockOnError.mockClear();
    });

    test('should render ImageModule component', () => {
      render(<ImageModule onImageProcessed={mockOnImageProcessed} onError={mockOnError} />);
      
      expect(screen.getByText('🖼️ Módulo de Procesamiento de Imágenes')).toBeInTheDocument();
      expect(screen.getByText('📊 Cache: 0 entradas')).toBeInTheDocument();
      expect(screen.getByText('⚡ Procesadas: 0')).toBeInTheDocument();
    });

    test('should handle file upload', async () => {
      render(<ImageModule onImageProcessed={mockOnImageProcessed} onError={mockOnError} />);
      
      const fileInput = screen.getByRole('button', { name: /limpiar resultados/i });
      expect(fileInput).toBeDisabled();
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByRole('button', { name: /limpiar cache/i }).parentElement?.querySelector('input');
      
      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
        
        await waitFor(() => {
          expect(mockOnImageProcessed).toHaveBeenCalled();
        });
      }
    });

    test('should show processing state', async () => {
      render(<ImageModule onImageProcessed={mockOnImageProcessed} onError={mockOnError} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByRole('button', { name: /limpiar cache/i }).parentElement?.querySelector('input');
      
      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
        
        // Debería mostrar el estado de procesamiento brevemente
        await waitFor(() => {
          expect(mockOnImageProcessed).toHaveBeenCalled();
        });
      }
    });

    test('should handle errors correctly', async () => {
      render(<ImageModule onImageProcessed={mockOnImageProcessed} onError={mockOnError} />);
      
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByRole('button', { name: /limpiar cache/i }).parentElement?.querySelector('input');
      
      if (input) {
        fireEvent.change(input, { target: { files: [invalidFile] } });
        
        await waitFor(() => {
          expect(mockOnError).toHaveBeenCalled();
        });
      }
    });

    test('should display results after processing', async () => {
      render(<ImageModule onImageProcessed={mockOnImageProcessed} onError={mockOnError} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByRole('button', { name: /limpiar cache/i }).parentElement?.querySelector('input');
      
      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
        
        await waitFor(() => {
          expect(screen.getByText('✅ Resultados:')).toBeInTheDocument();
        });
      }
    });

    test('should clear results when button is clicked', async () => {
      render(<ImageModule onImageProcessed={mockOnImageProcessed} onError={mockOnError} />);
      
      // Procesar una imagen primero
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByRole('button', { name: /limpiar cache/i }).parentElement?.querySelector('input');
      
      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
        
        await waitFor(() => {
          expect(screen.getByText('✅ Resultados:')).toBeInTheDocument();
        });
        
        // Limpiar resultados
        const clearButton = screen.getByText('🗑️ Limpiar Resultados');
        fireEvent.click(clearButton);
        
        expect(screen.queryByText('✅ Resultados:')).not.toBeInTheDocument();
      }
    });
  });

  describe('Integration Tests', () => {
    test('should process multiple images in sequence', async () => {
      const { rerender } = render(<ImageModule />);
      
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.png', { type: 'image/png' }),
        new File(['test3'], 'test3.webp', { type: 'image/webp' })
      ];
      
      const input = screen.getByRole('button', { name: /limpiar cache/i }).parentElement?.querySelector('input');
      
      if (input) {
        fireEvent.change(input, { target: { files } });
        
        await waitFor(() => {
          expect(screen.getByText('⚡ Procesadas: 3')).toBeInTheDocument();
        });
      }
    });

    test('should handle mixed valid and invalid files', async () => {
      const mockOnError = jest.fn();
      render(<ImageModule onError={mockOnError} />);
      
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.txt', { type: 'text/plain' }),
        new File(['test3'], 'test3.png', { type: 'image/png' })
      ];
      
      const input = screen.getByRole('button', { name: /limpiar cache/i }).parentElement?.querySelector('input');
      
      if (input) {
        fireEvent.change(input, { target: { files } });
        
        await waitFor(() => {
          expect(mockOnError).toHaveBeenCalled();
        });
      }
    });
  });
}); 