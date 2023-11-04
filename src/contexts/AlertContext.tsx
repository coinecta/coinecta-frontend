import React, { createContext, useContext, useState, FC, ReactNode } from 'react';

interface Alert {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: ReactNode;
}

interface AlertContextType {
  alerts: Alert[];
  addAlert: (type: Alert['type'], message: Alert['message']) => void;
  removeAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = (type: Alert['type'], message: Alert['message']) => {
    const id = Date.now().toString(); // Using timestamp as unique ID for simplicity
    setAlerts((prevAlerts) => [...prevAlerts, { id, type, message }]);
    setTimeout(() => removeAlert(id), 10000);
  };

  const removeAlert = (id: string) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  };

  const value = { alerts, addAlert, removeAlert };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within a AlertProvider');
  }
  return context;
};
