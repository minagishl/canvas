import React, { createContext, useContext, useState } from 'react';

interface AIContextType {
  showAIInput: boolean;
  setShowAIInput: React.Dispatch<React.SetStateAction<boolean>>;
}

const AIContext = createContext<AIContextType | null>(null);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [showAIInput, setShowAIInput] = useState(false);

  return (
    <AIContext.Provider
      value={{
        showAIInput,
        setShowAIInput,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAIContext(): AIContextType {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAIContext must be used within a AIProvider');
  }
  return context;
}
