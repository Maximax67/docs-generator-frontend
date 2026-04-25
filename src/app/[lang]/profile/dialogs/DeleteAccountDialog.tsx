import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';
import { useDictionary } from '@/contexts/LangContext';

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
  const dict = useDictionary();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
      <DialogTitle>{dict.profile.dialogs.deleteAccount.title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {dict.profile.dialogs.deleteAccount.description} "{email}":
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
        <Button onClick={onClose}>{dict.profile.dialogs.deleteAccount.cancelButton}</Button>
        <Button
          color="error"
          variant="contained"
          disabled={confirmValue !== email}
          onClick={onSubmit}
        >
          {dict.profile.dialogs.deleteAccount.confirmButton}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
