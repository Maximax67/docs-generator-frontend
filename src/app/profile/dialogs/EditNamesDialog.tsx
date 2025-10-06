import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';

type EditNamesDialogProps = {
  open: boolean;
  loading: boolean;
  firstName: string;
  lastName: string;
  onChangeFirst: (val: string) => void;
  onChangeLast: (val: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function EditNamesDialog({
  open,
  loading,
  firstName,
  lastName,
  onChangeFirst,
  onChangeLast,
  onClose,
  onSubmit,
}: EditNamesDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Оновити ім&apos;я</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Ім'я"
          margin="normal"
          value={firstName}
          onChange={(e) => onChangeFirst(e.target.value)}
        />
        <TextField
          fullWidth
          label="Прізвище"
          margin="normal"
          value={lastName}
          onChange={(e) => onChangeLast(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose}>Скасувати</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading || !firstName}>
          Зберегти
        </Button>
      </DialogActions>
    </Dialog>
  );
}
