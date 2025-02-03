import React from 'react';
import { Canvas } from '~/components/Canvas';
import { Toolbar } from '~/components/Toolbar';

// Contexts
import { AIProvider } from './contexts/AIContext';
import { AlertProvider } from '~/contexts/AlertContext';
import { CanvasProvider } from '~/contexts/CanvasContext';
import { HistoryProvider } from '~/contexts/HistoryContext';

function App(): React.ReactElement {
  return (
    <AlertProvider>
      <HistoryProvider>
        <CanvasProvider>
          <AIProvider>
            <div className="relative h-screen w-screen overflow-hidden bg-gray-50 select-none">
              <Canvas />
              <Toolbar />
            </div>
          </AIProvider>
        </CanvasProvider>
      </HistoryProvider>
    </AlertProvider>
  );
}

export default App;
