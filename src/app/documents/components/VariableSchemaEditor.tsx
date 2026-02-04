import deepEqual from 'fast-deep-equal';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Box, Typography, CircularProgress, Paper, IconButton, Tabs, Tab } from '@mui/material';
import { JSONSchema, SchemaVisualEditor } from 'jsonjoy-builder';
import { Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';

import { toErrorMessage } from '@/utils/errors-messages';
import { variablesApi } from '@/lib/api';
import { VariableInfo } from '@/types/variables';

import 'jsonjoy-builder/styles.css';
import './VariableSchemaEditor.module.css';
import { useNotify } from '@/providers/NotificationProvider';
import { ConstantsTable } from './ConstantsTable';
import { FolderTree } from '@/types/documents';
import { SavingTable } from './SavingTable';

interface VariableSchemaEditorProps {
  scope: string | null;
  scopeName: string;
  folderTree: FolderTree[] | null;
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
  ({ scope, scopeName, folderTree, onClose }, ref) => {
    const notify = useNotify();
    const [activeTab, setActiveTab] = useState<'validation' | 'constants' | 'saving'>('validation');
    const [schema, setSchema] = useState<JSONSchema>({ ...emptySchema });
    const [initialSchema, setInitialSchema] = useState<JSONSchema>({ ...emptySchema });
    const [variables, setVariables] = useState<VariableInfo[]>([]);
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

    const loadSchema = useCallback(async () => {
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
        setVariables(response.variables);
      } catch (err) {
        console.error('Failed to load existing schema:', err);
        notify({
          message: toErrorMessage(err, 'Не вдалося завантажити схему'),
          severity: 'error',
        });
      } finally {
        setFetchingSchema(false);
      }
    }, [notify, scope]);

    useEffect(() => {
      loadSchema();
    }, [loadSchema]);

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
        await loadSchema();

        notify({ message: 'Схему успішно збережено', severity: 'success' });
      } catch (err) {
        notify({ message: toErrorMessage(err, 'Не вдалося зберегти схему'), severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    const handleTabChange = (
      _event: React.SyntheticEvent,
      newValue: 'validation' | 'constants',
    ) => {
      setActiveTab(newValue);
    };

    const requiredVariables =
      typeof schema !== 'boolean' && Array.isArray(schema.required) ? schema.required : [];

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
          <Typography variant="h6">Налаштування для {scopeName}</Typography>
          <Box>
            {activeTab === 'validation' && (
              <IconButton
                color="primary"
                onClick={handleSave}
                disabled={loading || fetchingSchema || !hasChanges}
                title={hasChanges ? 'Зберегти зміни' : 'Немає змін для збереження'}
              >
                <SaveIcon />
              </IconButton>
            )}
            <IconButton onClick={onClose} title="Закрити">
              <CloseIcon />
            </IconButton>
          </Box>
        </Paper>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab
              value="validation"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>Валідація</Typography>
                  {hasChanges && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'warning.main',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </Box>
              }
              title={hasChanges ? 'Не збережені зміни' : undefined}
            />
            <Tab label="Константи" value="constants" />
            <Tab label="Збереження значень" value="saving" />
          </Tabs>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {fetchingSchema ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {activeTab === 'validation' && (
                <SchemaVisualEditor
                  schema={schema}
                  onChange={handleSchemaChange}
                  readOnly={false}
                />
              )}
              {activeTab === 'constants' && (
                <ConstantsTable
                  scope={scope}
                  folderTree={folderTree}
                  variables={variables}
                  onVariableChange={loadSchema}
                />
              )}
              {activeTab === 'saving' && (
                <SavingTable
                  scope={scope}
                  folderTree={folderTree}
                  variables={variables}
                  requiredVariables={requiredVariables}
                  onVariableChange={loadSchema}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    );
  },
);

VariableSchemaEditor.displayName = 'VariableSchemaEditor';
