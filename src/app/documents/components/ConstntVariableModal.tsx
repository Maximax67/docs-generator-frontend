import { FC, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  CircularProgress,
} from '@mui/material';
import { VariableCompactResponse } from '@/types/variables';
import { variablesApi } from '@/lib/api';
import { useNotify } from '@/providers/NotificationProvider';
import { toErrorMessage } from '@/utils/errors-messages';
import { JSONValue } from '@/types/json';

type VariableType = 'text' | 'number' | 'boolean' | 'json';

interface ConstantVariableModalProps {
  open: boolean;
  scope: string | null;
  editingVariable: VariableCompactResponse | null;
  existingVariables: VariableCompactResponse[];
  onClose: () => void;
  onSave: () => void;
}

export const ConstantVariableModal: FC<ConstantVariableModalProps> = ({
  open,
  scope,
  editingVariable,
  existingVariables,
  onClose,
  onSave,
}) => {
  const notify = useNotify();
  const [variableName, setVariableName] = useState('');
  const [variableType, setVariableType] = useState<VariableType>('text');
  const [variableValue, setVariableValue] = useState('');
  const [booleanValue, setBooleanValue] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (open) {
      if (editingVariable) {
        setVariableName(editingVariable.variable);
        const type = getVariableType(editingVariable.value);
        setVariableType(type);

        if (type === 'boolean') {
          setBooleanValue(Boolean(editingVariable.value));
        } else if (type === 'json') {
          setVariableValue(JSON.stringify(editingVariable.value, null, 2));
        } else {
          setVariableValue(String(editingVariable.value));
        }
      } else {
        setVariableName('');
        setVariableType('text');
        setVariableValue('');
        setBooleanValue(false);
      }
      setNameError('');
    }
  }, [open, editingVariable]);

  const getVariableType = (value: JSONValue): VariableType => {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') return 'text';
    return 'json';
  };

  const handleNameChange = (name: string) => {
    setVariableName(name);

    // Check if variable name already exists in other scopes
    const existingInOtherScope = existingVariables.find(
      (v) =>
        v.variable === name &&
        v.scope !== scope &&
        (!editingVariable || v.id !== editingVariable.id),
    );

    if (existingInOtherScope) {
      setNameError(
        `Увага: Ця змінна вже визначена в ${existingInOtherScope.scope ? 'вищих scope' : 'глобальному scope'} і буде перевизначена`,
      );
    } else {
      setNameError('');
    }
  };

  const parseValue = (): JSONValue => {
    switch (variableType) {
      case 'boolean':
        return booleanValue;
      case 'number':
        const num = parseFloat(variableValue);
        if (isNaN(num)) {
          throw new Error('Некоректне числове значення');
        }
        return num;
      case 'json':
        try {
          return JSON.parse(variableValue);
        } catch {
          throw new Error('Некоректний JSON формат');
        }
      case 'text':
      default:
        return variableValue;
    }
  };

  const handleSave = async () => {
    if (!variableName.trim()) {
      notify({ message: 'Назва змінної не може бути порожньою', severity: 'error' });
      return;
    }

    try {
      const value = parseValue();
      setLoading(true);

      const payload = {
        variable: variableName.trim(),
        scope: scope,
        value: value,
        validation_schema: null,
        required: false,
        allow_save: false,
      };

      if (editingVariable) {
        await variablesApi.updateVariable(editingVariable.id.toString(), payload);
        notify({ message: 'Константу успішно оновлено', severity: 'success' });
      } else {
        await variablesApi.createVariable(payload);
        notify({ message: 'Константу успішно створено', severity: 'success' });
      }

      onSave();
    } catch (error) {
      notify({ message: toErrorMessage(error), severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderValueInput = () => {
    switch (variableType) {
      case 'boolean':
        return (
          <RadioGroup
            value={booleanValue.toString()}
            onChange={(e) => setBooleanValue(e.target.value === 'true')}
          >
            <FormControlLabel value="true" control={<Radio />} label="Так" />
            <FormControlLabel value="false" control={<Radio />} label="Ні" />
          </RadioGroup>
        );
      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label="Значення"
            value={variableValue}
            onChange={(e) => setVariableValue(e.target.value)}
            slotProps={{ htmlInput: { step: 'any' } }}
            disabled={loading}
          />
        );
      case 'json':
        return (
          <TextField
            fullWidth
            multiline
            rows={8}
            label="JSON значення"
            value={variableValue}
            onChange={(e) => setVariableValue(e.target.value)}
            disabled={loading}
            helperText="Введіть коректний JSON"
          />
        );
      case 'text':
      default:
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Значення"
            value={variableValue}
            onChange={(e) => setVariableValue(e.target.value)}
            disabled={loading}
          />
        );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingVariable ? 'Редагувати константу' : 'Додати константу'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            fullWidth
            label="Назва змінної"
            value={variableName}
            onChange={(e) => handleNameChange(e.target.value)}
            disabled={loading || !!editingVariable}
            error={!!nameError}
            helperText={nameError}
          />

          <TextField
            select
            fullWidth
            label="Тип"
            value={variableType}
            onChange={(e) => setVariableType(e.target.value as VariableType)}
            disabled={loading}
          >
            <MenuItem value="text">Текст</MenuItem>
            <MenuItem value="number">Число</MenuItem>
            <MenuItem value="boolean">Булеве значення</MenuItem>
            <MenuItem value="json">JSON</MenuItem>
          </TextField>

          {renderValueInput()}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Скасувати
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !variableName.trim()}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Збереження...' : editingVariable ? 'Зберегти' : 'Додати'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
