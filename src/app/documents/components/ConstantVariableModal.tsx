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
  Alert,
} from '@mui/material';
import { VariableInfo } from '@/types/variables';
import { variablesApi } from '@/lib/api';
import { useNotify } from '@/providers/NotificationProvider';
import { toErrorMessage } from '@/utils/errors-messages';
import { JSONValue } from '@/types/json';

type VariableType = 'text' | 'number' | 'boolean' | 'json';

interface ConstantVariableModalProps {
  open: boolean;
  scope: string | null;
  editingVariable: VariableInfo | null;
  existingVariables: VariableInfo[];
  onClose: () => void;
  onSave: (updatedVariable: VariableInfo) => void;
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
  const [overrideWarning, setOverrideWarning] = useState<string>('');
  const [isEditingParentScope, setIsEditingParentScope] = useState(false);

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

        // Check if editing variable from parent scope
        if (editingVariable.scope !== scope) {
          setIsEditingParentScope(true);
        } else {
          setIsEditingParentScope(false);
        }
      } else {
        setVariableName('');
        setVariableType('text');
        setVariableValue('');
        setBooleanValue(false);
        setIsEditingParentScope(false);
      }
      setOverrideWarning('');
    }
  }, [open, editingVariable, scope]);

  const getVariableType = (value: JSONValue): VariableType => {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') return 'text';
    return 'json';
  };

  const handleNameChange = (name: string) => {
    setVariableName(name);

    const nameTrimmed = name.trim();
    const existingValidationInCurrentScope = existingVariables.find(
      (v) =>
        v.variable === nameTrimmed &&
        v.scope === scope &&
        v.value === null &&
        v.validation_schema !== null,
    );

    if (existingValidationInCurrentScope) {
      setOverrideWarning(
        `Ця змінна вже задана в розіділі "Валідація". Ви дійсно впевнені, що хочете зробити її константою?`,
      );
      return;
    }

    const existingInOtherScope = existingVariables.find(
      (v) =>
        v.variable === nameTrimmed &&
        v.scope !== scope &&
        (!editingVariable || v.id !== editingVariable.id),
    );

    if (existingInOtherScope) {
      if (existingInOtherScope.value === null) {
        setOverrideWarning(
          `Ця змінна вже існує та не є константою в ${existingInOtherScope.scope ? 'вищих scope' : 'глобальному scope'}. Ви дійсно впевнені, що хочете перевизначити її?`,
        );
      } else {
        setOverrideWarning(
          `Ця змінна вже визначена в ${existingInOtherScope.scope ? 'вищих scope' : 'глобальному scope'} і буде перевизначена`,
        );
      }

      return;
    }

    setOverrideWarning('');
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
    const nameTrimmed = variableName.trim();
    if (!nameTrimmed) {
      notify('Назва змінної не може бути порожньою', 'error');
      return;
    }

    try {
      const value = parseValue();
      setLoading(true);

      let updatedVariable: VariableInfo;

      if (editingVariable) {
        updatedVariable = await variablesApi.updateVariable(editingVariable.id, { value });
        notify('Константу успішно оновлено', 'success');
      } else {
        const existingValidationInCurrentScope = existingVariables.find(
          (v) => v.variable === nameTrimmed && v.scope === scope && v.value === null,
        );

        if (existingValidationInCurrentScope) {
          updatedVariable = await variablesApi.updateVariable(existingValidationInCurrentScope.id, { value });
        } else {
          const payload = {
            variable: nameTrimmed,
            scope,
            value,
            validation_schema: null,
            required: false,
            allow_save: false,
          };
          updatedVariable = await variablesApi.createVariable(payload);
        }
        notify('Константу успішно створено');
      }

      onSave(updatedVariable);
    } catch (error) {
      notify(toErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderValueInput = () => {
    switch (variableType) {
      case 'boolean':
        return (
          <RadioGroup
            value={booleanValue}
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
          {isEditingParentScope && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Ви редагуєте константу з вищого scope.
            </Alert>
          )}

          {overrideWarning && !isEditingParentScope && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {overrideWarning}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Назва змінної"
            value={variableName}
            onChange={(e) => handleNameChange(e.target.value)}
            disabled={loading || !!editingVariable}
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
