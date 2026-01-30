import { FC, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import { JSONSchema, SchemaVisualEditor } from 'jsonjoy-builder';
import { Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';

import { toErrorMessage } from '@/utils/errors-messages';
import { variablesApi } from '@/lib/api';

import 'jsonjoy-builder/styles.css';
import '../jsonjoy-builder.css';

interface VariableSchemaEditorProps {
  scope: string | null;
  scopeName: string;
  onClose: () => void;
  onSave?: () => void;
  onChange?: () => void;
  hasUnsavedChanges?: boolean;
}

const emptySchema: JSONSchema = {
  type: 'object',
  properties: {},
  required: [],
};

export const VariableSchemaEditor: FC<VariableSchemaEditorProps> = ({
  scope,
  scopeName,
  onClose,
  onSave,
  onChange,
}) => {
  const [schema, setSchema] = useState<JSONSchema>(emptySchema);
  const [initialSchema, setInitialSchema] = useState<JSONSchema>(emptySchema);
  const [loading, setLoading] = useState(false);
  const [fetchingSchema, setFetchingSchema] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Track if schema has actually changed
  const hasChanges = JSON.stringify(schema) !== JSON.stringify(initialSchema);

  useEffect(() => {
    const loadExistingSchema = async () => {
      setFetchingSchema(true);
      try {
        const response = await variablesApi.getValidationSchema(scope);
        const schema = response.validation_schema;
        if (Object.keys(schema).length === 0) {
          setSchema(emptySchema);
          setInitialSchema(emptySchema);
        } else {
          setSchema(schema);
          setInitialSchema(schema);
        }
      } catch (err) {
        console.error('Failed to load existing schema:', err);
        setError(toErrorMessage(err, 'Не вдалося завантажити схему'));
      } finally {
        setFetchingSchema(false);
      }
    };

    loadExistingSchema();
  }, [scope]);

  const handleSchemaChange = (newSchema: JSONSchema) => {
    setSchema(newSchema);
    onChange?.();
  };

  const handleSave = async () => {
    if (!hasChanges) {
      setSuccessMessage('Немає змін для збереження');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await variablesApi.updateValidationSchema(scope, schema);

      setInitialSchema(schema);
      setSuccessMessage('Схему успішно збережено');
      onSave?.();
    } catch (err) {
      setError(toErrorMessage(err, 'Не вдалося зберегти схему'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">Налаштування змінних для {scopeName}</Typography>

          {hasChanges && (
            <Tooltip
              title="Незбережені зміни"
              arrow
              slotProps={{
                popper: {
                  disablePortal: true,
                },
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'warning.main',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />
            </Tooltip>
          )}
        </Box>
        <Box>
          <IconButton
            color="primary"
            onClick={handleSave}
            disabled={loading || fetchingSchema || !hasChanges}
            title={hasChanges ? 'Зберегти зміни' : 'Немає змін для збереження'}
          >
            <SaveIcon />
          </IconButton>
          <IconButton onClick={onClose} title="Закрити">
            <CloseIcon />
          </IconButton>
        </Box>
      </Paper>

      {fetchingSchema ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <SchemaVisualEditor schema={schema} onChange={handleSchemaChange} readOnly={false} />
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
