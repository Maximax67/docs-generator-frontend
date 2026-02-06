import deepEqual from 'fast-deep-equal';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Alert,
  Collapse,
  Chip,
} from '@mui/material';
import { JSONSchema, SchemaVisualEditor } from 'jsonjoy-builder';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

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
import './Settings.module.css';

interface SettingsProps {
  scope: string | null;
  scopeName: string;
  isFolder: boolean;
  folderTree: FolderTreeGlobal | FolderTree | null;
  onClose: () => void;
}

export interface SettingsRef {
  hasUnsavedChanges: boolean;
}

const emptySchema: JSONSchema = {
  type: 'object',
  properties: {},
  required: [],
};

type TabValue = 'validation' | 'constants' | 'saving' | 'access';

interface ParentScopeSchema {
  scope: string | null;
  scopeName: string;
  schema: JSONSchema;
  variables: VariableInfo[];
}

export const Settings = forwardRef<SettingsRef, SettingsProps>(
  ({ scope, scopeName, isFolder, folderTree, onClose }, ref) => {
    const notify = useNotify();
    const [activeTab, setActiveTab] = useState<TabValue>('validation');

    // Validation schema state
    const [schema, setSchema] = useState<JSONSchema>({ ...emptySchema });
    const [initialSchema, setInitialSchema] = useState<JSONSchema>({ ...emptySchema });
    const [variables, setVariables] = useState<VariableInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingSchema, setFetchingSchema] = useState(false);

    // Parent scope schemas state
    const [parentSchemas, setParentSchemas] = useState<ParentScopeSchema[]>([]);
    const [parentSchemasExpanded, setParentSchemasExpanded] = useState(false);

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

    // Helper to get scope name from folder tree
    const getScopeName = useCallback(
      (targetScope: string | null): string => {
        if (!targetScope) return 'Глобальна область';
        if (!folderTree) return 'Папка';

        // Try to find the folder in the tree
        const findFolder = (tree: FolderTreeGlobal | FolderTree, id: string): string | null => {
          if ('current_folder' in tree && tree.current_folder && tree.current_folder.id === id) {
            return tree.current_folder.name;
          }

          for (const folder of tree.folders) {
            if (folder.current_folder.id === id) {
              return folder.current_folder.name;
            }
            const found = findFolder(folder, id);
            if (found) return found;
          }

          return null;
        };

        return findFolder(folderTree, targetScope) || 'Папка';
      },
      [folderTree],
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

        // Load parent scope schemas
        const parentScopes: ParentScopeSchema[] = [];
        const variablesWithValidation = response.variables.filter(
          (v) => v.validation_schema && Object.keys(v.validation_schema).length > 0,
        );

        // Group by scope
        const scopeMap = new Map<string | null, VariableInfo[]>();
        for (const variable of variablesWithValidation) {
          if (variable.scope !== scope) {
            const existing = scopeMap.get(variable.scope) || [];
            existing.push(variable);
            scopeMap.set(variable.scope, existing);
          }
        }

        // Build parent schemas
        for (const [parentScope, vars] of scopeMap.entries()) {
          const parentSchemaObj: JSONSchema = {
            type: 'object',
            properties: {},
            required: [],
          };

          for (const variable of vars) {
            if (variable.validation_schema) {
              parentSchemaObj.properties![variable.variable] = variable.validation_schema;
              if (variable.required) {
                parentSchemaObj.required!.push(variable.variable);
              }
            }
          }

          parentScopes.push({
            scope: parentScope,
            scopeName: getScopeName(parentScope),
            schema: parentSchemaObj,
            variables: vars,
          });
        }

        setParentSchemas(parentScopes);
      } catch (err) {
        console.error('Failed to load existing schema:', err);
        notify(toErrorMessage(err, 'Не вдалося завантажити схему'), 'error');
      } finally {
        setFetchingSchema(false);
      }
    }, [notify, scope, getScopeName]);

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

    const toggleParentSchemas = () => {
      setParentSchemasExpanded((prev) => !prev);
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
          <Typography variant="h6" noWrap>
            {scopeName}
          </Typography>
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
                <>
                  {parentSchemas.length > 0 && (
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <Box
                        onClick={toggleParentSchemas}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 2,
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            Валідація з вищих scope
                          </Typography>
                          <Chip
                            label={parentSchemas.length}
                            size="small"
                            color="primary"
                            sx={{ height: 20, fontSize: '0.75rem' }}
                          />
                        </Box>
                        <IconButton
                          size="small"
                          sx={{
                            transform: parentSchemasExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s',
                          }}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                      </Box>

                      <Collapse in={parentSchemasExpanded} timeout="auto">
                        <Box sx={{ bgcolor: 'background.default' }}>
                          {parentSchemas.map((parentSchema, index) => (
                            <Box
                              key={`${parentSchema.scope}-${index}`}
                              sx={{
                                borderBottom: index < parentSchemas.length - 1 ? 1 : 0,
                                borderColor: 'divider',
                              }}
                            >
                              <Box
                                sx={{
                                  p: 2,
                                  bgcolor: 'background.paper',
                                  borderBottom: 1,
                                  borderColor: 'divider',
                                }}
                              >
                                <Typography variant="subtitle2" color="text.secondary">
                                  {parentSchema.scopeName}
                                </Typography>
                              </Box>
                              <SchemaVisualEditor
                                schema={parentSchema.schema}
                                onChange={() => {}}
                                readOnly={true}
                              />
                            </Box>
                          ))}
                        </Box>
                      </Collapse>
                    </Box>
                  )}
                  <Box>
                    <SchemaVisualEditor
                      schema={schema}
                      onChange={handleSchemaChange}
                      readOnly={false}
                    />
                  </Box>
                </>
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
              {activeTab === 'access' && (
                <>
                  {!scope && (
                    <Box sx={{ p: 2 }}>
                      <Alert severity="warning">
                        Доступ не можна налаштовувати на глобальну область, лише до папок та файлів!
                      </Alert>
                    </Box>
                  )}
                  {scope && (
                    <ScopeSettingsTab
                      driveId={scope}
                      isFolder={isFolder}
                      initialSettings={scopeSettings}
                      onChange={handleScopeSettingsChange}
                    />
                  )}
                </>
              )}
            </>
          )}
        </Box>
      </Box>
    );
  },
);

Settings.displayName = 'Settings';
