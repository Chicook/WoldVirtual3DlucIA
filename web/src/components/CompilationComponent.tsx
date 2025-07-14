import React from 'react';

/**
 * CompilationComponent - Componente para mostrar resultados de compilación
 * Visualiza errores, advertencias y estado de la última compilación
 */
export interface CompilationResult {
  success: boolean;
  errors: CompilationError[];
  warnings: CompilationWarning[];
  outputPath: string;
  buildTime: number;
  bundleSize: number;
}

export interface CompilationError {
  code: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
}

export interface CompilationWarning {
  code: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
}

const defaultResult: CompilationResult = {
  success: true,
  errors: [],
  warnings: [
    { code: 'W001', message: 'Uso de variable no utilizada', file: 'App.tsx', line: 42, column: 13 },
  ],
  outputPath: 'dist/',
  buildTime: 2100,
  bundleSize: 2.5,
};

export const CompilationComponent: React.FC = () => {
  const [result, setResult] = React.useState<CompilationResult>(defaultResult);
  const [showDetails, setShowDetails] = React.useState(false);

  // Simula actualización de resultados de compilación
  const simulateCompilation = async () => {
    setShowDetails(false);
    setResult({ ...result, success: false, errors: [
      { code: 'E001', message: 'Error de sintaxis en index.tsx', file: 'index.tsx', line: 10, column: 5 },
    ] });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setResult(defaultResult);
  };

  return (
    <div className="compilation-component">
      <h3>Compilation Results</h3>
      <div>
        <button onClick={simulateCompilation}>Simular Compilación</button>
        <button onClick={() => setShowDetails((v) => !v)}>
          {showDetails ? 'Ocultar Detalles' : 'Ver Detalles'}
        </button>
      </div>
      <div>
        <strong>Estado:</strong> {result.success ? '✅ Éxito' : '❌ Fallo'}<br />
        <strong>Output:</strong> {result.outputPath}<br />
        <strong>Build Time:</strong> {result.buildTime} ms<br />
        <strong>Bundle Size:</strong> {result.bundleSize} MB
      </div>
      {showDetails && (
        <div className="compilation-details">
          <h4>Errores</h4>
          {result.errors.length === 0 ? <div>Sin errores</div> : (
            <ul>
              {result.errors.map((err, idx) => (
                <li key={idx} style={{ color: 'red' }}>
                  [{err.code}] {err.message} ({err.file}:{err.line}:{err.column})
                </li>
              ))}
            </ul>
          )}
          <h4>Advertencias</h4>
          {result.warnings.length === 0 ? <div>Sin advertencias</div> : (
            <ul>
              {result.warnings.map((warn, idx) => (
                <li key={idx} style={{ color: 'orange' }}>
                  [{warn.code}] {warn.message} ({warn.file}:{warn.line}:{warn.column})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CompilationComponent; 