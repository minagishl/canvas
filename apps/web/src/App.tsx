import React from 'react';
import { Canvas } from './components/Canvas';
import { AlertProvider } from './contexts/AlertContext';
import { CanvasProvider } from './contexts/CanvasContext';
import { Toolbar } from './components/Toolbar';

function App(): React.ReactElement {
  return (
    <AlertProvider>
      <CanvasProvider>
        <div className="relative h-screen w-screen select-none overflow-hidden bg-gray-50">
          <Canvas />
          <Toolbar />
        </div>
      </CanvasProvider>
    </AlertProvider>
  );
}

export default App;
