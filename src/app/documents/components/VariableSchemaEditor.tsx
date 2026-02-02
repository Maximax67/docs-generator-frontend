import deepEqual from 'fast-deep-equal';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Box, Typography, CircularProgress, Paper, IconButton, Tooltip } from '@mui/material';
import { JSONSchema, SchemaVisualEditor } from 'jsonjoy-builder';
import { Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';

import { toErrorMessage } from '@/utils/errors-messages';
import { variablesApi } from '@/lib/api';

import 'jsonjoy-builder/styles.css';
import './VariableSchemaEditor.module.css';
import { useNotify } from '@/providers/NotificationProvider';

interface VariableSchemaEditorProps {
  scope: string | null;
  scopeName: string;
  onClose: () => void;
}

export interface VariableSchemaEditorRef {
  hasUnsavedChanges: boolean;
}

const emptySchema: JSONSchema = {
  type: 'object',
  properties: {},
  required: [],
};

export const VariableSchemaEditor = forwardRef<VariableSchemaEditorRef, VariableSchemaEditorProps>(
  ({ scope, scopeName, onClose }, ref) => {
    const notify = useNotify();
    const [schema, setSchema] = useState<JSONSchema>({ ...emptySchema });
    const [initialSchema, setInitialSchema] = useState<JSONSchema>({ ...emptySchema });
    const [loading, setLoading] = useState(false);
    const [fetchingSchema, setFetchingSchema] = useState(false);
    const hasChanges = useMemo(() => !deepEqual(schema, initialSchema), [schema, initialSchema]);

    useImperativeHandle(
      ref,
      () => ({
        hasUnsavedChanges: hasChanges,
      }),
      [hasChanges],
    );

    useEffect(() => {
      const loadExistingSchema = async () => {
        setFetchingSchema(true);
        try {
          const response = await variablesApi.getValidationSchema(scope);
          const schema = response.validation_schema;
          if (Object.keys(schema).length === 0) {
            setSchema({ ...emptySchema });
            setInitialSchema({ ...emptySchema });
          } else {
            setSchema(schema);
            setInitialSchema(schema);
          }
        } catch (err) {
          console.error('Failed to load existing schema:', err);
          notify({
            message: toErrorMessage(err, 'Не вдалося завантажити схему'),
            severity: 'error',
          });
        } finally {
          setFetchingSchema(false);
        }
      };

      loadExistingSchema();
    }, [notify, scope]);

    const handleSchemaChange = (newSchema: JSONSchema) => {
      setSchema(newSchema);
    };

    const handleSave = async () => {
      if (!hasChanges) {
        notify({ message: 'Немає змін для збереження', severity: 'info' });
        return;
      }

      setLoading(true);

      try {
        await variablesApi.updateValidationSchema(scope, schema);

        setInitialSchema(schema);
        notify({ message: 'Схему успішно збережено', severity: 'success' });
      } catch (err) {
        notify({ message: toErrorMessage(err, 'Не вдалося зберегти схему'), severity: 'error' });
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
      </Box>
    );
  },
);

VariableSchemaEditor.displayName = 'VariableSchemaEditor';
