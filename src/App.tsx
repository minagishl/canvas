import React from "react";
import { Canvas } from "./components/Canvas";
import { Toolbar } from "./components/Toolbar";
import { Modal } from "./components/Modal";
import { CanvasProvider } from "./contexts/CanvasContext";

function App(): React.ReactElement {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <CanvasProvider>
      <div className="w-screen h-screen bg-gray-50 overflow-hidden relative select-none">
        <Canvas />
        <Toolbar />
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </CanvasProvider>
  );
}

export default App;
