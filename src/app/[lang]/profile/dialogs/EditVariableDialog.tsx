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
import { RJSFSchema } from '@rjsf/utils';
import { JSONValue } from '@/types/json';
import { toErrorMessage } from '@/utils/errors-messages';
import { IChangeEvent } from '@rjsf/core';
import { DocumentInputForm, DocumentInputFormRef } from '@/components/DocumentInputForm';
import { applyTitleFallbacks } from '@/utils/json-schema';
import { VariableInfo } from '@/types/variables';
import { useDictionary } from '@/contexts/LangContext';

interface EditVariableDialogProps {
  open: boolean;
  variable: VariableInfo;
  value: JSONValue;
  onClose: () => void;
  onSave: (newValue: JSONValue) => void;
}

export const EditVariableDialog: FC<EditVariableDialogProps> = ({
  open,
  variable,
  value,
  onClose,
  onSave,
}) => {
  const dict = useDictionary();
  const v = dict.profile.vars;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schema, setSchema] = useState<RJSFSchema | null>(null);
  const [textValue, setTextValue] = useState<string>(
    typeof value === 'string' ? value : JSON.stringify(value, null, 2),
  );
  const formRef = useRef<DocumentInputFormRef>(null);

  useEffect(() => {
    if (!open) return;

    if (variable.validation_schema) {
      const schemaWithTitles = applyTitleFallbacks(variable.validation_schema);
      const formSchema = {
        type: 'object',
        properties: {
          [variable.variable]: schemaWithTitles,
        },
        required: [variable.variable],
      };
      setSchema(formSchema as RJSFSchema);
    } else {
      setSchema(null);
    }
  }, [open, variable]);

  const saveVariable = async (valueToSave: JSONValue) => {
    setLoading(true);
    setError(null);

    try {
      onSave(valueToSave);
      onClose();
    } catch (err) {
      setError(toErrorMessage(err, v.saveError));
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: IChangeEvent) => {
    saveVariable(e.formData[variable.variable]);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextValue(e.target.value);
  };

  const handleSave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (schema) {
      formRef.current?.submit();
    } else {
      let valueToSave: JSONValue = textValue;
      try {
        valueToSave = JSON.parse(textValue);
      } catch {
        valueToSave = textValue;
      }
      saveVariable(valueToSave);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{`${v.editTitle}: ${variable.variable}`}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!error && schema && (
          <DocumentInputForm
            ref={formRef}
            schema={schema}
            initialFormData={{ [variable.variable]: value }}
            onSubmit={handleFormSubmit}
            uiSchema={{
              'ui:submitButtonOptions': {
                norender: true,
              },
            }}
          />
        )}

        {!error && !schema && (
          <TextField
            fullWidth
            multiline
            rows={6}
            value={textValue}
            onChange={handleTextChange}
            placeholder={v.editPlaceholder}
            helperText={v.editPlaceholder}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          {dict.common.cancel}
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : dict.common.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
