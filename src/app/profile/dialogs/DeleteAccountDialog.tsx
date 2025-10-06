import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';

type DeleteAccountDialogProps = {
  open: boolean;
  email: string;
  confirmValue: string;
  error: string;
  onChangeConfirm: (val: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function DeleteAccountDialog({
  open,
  email,
  confirmValue,
  error,
  onChangeConfirm,
  onClose,
  onSubmit,
}: DeleteAccountDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
      <DialogTitle>Підтвердження видалення акаунта</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Для видалення введіть &quot;{email}&quot;:
        </Typography>

        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          value={confirmValue}
          onChange={(e) => onChangeConfirm(e.target.value)}
        />

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose}>Скасувати</Button>
        <Button
          color="error"
          variant="contained"
          disabled={confirmValue !== email}
          onClick={onSubmit}
        >
          Видалити
        </Button>
      </DialogActions>
    </Dialog>
  );
}
