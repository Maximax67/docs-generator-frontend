import deepEqual from 'fast-deep-equal';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Box, Typography, CircularProgress, Paper, IconButton, Tabs, Tab } from '@mui/material';
import { JSONSchema, SchemaVisualEditor } from 'jsonjoy-builder';
import { Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';

import { toErrorMessage } from '@/utils/errors-messages';
import { variablesApi, scopesApi } from '@/lib/api';
import { VariableInfo } from '@/types/variables';

import { useNotify } from '@/providers/NotificationProvider';
import { ConstantsTable } from './ConstantsTable';
import { FolderTree, FolderTreeGlobal } from '@/types/documents';
import { SavingTable } from './SavingTable';
import { ScopeSettingsTab } from './ScopeSettingsTab';
import { AccessLevel, ScopeSettings } from '@/types/scopes';

import 'jsonjoy-builder/styles.css';
import './VariableSchemaEditor.module.css';

interface VariableSchemaEditorProps {
  scope: string | null;
  scopeName: string;
  isFolder: boolean;
  folderTree: FolderTreeGlobal | FolderTree | null;
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

type TabValue = 'validation' | 'constants' | 'saving' | 'access';

export const VariableSchemaEditor = forwardRef<VariableSchemaEditorRef, VariableSchemaEditorProps>(
  ({ scope, scopeName, isFolder, folderTree, onClose }, ref) => {
    const notify = useNotify();
    const [activeTab, setActiveTab] = useState<TabValue>('validation');

    // Validation schema state
    const [schema, setSchema] = useState<JSONSchema>({ ...emptySchema });
    const [initialSchema, setInitialSchema] = useState<JSONSchema>({ ...emptySchema });
    const [variables, setVariables] = useState<VariableInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingSchema, setFetchingSchema] = useState(false);

    // Scope settings state
    const [scopeSettings, setScopeSettings] = useState<ScopeSettings | null>(null);
    const [initialScopeSettings, setInitialScopeSettings] = useState<ScopeSettings | null>(null);
    const [fetchingScopeSettings, setFetchingScopeSettings] = useState(false);
    const [savingScopeSettings, setSavingScopeSettings] = useState(false);

    const hasSchemaChanges = useMemo(
      () => !deepEqual(schema, initialSchema),
      [schema, initialSchema],
    );

    const hasScopeChanges = useMemo(() => {
      if (!scopeSettings || !initialScopeSettings) return false;
      return !deepEqual(scopeSettings, initialScopeSettings);
    }, [scopeSettings, initialScopeSettings]);

    const hasChanges = hasSchemaChanges || hasScopeChanges;

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
        notify(toErrorMessage(err, 'Не вдалося завантажити схему'), 'error');
      } finally {
        setFetchingSchema(false);
      }
    }, [notify, scope]);

    const loadScopeSettings = useCallback(async () => {
      if (!scope) return;

      setFetchingScopeSettings(true);
      try {
        const existingScope = await scopesApi.getScope(scope);

        if (existingScope) {
          const settings: ScopeSettings = {
            drive_id: existingScope.drive_id,
            is_pinned: existingScope.is_pinned,
            restrictions: existingScope.restrictions,
          };
          setScopeSettings(settings);
          setInitialScopeSettings(settings);
        } else {
          const defaultSettings: ScopeSettings = {
            drive_id: scope,
            is_pinned: false,
            restrictions: {
              access_level: AccessLevel.ANY,
              max_depth: null,
            },
          };
          setScopeSettings(defaultSettings);
          setInitialScopeSettings(defaultSettings);
        }
      } catch (err) {
        console.error('Failed to load scope settings:', err);
        notify(toErrorMessage(err, 'Не вдалося завантажити налаштування доступу'), 'error');
      } finally {
        setFetchingScopeSettings(false);
      }
    }, [notify, scope]);

    useEffect(() => {
      loadSchema();
      loadScopeSettings();
    }, [loadSchema, loadScopeSettings]);

    const handleSchemaChange = (newSchema: JSONSchema) => {
      setSchema(newSchema);
    };

    const handleScopeSettingsChange = useCallback((settings: ScopeSettings) => {
      setScopeSettings(settings);
    }, []);

    const handleSaveSchema = async () => {
      if (!hasSchemaChanges) {
        notify('Немає змін для збереження', 'info');
        return;
      }

      setLoading(true);

      try {
        await variablesApi.updateValidationSchema(scope, schema);
        await loadSchema();

        notify('Схему успішно збережено');
      } catch (err) {
        notify(toErrorMessage(err, 'Не вдалося зберегти схему'), 'error');
      } finally {
        setLoading(false);
      }
    };

    const handleSaveScopeSettings = async () => {
      if (!hasScopeChanges || !scopeSettings || !scope) {
        notify('Немає змін для збереження', 'info');
        return;
      }

      setSavingScopeSettings(true);

      try {
        const existingScope = await scopesApi.getScope(scope);

        if (existingScope) {
          if (!deepEqual(scopeSettings.restrictions, initialScopeSettings?.restrictions)) {
            await scopesApi.updateScopeRestrictions(scope, scopeSettings.restrictions);
          }

          if (scopeSettings.is_pinned !== initialScopeSettings?.is_pinned) {
            if (scopeSettings.is_pinned) {
              await scopesApi.pinScope(scope);
            } else {
              await scopesApi.unpinScope(scope);
            }
          }
        } else {
          await scopesApi.createScope(scopeSettings);
        }

        await loadScopeSettings();
        notify('Налаштування доступу успішно збережено');
      } catch (err) {
        notify(toErrorMessage(err, 'Не вдалося зберегти налаштування доступу'), 'error');
      } finally {
        setSavingScopeSettings(false);
      }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
      setActiveTab(newValue);
    };

    const handleChangeSave = (id: string, value: boolean) => {
      setVariables((prev) =>
        prev.map((variable) =>
          variable.id === id ? { ...variable, allow_save: value } : variable,
        ),
      );
    };

    const handleAddVariable = (variable: VariableInfo) => {
      setVariables((prev) => [...prev, variable]);
    };

    const handleDeleteVariable = (id: string) => {
      setVariables((prev) => prev.filter((variable) => variable.id !== id));
    };

    const handleClearConstant = (id: string) => {
      setVariables((prev) =>
        prev.map((variable) => (variable.id === id ? { ...variable, value: null } : variable)),
      );
    };

    const handleConstantEdit = (updatedVariable: VariableInfo) => {
      setVariables((prev) => {
        let found = false;

        const next = prev.map((v) => {
          if (v.id === updatedVariable.id) {
            found = true;
            return updatedVariable;
          }
          return v;
        });

        return found ? next : [...next, updatedVariable];
      });
    };

    const canSave =
      activeTab === 'validation'
        ? hasSchemaChanges
        : activeTab === 'access'
          ? hasScopeChanges
          : false;
    const isSaving =
      activeTab === 'validation' ? loading : activeTab === 'access' ? savingScopeSettings : false;
    const isFetching =
      activeTab === 'validation'
        ? fetchingSchema
        : activeTab === 'access'
          ? fetchingScopeSettings
          : false;

    const handleSave =
      activeTab === 'validation'
        ? handleSaveSchema
        : activeTab === 'access'
          ? handleSaveScopeSettings
          : undefined;

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
            {handleSave && (
              <IconButton
                color="primary"
                onClick={handleSave}
                disabled={isSaving || isFetching || !canSave}
                title={canSave ? 'Зберегти зміни' : 'Немає змін для збереження'}
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
                  {hasSchemaChanges && (
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
              title={hasSchemaChanges ? 'Не збережені зміни' : undefined}
            />
            <Tab label="Константи" value="constants" />
            <Tab label="Збереження значень" value="saving" />
            <Tab
              value="access"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>Доступ</Typography>
                  {hasScopeChanges && (
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
              title={hasScopeChanges ? 'Не збережені зміни' : undefined}
            />
          </Tabs>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {(fetchingSchema && activeTab === 'validation') ||
          (fetchingScopeSettings && activeTab === 'access') ? (
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
                  onConstantClear={handleClearConstant}
                  onConstantDelete={handleDeleteVariable}
                  onConstantEdit={handleConstantEdit}
                />
              )}
              {activeTab === 'saving' && (
                <SavingTable
                  scope={scope}
                  folderTree={folderTree}
                  variables={variables}
                  onChangeSave={handleChangeSave}
                  onAddVariable={handleAddVariable}
                  onDeleteVariable={handleDeleteVariable}
                />
              )}
              {activeTab === 'access' && scopeSettings && (
                <ScopeSettingsTab
                  driveId={scope!}
                  isFolder={isFolder}
                  initialSettings={scopeSettings}
                  onChange={handleScopeSettingsChange}
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
