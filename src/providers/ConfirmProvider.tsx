'use client';

import { FC, ReactNode, createContext, useContext, useState, useCallback } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AlertColor } from '@mui/material';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: AlertColor;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = (): ConfirmContextType => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }

  return context;
};

interface ConfirmProviderProps {
  children: ReactNode;
}

export const ConfirmProvider: FC<ConfirmProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    message: '',
  });
  const [resolveCallback, setResolveCallback] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolveCallback(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    if (resolveCallback) {
      resolveCallback(true);
      setResolveCallback(null);
    }
  }, [resolveCallback]);

  const handleCancel = useCallback(() => {
    setOpen(false);
    if (resolveCallback) {
      resolveCallback(false);
      setResolveCallback(null);
    }
  }, [resolveCallback]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        open={open}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        severity={options.severity}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
};
