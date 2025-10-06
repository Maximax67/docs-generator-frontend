import { FC, useState, useEffect } from 'react';
import { TextField, MenuItem, Box, IconButton } from '@mui/material';
import { Save as SaveIcon, Delete as DeleteIcon, Replay as ReplayIcon } from '@mui/icons-material';
import { VariableType, DocumentVariable } from '@/types/variables';
import { useUserStore } from '@/store/user';
import { validateVariableValue } from '@/lib/validation';

interface VariableInputProps {
  variable: DocumentVariable;
  value: string;
  required?: boolean;
  with_label?: boolean;
  with_example?: boolean;
  view_only?: boolean;
  small?: boolean;
  error?: string;
  onChange?: (value: string) => void;
  onError?: (error: string | undefined) => void;
  savedValue?: string;
  onSave?: (variable: string, value: string) => void;
  onDelete?: (variable: string) => void;
  onToast?: (message: string) => void;
}

export const VariableInput: FC<VariableInputProps> = ({
  variable,
  value,
  required,
  with_label,
  with_example,
  view_only,
  small,
  error,
  onChange,
  onError,
  savedValue,
  onSave,
  onDelete,
  onToast,
}) => {
  const { user } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMultichoice = variable.type === VariableType.MULTICHOICE;
  const isPlain = variable.type === VariableType.PLAIN;
  const hasSavedValue = !!savedValue;
  const showAdornment =
    !view_only &&
    variable.allow_save &&
    user &&
    (user.email_verified || user.role === 'admin' || user.role === 'god');
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  const showDeleteButton = showAdornment && hasSavedValue;
  const showSaveButton =
    showAdornment && !isSaving && !localError && value.trim() !== savedValue && value.trim() !== '';
  const showRestoreButton = showAdornment && !isSaving && savedValue && value.trim() !== savedValue;

  const isRequired = required ?? !variable.allow_skip;

  useEffect(() => {
    if (savedValue !== undefined) {
      const savedError = validateVariableValue(variable, savedValue);
      if (savedError) {
        setLocalError(savedError);
      } else {
        setLocalError(undefined);
      }
    }

    if (error) {
      setLocalError(error);
    }
  }, [error, savedValue, variable]);

  const validateVariable = (value: string) => {
    const err = validateVariableValue(variable, value);
    if ((isRequired && !value.trim()) || (value.trim() && err)) {
      setLocalError(err);

      if (onError) {
        onError(err);
      }
    } else {
      setLocalError(undefined);
      if (onError) {
        onError(undefined);
      }
    }
  };

  const handleBlur = async () => {
    validateVariable(value);
  };

  const handleChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue);
    }

    validateVariable(newValue);
  };

  const handleSave = async () => {
    if (!onSave || !showAdornment) return;

    setIsSaving(true);
    try {
      await onSave(variable.variable, value.trim());
    } catch {
      onToast?.('Не вдалося зберегти змінну');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!savedValue) return;

    handleChange(savedValue);
  };

  const handleDelete = async () => {
    if (!onDelete || !hasSavedValue) return;

    setIsDeleting(true);
    try {
      await onDelete(variable.variable);
    } catch {
      onToast?.('Не вдалося видалити змінну');
    } finally {
      setIsDeleting(false);
    }
  };

  if (error && localError !== error) {
    setLocalError(error);
  }

  const adornment = showAdornment && (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {showDeleteButton && (
        <IconButton size="small" onClick={handleDelete} disabled={isDeleting} color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}
      {showSaveButton && (
        <IconButton size="small" onClick={handleSave} color="primary">
          <SaveIcon fontSize="small" />
        </IconButton>
      )}
      {showRestoreButton && (
        <IconButton size="small" onClick={handleReset} color="primary">
          <ReplayIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );

  if (isMultichoice) {
    return (
      <TextField
        fullWidth
        select
        disabled={view_only}
        required={isRequired}
        label={with_label && variable.name}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        error={!!localError}
        variant="outlined"
        slotProps={{
          input: {
            endAdornment: adornment,
          },
          select: {
            IconComponent: () => null,
          },
        }}
        size={small ? 'small' : 'medium'}
      >
        {variable.choices.map((choice) => (
          <MenuItem key={choice} value={choice}>
            {choice}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  if (isPlain) {
    return (
      <TextField
        fullWidth
        disabled={view_only}
        required={isRequired}
        label={with_label && variable.name}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        error={!!localError}
        helperText={
          localError
            ? localError
            : with_example && variable.example
              ? `Приклад: ${variable.example}`
              : undefined
        }
        variant="outlined"
        slotProps={{
          input: {
            endAdornment: adornment,
          },
        }}
        size={small ? 'small' : 'medium'}
      />
    );
  }

  return null;
};
