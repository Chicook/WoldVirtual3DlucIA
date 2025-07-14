import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import { MetaversoProvider } from './contexts/MetaversoContext';
import { Web3Provider } from './contexts/Web3Context';
import ErrorFallback from './components/ErrorFallback';

// Lazy loading de componentes principales
const MetaversoApp = lazy(() => import('./components/MetaversoApp'));

const App: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Web3Provider>
        <MetaversoProvider>
          <div className="metaverso-app">
            <Suspense fallback={<div>Loading...</div>}>
              <MetaversoApp />
            </Suspense>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1a1a2e',
                  color: '#fff',
                  border: '1px solid #3b82f6'
                }
              }}
            />
          </div>
        </MetaversoProvider>
      </Web3Provider>
    </ErrorBoundary>
  );
};

export default App;
