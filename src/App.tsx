import React from "react";
import { Canvas } from "./components/Canvas";
import { Toolbar } from "./components/Toolbar";
import { CanvasProvider } from "./contexts/CanvasContext";

function App(): React.ReactElement {
  return (
    <CanvasProvider>
      <div className="w-screen h-screen bg-gray-50 overflow-hidden relative">
        <Canvas />
        <Toolbar />
      </div>
    </CanvasProvider>
  );
}

export default App;
