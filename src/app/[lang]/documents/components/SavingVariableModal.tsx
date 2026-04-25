import { FC, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { VariableInfo } from '@/types/variables';
import { variablesApi } from '@/lib/api';
import { useNotify } from '@/providers/NotificationProvider';
import { toErrorMessage } from '@/utils/errors-messages';

interface SavingVariableModalProps {
  open: boolean;
  scope: string | null;
  existingVariables: VariableInfo[];
  onClose: () => void;
  onAddVariable: (variable: VariableInfo) => void;
}

export const SavingVariableModal: FC<SavingVariableModalProps> = ({
  open,
  scope,
  existingVariables,
  onClose,
  onAddVariable,
}) => {
  const notify = useNotify();
  const [variableName, setVariableName] = useState('');
  const [loading, setLoading] = useState(false);

  const [blockingError, setBlockingError] = useState<string>('');
  const [parentWarning, setParentWarning] = useState<string>('');

  useEffect(() => {
    if (open) {
      setVariableName('');
      setBlockingError('');
      setParentWarning('');
    }
  }, [open]);

  const validate = (name: string) => {
    const trimmed = name.trim();
    setBlockingError('');
    setParentWarning('');

    if (!trimmed) {
      return;
    }

    // Already exists as a savable (value === null) variable in the same scope —
    // this is a pure duplicate; we treat it the same as the constant block.
    const duplicateInScope = existingVariables.find(
      (v) => v.variable === trimmed && v.scope === scope && v.value === null,
    );
    if (duplicateInScope) {
      setBlockingError('Змінна з такою назвою вже існує в цьому scope.');
      return;
    }

    // Constant (value !== null) in the CURRENT scope — hard block.
    const constantInScope = existingVariables.find(
      (v) => v.variable === trimmed && v.scope === scope && v.value !== null,
    );
    if (constantInScope) {
      setBlockingError('Ця змінна є константою в поточному scope.');
      return;
    }

    // Constant in a DIFFERENT (parent / global) scope — soft warning.
    const constantElsewhere = existingVariables.find(
      (v) => v.variable === trimmed && v.scope !== scope && v.value !== null,
    );
    if (constantElsewhere) {
      const location = constantElsewhere.scope ? 'вищому scope' : 'глобальному scope';
      setParentWarning(
        `Ця змінна є константою в ${location}. ` +
          'Додавання savable-змінної перевизначить її для поточного scope.',
      );
    }
  };

  const handleNameChange = (name: string) => {
    setVariableName(name);
    validate(name);
  };

  const handleSave = async () => {
    const trimmed = variableName.trim();
    if (!trimmed) {
      notify('Назва змінної не може бути порожньою', 'error');
      return;
    }

    if (blockingError) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        variable: trimmed,
        scope: scope,
        value: null,
        validation_schema: null,
        required: false,
        allow_save: true,
      };

      const newVariable = await variablesApi.createVariable(payload);
      notify('Змінну для збереження успішно створено');
      onAddVariable(newVariable);
    } catch (error) {
      notify(toErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || !variableName.trim() || !!blockingError;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Додати змінну для збереження</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {blockingError && <Alert severity="error">{blockingError}</Alert>}
          {!blockingError && parentWarning && <Alert severity="warning">{parentWarning}</Alert>}

          <TextField
            fullWidth
            label="Назва змінної"
            value={variableName}
            onChange={(e) => handleNameChange(e.target.value)}
            disabled={loading}
            autoFocus
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Скасувати
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isSubmitDisabled}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Збереження...' : 'Додати'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
