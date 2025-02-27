import React from 'react';
import { Canvas } from '~/components/Canvas';
import { Toolbar } from '~/components/Toolbar';
import { ReleaseNotes } from '~/components/ReleaseNotes';

// Contexts
import { AIProvider } from './contexts/AIContext';
import { AlertProvider } from '~/contexts/AlertContext';
import { CanvasProvider } from '~/contexts/CanvasContext';
import { HistoryProvider } from '~/contexts/HistoryContext';

function App(): React.ReactElement {
  return (
    <div>
      <AlertProvider>
        <HistoryProvider>
          <CanvasProvider>
            <AIProvider>
              <div className="relative h-dvh w-dvw overflow-hidden bg-gray-50 select-none">
                <Canvas />
                <Toolbar />
                <ReleaseNotes />
              </div>
            </AIProvider>
          </CanvasProvider>
        </HistoryProvider>
      </AlertProvider>
    </div>
  );
}

export default App;
