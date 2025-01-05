import React, { createContext, useContext, useState } from 'react';
import { CanvasObject, ToolType, Point } from '../types/canvas';

interface CanvasContextType {
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  offset: Point;
  setOffset: React.Dispatch<React.SetStateAction<Point>>;
  objects: CanvasObject[];
  addObject: (object: CanvasObject) => void;
  selectedTool: ToolType;
  setSelectedTool: React.Dispatch<React.SetStateAction<ToolType>>;
  setObjects: React.Dispatch<React.SetStateAction<CanvasObject[]>>;
  selectedObjectId: string | null;
  setSelectedObjectId: React.Dispatch<React.SetStateAction<string | null>>;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolType>('select');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const addObject = (object: CanvasObject) => {
    setObjects((prev) => [...prev, object]);
  };

  return (
    <CanvasContext.Provider
      value={{
        scale,
        setScale,
        offset,
        setOffset,
        objects,
        addObject,
        selectedTool,
        setSelectedTool,
        setObjects,
        selectedObjectId,
        setSelectedObjectId,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useCanvasContext(): CanvasContextType {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvasContext must be used within a CanvasProvider');
  }
  return context;
}
