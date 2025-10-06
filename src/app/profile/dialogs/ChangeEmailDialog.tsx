import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';

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
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Зміна пошти</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Нова пошта"
          type="email"
          margin="normal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose}>Скасувати</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading || !value}>
          Зберегти
        </Button>
      </DialogActions>
    </Dialog>
  );
}
