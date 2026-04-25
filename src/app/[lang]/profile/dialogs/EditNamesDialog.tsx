import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';
import { validateName } from '@/utils/validators';

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
  const firstNameError = firstName && !validateName(firstName);
  const lastNameError = lastName && !validateName(lastName);
  const isDisabled = loading || !firstName || !!firstNameError || !!lastNameError;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Оновити ім&apos;я</DialogTitle>
      <DialogContent>
        <TextField
          required
          autoFocus
          fullWidth
          label="Ім'я"
          margin="normal"
          value={firstName}
          onChange={(e) => onChangeFirst(e.target.value)}
          error={!!firstNameError}
          helperText={firstNameError ? "Не валідне ім'я" : ''}
        />
        <TextField
          fullWidth
          label="Прізвище"
          margin="normal"
          value={lastName}
          onChange={(e) => onChangeLast(e.target.value)}
          error={!!lastNameError}
          helperText={lastNameError ? 'Не валідне прізвище' : ''}
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
