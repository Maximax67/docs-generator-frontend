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
import { useDictionary } from '@/contexts/LangContext';

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
  const dict = useDictionary();
  const oldPasswordError = oldPassword && !validatePassword(oldPassword);
  const newPasswordError = newPassword && !validatePassword(newPassword);
  const isDisabled =
    loading || !oldPassword || !newPassword || !!oldPasswordError || !!newPasswordError;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{dict.profile.dialogs.changePassword.title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label={dict.profile.dialogs.changePassword.oldPassword}
          type={showOld ? 'text' : 'password'}
          value={oldPassword}
          onChange={(e) => onChangeOld(e.target.value)}
          required
          fullWidth
          size="medium"
          margin="dense"
          error={!!oldPasswordError}
          helperText={oldPasswordError ? dict.profile.dialogs.changePassword.invalidPassword : ''}
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
          label={dict.profile.dialogs.changePassword.newPassword}
          type={showNew ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => onChangeNew(e.target.value)}
          required
          fullWidth
          size="medium"
          margin="dense"
          error={!!newPasswordError}
          helperText={newPasswordError ? dict.profile.dialogs.changePassword.invalidPassword : ''}
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
        <Button onClick={onClose}>{dict.profile.dialogs.changePassword.cancel}</Button>
        <Button variant="contained" onClick={onSubmit} disabled={isDisabled}>
          {dict.profile.dialogs.changePassword.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
