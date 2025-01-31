import React, { createContext, useContext, useState } from 'react';
import { type HistoryState } from '~/types/history';

interface HistoryContextType {
  history: HistoryState[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryState[]>>;
  currentHistoryIndex: number;
  setCurrentHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
}

const HistoryContext = createContext<HistoryContextType | null>(null);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(0);

  return (
    <HistoryContext.Provider
      value={{
        history,
        setHistory,
        currentHistoryIndex,
        setCurrentHistoryIndex,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useHistoryContext(): HistoryContextType {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistoryContext must be used within a HistoryProvider');
  }
  return context;
}
