import { useState, forwardRef, useImperativeHandle } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { JSONValue } from '@/types/json';
import { useDictionary } from '@/contexts/LangContext';

const formatValue = (value: JSONValue, yes: string, no: string) => {
  if (value === null) {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? yes : no;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
};

export interface FullValueDialogRef {
  open: (value: JSONValue) => void;
  close: () => void;
}

export const FullValueDialog = forwardRef<FullValueDialogRef>((_, ref) => {
  const [value, setValue] = useState<JSONValue | undefined>(undefined);
  const dict = useDictionary();
  const handleClose = () => setValue(undefined);

  useImperativeHandle(ref, () => ({
    open: (value: JSONValue) => setValue(value),
    close: handleClose,
  }));

  return (
    <Dialog open={typeof value !== 'undefined'} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{dict.fullValueDialog.title}</DialogTitle>
      <DialogContent>
        <Box
          component="pre"
          sx={{
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
          }}
        >
          {typeof value !== 'undefined' && formatValue(value, dict.common.yes, dict.common.no)}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{dict.fullValueDialog.close}</Button>
      </DialogActions>
    </Dialog>
  );
});

FullValueDialog.displayName = 'FullValueDialog';
