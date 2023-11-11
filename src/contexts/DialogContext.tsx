import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

interface DialogOptions {
  title: string;
  description: ReactNode;
  buttons: {
    text: string;
    onClick: () => void;
  }[];
}

interface DialogContextType {
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions | null>(null);

  const showDialog = useCallback((options: DialogOptions) => {
    setOptions(options);
    setDialogOpen(true);
  }, []);

  const hideDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const handleClose = () => {
    setDialogOpen(false);
    // Optionally reset dialog options to null if needed
  };

  const value = { showDialog, hideDialog };

  return (
    <DialogContext.Provider value={value}>
      {children}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        {options && (
          <>
            <DialogTitle id="dialog-title">{options.title}</DialogTitle>
            <DialogContent>
              <DialogContentText id="dialog-description">
                {options.description}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              {options.buttons.map((button, index) => (
                <Button key={index} onClick={button.onClick}>
                  {button.text}
                </Button>
              ))}
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};