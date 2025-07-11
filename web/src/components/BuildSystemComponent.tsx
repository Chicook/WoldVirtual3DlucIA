import React from 'react';

/**
 * BuildSystemComponent - Componente para gestión y visualización de scripts de build
 * Permite ejecutar scripts, ver logs y resultados del proceso de build
 */
export interface BuildScript {
  name: string;
  command: string;
  description: string;
}

export interface BuildLog {
  timestamp: number;
  message: string;
  type: 'info' | 'warning' | 'error';
}

const defaultScripts: BuildScript[] = [
  { name: 'Build Web', command: 'npm run build', description: 'Compila el frontend web' },
  { name: 'Lint', command: 'npm run lint', description: 'Ejecuta linter sobre el código fuente' },
  { name: 'Type Check', command: 'npm run type-check', description: 'Verifica los tipos TypeScript' },
];

export const BuildSystemComponent: React.FC = () => {
  const [scripts] = React.useState<BuildScript[]>(defaultScripts);
  const [selectedScript, setSelectedScript] = React.useState<BuildScript | null>(null);
  const [logs, setLogs] = React.useState<BuildLog[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);

  // Simula la ejecución de un script de build
  const runScript = async (script: BuildScript) => {
    setIsRunning(true);
    setSelectedScript(script);
    setLogs((prev) => [
      ...prev,
      { timestamp: Date.now(), message: `Ejecutando: ${script.command}`, type: 'info' },
    ]);
    try {
      // Simular logs de ejecución
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLogs((prev) => [
        ...prev,
        { timestamp: Date.now(), message: `Compilando...`, type: 'info' },
      ]);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLogs((prev) => [
        ...prev,
        { timestamp: Date.now(), message: `Build finalizado correctamente.`, type: 'info' },
      ]);
    } catch (e: any) {
      setLogs((prev) => [
        ...prev,
        { timestamp: Date.now(), message: `Error: ${e.message}`, type: 'error' },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="build-system-component">
      <h3>Build System</h3>
      <ul>
        {scripts.map((script) => (
          <li key={script.name}>
            <button onClick={() => runScript(script)} disabled={isRunning}>
              {script.name}
            </button>
            <span> - {script.description}</span>
          </li>
        ))}
      </ul>
      <div className="build-logs">
        <h4>Logs</h4>
        <div style={{ maxHeight: 150, overflowY: 'auto', background: '#222', color: '#fff', padding: 8 }}>
          {logs.map((log, idx) => (
            <div key={idx} style={{ color: log.type === 'error' ? 'red' : log.type === 'warning' ? 'orange' : '#fff' }}>
              [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
            </div>
          ))}
        </div>
      </div>
      {selectedScript && (
        <div className="selected-script">
          <strong>Último script ejecutado:</strong> {selectedScript.name}
        </div>
      )}
    </div>
  );
};

export default BuildSystemComponent; 