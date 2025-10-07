import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { validatePassword } from '@/utils/validators';

type ChangePasswordDialogProps = {
  open: boolean;
  loading: boolean;
  oldPassword: string;
  newPassword: string;
  showOld: boolean;
  showNew: boolean;
  onClose: () => void;
  onChangeOld: (val: string) => void;
  onChangeNew: (val: string) => void;
  onToggleOld: () => void;
  onToggleNew: () => void;
  onSubmit: () => void;
};

export default function ChangePasswordDialog({
  open,
  loading,
  oldPassword,
  newPassword,
  showOld,
  showNew,
  onClose,
  onChangeOld,
  onChangeNew,
  onToggleOld,
  onToggleNew,
  onSubmit,
}: ChangePasswordDialogProps) {
  const oldPasswordError = oldPassword && !validatePassword(oldPassword);
  const newPasswordError = newPassword && !validatePassword(newPassword);
  const isDisabled =
    loading ||
    !oldPassword ||
    !newPassword ||
    !!oldPasswordError ||
    !!newPasswordError;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Зміна пароля</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label="Старий пароль"
          type={showOld ? 'text' : 'password'}
          value={oldPassword}
          onChange={(e) => onChangeOld(e.target.value)}
          required
          fullWidth
          size="medium"
          margin="dense"
          error={!!oldPasswordError}
          helperText={oldPasswordError ? 'Пароль має бути від 8 до 32 символів' : ''}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={onToggleOld}
                    edge="end"
                  >
                    {showOld ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          label="Новий пароль"
          type={showNew ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => onChangeNew(e.target.value)}
          required
          fullWidth
          size="medium"
          margin="dense"
          error={!!newPasswordError}
          helperText={newPasswordError ? 'Пароль має бути від 8 до 32 символів' : ''}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={onToggleNew}
                    edge="end"
                  >
                    {showNew ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
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
