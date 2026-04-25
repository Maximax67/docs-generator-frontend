import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';
import { validateName } from '@/utils/validators';
import { useDictionary } from '@/contexts/LangContext';

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
  const dict = useDictionary();
  const firstNameError = firstName && !validateName(firstName);
  const lastNameError = lastName && !validateName(lastName);
  const isDisabled = loading || !firstName || !!firstNameError || !!lastNameError;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{dict.profile.dialogs.editNames.title}</DialogTitle>
      <DialogContent>
        <TextField
          required
          autoFocus
          fullWidth
          label={dict.auth.firstName}
          margin="normal"
          value={firstName}
          onChange={(e) => onChangeFirst(e.target.value)}
          error={!!firstNameError}
          helperText={firstNameError ? dict.auth.invalidFirstName : ''}
        />
        <TextField
          fullWidth
          label={dict.auth.lastName}
          margin="normal"
          value={lastName}
          onChange={(e) => onChangeLast(e.target.value)}
          error={!!lastNameError}
          helperText={lastNameError ? dict.auth.invalidLastName : ''}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose}>{dict.profile.dialogs.editNames.cancel}</Button>
        <Button variant="contained" onClick={onSubmit} disabled={isDisabled}>
          {dict.profile.dialogs.editNames.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
