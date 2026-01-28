import { FC, useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Paper, IconButton, Snackbar, Alert } from '@mui/material';
import { JSONSchema, SchemaVisualEditor } from 'jsonjoy-builder';
import { Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';

import 'jsonjoy-builder/styles.css';
import { DocumentVariableInfo } from '@/types/variables';
import { api } from '@/lib/api/core';
import { toErrorMessage } from '@/utils/errors-messages';

interface VariableSchemaEditorProps {
  scope: string | null;
  scopeName: string;
  onClose: () => void;
  onSave?: () => void;
}

export const VariableSchemaEditor: FC<VariableSchemaEditorProps> = ({
  scope,
  scopeName,
  onClose,
  onSave,
}) => {
  const [schema, setSchema] = useState<JSONSchema>({
    type: 'object',
    properties: {},
    required: [],
  });
  const [loading, setLoading] = useState(false);
  const [fetchingSchema, setFetchingSchema] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExistingSchema = async () => {
      setFetchingSchema(true);
      try {
        const response = await api.get(`/variables`, {
          params: { scope, page_size: 100 },
        });

        const variables = response.data.data || [];

        if (variables.length > 0) {
          const properties: Record<string, JSONSchema> = {};
          const required: string[] = [];

          variables.forEach((v: DocumentVariableInfo) => {
            if (v.validation_schema) {
              properties[v.variable] = v.validation_schema;
              if (v.required) {
                required.push(v.variable);
              }
            }
          });

          setSchema({
            type: 'object',
            properties,
            required,
          });
        }
      } catch (err) {
        console.error('Failed to load existing schema:', err);
      } finally {
        setFetchingSchema(false);
      }
    };

    loadExistingSchema();
  }, [scope]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      await api.put(`/variables/schema/${scope}`, { schema });
      if (onSave) onSave();
    } catch (err) {
      setError(toErrorMessage(err, 'Failed to save schema'));
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
        <Typography variant="h6">Configure Variables for {scopeName}</Typography>
        <Box>
          <IconButton color="primary" onClick={handleSave} disabled={loading || fetchingSchema}>
            <SaveIcon />
          </IconButton>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Paper>

      {fetchingSchema ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <SchemaVisualEditor schema={schema} onChange={setSchema} readOnly={false} />
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
    </Box>
  );
};
