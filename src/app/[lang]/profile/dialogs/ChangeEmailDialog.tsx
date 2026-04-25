import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';
import { validateEmail } from '@/utils/validators';
import { useDictionary } from '@/contexts/LangContext';

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
  const dict = useDictionary();
  const emailError = value && !validateEmail(value);
  const isDisabled = loading || !value || !!emailError;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{dict.profile.dialogs.changeEmail.title}</DialogTitle>
      <DialogContent>
        <TextField
          required
          autoFocus
          fullWidth
          label={dict.profile.dialogs.changeEmail.newEmail}
          type="email"
          margin="normal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={!!emailError}
          helperText={emailError ? dict.profile.dialogs.changeEmail.invalidEmail : ''}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose}>{dict.profile.dialogs.changeEmail.cancel}</Button>
        <Button variant="contained" onClick={onSubmit} disabled={isDisabled}>
          {dict.profile.dialogs.changeEmail.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
