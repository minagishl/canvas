import React, { createContext, useContext, useState } from 'react';

interface AlertContextType {
  alert: string;
  setAlert: React.Dispatch<React.SetStateAction<string>>;
}

const AlertContext = createContext<AlertContextType | null>(null);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [alert, setAlert] = useState('');

  return (
    <AlertContext.Provider
      value={{
        alert,
        setAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAlertContext(): AlertContextType {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlertContext must be used within a AlertProvider');
  }
  return context;
}
