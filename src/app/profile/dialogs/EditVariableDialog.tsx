import { FC, useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import { RJSFSchema } from '@rjsf/utils';
import { JSONValue } from '@/types/json';
import { variablesApi } from '@/lib/api';
import { toErrorMessage } from '@/utils/errors-messages';
import { IChangeEvent } from '@rjsf/core';
import { isAxiosError } from '@/utils/is-axios-error';

interface EditVariableDialogProps {
  open: boolean;
  variableId: string;
  variableName: string;
  currentValue: JSONValue;
  onClose: () => void;
  onSave: (newValue: JSONValue) => void;
}

export const EditVariableDialog: FC<EditVariableDialogProps> = ({
  open,
  variableId,
  variableName,
  currentValue,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [fetchingSchema, setFetchingSchema] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [schema, setSchema] = useState<RJSFSchema | null>(null);
  const [formValue, setFormValue] = useState<JSONValue>(currentValue);
  const [textValue, setTextValue] = useState<string>(
    typeof currentValue === 'string' ? currentValue : JSON.stringify(currentValue, null, 2),
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formRef = useRef<any>(null);

  useEffect(() => {
    if (!open) return;

    const fetchSchema = async () => {
      setFetchingSchema(true);
      setError(null);

      try {
        const varInfo = await variablesApi.getVariableInfo(variableId);

        if (varInfo.validation_schema) {
          setSchema(varInfo.validation_schema as RJSFSchema);
        } else {
          setSchema(null);
        }
      } catch (err) {
        setError(toErrorMessage(err, 'Не вдалося завантажити схему змінної'));
      } finally {
        setFetchingSchema(false);
      }
    };

    fetchSchema();
  }, [open, variableId]);

  const saveVariable = async () => {
    setLoading(true);
    setError(null);
    setValidationError(null);

    try {
      let valueToSave: JSONValue = formValue;

      // If no schema, parse text value
      if (!schema) {
        try {
          valueToSave = JSON.parse(textValue);
        } catch {
          // If parsing fails, use as string
          valueToSave = textValue;
        }
      }

      try {
        await variablesApi.validateVariable(variableId, valueToSave);
      } catch (error) {
        if (isAxiosError(error)) {
          const data = error.response?.data;
          if (data && typeof data === 'object' && 'errors' in data && Array.isArray(data.errors)) {
            setValidationError(data.errors.join(', '));
          } else {
            setValidationError('Сталася помилка при перевірці значення');
          }
        } else {
          setValidationError('Сталася помилка при перевірці значення');
        }

        return;
      }

      await variablesApi.updateSavedVariable(variableId, valueToSave);
      onSave(valueToSave);
      onClose();
    } catch (err) {
      setError(toErrorMessage(err, 'Не вдалося зберегти значення'));
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: IChangeEvent) => {
    if (!e.formData) return;

    setFormValue(e.formData as JSONValue);
    setValidationError(null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextValue(e.target.value);
    setValidationError(null);
  };

  const handleSave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (schema) {
      formRef.current?.submit();
    } else {
      saveVariable();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Редагувати: {variableName}</DialogTitle>
      <DialogContent>
        {fetchingSchema && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <CircularProgress />
          </div>
        )}

        {!fetchingSchema && error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!fetchingSchema && validationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationError}
          </Alert>
        )}

        {!fetchingSchema && !error && schema && (
          <Form
            ref={formRef}
            schema={schema}
            formData={formValue}
            validator={validator}
            onChange={handleFormChange}
            onSubmit={saveVariable}
            liveValidate
            showErrorList={false}
            uiSchema={{
              'ui:submitButtonOptions': {
                norender: true,
              },
            }}
          />
        )}

        {!fetchingSchema && !error && !schema && (
          <TextField
            fullWidth
            multiline
            rows={6}
            value={textValue}
            onChange={handleTextChange}
            placeholder="Введіть значення (JSON або текст)"
            helperText="Можна ввести текст або JSON"
          />
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Скасувати
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={loading || fetchingSchema}>
          {loading ? <CircularProgress size={20} /> : 'Зберегти'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
