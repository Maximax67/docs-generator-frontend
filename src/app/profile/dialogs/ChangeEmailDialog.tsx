import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';
import { validateEmail } from '@/utils/validators';

type ChangeEmailDialogProps = {
  open: boolean;
  value: string;
  loading: boolean;
  onClose: () => void;
  onChange: (val: string) => void;
  onSubmit: () => void;
};

export default function ChangeEmailDialog({
  open,
  value,
  loading,
  onClose,
  onChange,
  onSubmit,
}: ChangeEmailDialogProps) {
  const emailError = value && !validateEmail(value);
  const isDisabled = loading || !value || !!emailError;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Зміна пошти</DialogTitle>
      <DialogContent>
        <TextField
          required
          autoFocus
          fullWidth
          label="Нова пошта"
          type="email"
          margin="normal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={!!emailError}
          helperText={emailError ? 'Не валідна електронна пошта' : ''}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose}>Скасувати</Button>
        <Button variant="contained" onClick={onSubmit} disabled={isDisabled}>
          Зберегти
        </Button>
      </DialogActions>
    </Dialog>
  );
}
