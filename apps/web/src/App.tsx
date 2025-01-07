import React from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { Modal } from './components/Modal';
import { AlertProvider } from './contexts/AlertContext';
import { CanvasProvider } from './contexts/CanvasContext';

function App(): React.ReactElement {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <AlertProvider>
      <CanvasProvider>
        <div className="relative h-screen w-screen select-none overflow-hidden bg-gray-50">
          <Canvas />
          <Toolbar />
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
      </CanvasProvider>
    </AlertProvider>
  );
}

export default App;
