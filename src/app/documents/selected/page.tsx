'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import { RJSFSchema } from '@rjsf/utils';

import { DocumentDetails, DocumentVariableInfo } from '@/types/variables';
import { documentsApi } from '@/lib/api';
import { useUserStore } from '@/store/user';
import { formatDateTime } from '@/utils/dates';
import { formatFilename } from '@/utils/format-filename';
import { savePdfToIndexedDb } from '@/lib/indexed-db-pdf';
import { IChangeEvent } from '@rjsf/core';
import { JSONValue } from '@/types/json';

export default function DocumentVariablesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserStore();

  const documentId = searchParams.get('id');

  const [documentDetails, setDocumentDetails] = useState<DocumentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formValues, setFormValues] = useState<Record<string, JSONValue>>({});
  const [isValid, setIsValid] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) {
      setError('Документ не обрано!');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const details = await documentsApi.getDocumentDetails(documentId);
        setDocumentDetails(details);

        const initialValues: Record<string, JSONValue> = {};
        details.variables.variables.forEach((v: DocumentVariableInfo) => {
          if (v.value != null) initialValues[v.variable] = v.value;
          else if (v.saved_value != null) initialValues[v.variable] = v.saved_value;
        });

        setFormValues(initialValues);
      } catch {
        setError('Не вдалося завантажити дані документа');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [documentId]);

  const schema: RJSFSchema = useMemo(() => {
    const properties: Record<string, JSONValue> = {};
    const required: string[] = [];

    const variableMap = new Map(documentDetails?.variables.variables.map((v) => [v.variable, v]));

    documentDetails?.variables.template_variables.forEach((name) => {
      const info = variableMap.get(name);

      if (info?.in_database && info.validation_schema) {
        properties[name] = {
          ...info.validation_schema,
          title: info.validation_schema.title || name,
        };

        if (info.required) required.push(name);
      } else {
        properties[name] = {
          type: 'string',
          title: name,
        };
      }
    });

    return {
      type: 'object',
      properties,
      required,
    } as RJSFSchema;
  }, [documentDetails?.variables.template_variables, documentDetails?.variables.variables]);

  const handleFormChange = (e: IChangeEvent) => {
    setFormValues(e.formData);
    setIsValid(e.errors.length === 0);
  };

  const handleGenerate = async () => {
    if (!documentId || !documentDetails) return;

    try {
      setIsGenerating(true);
      setGenerateError(null);

      const blob = await documentsApi.generateDocument(documentId, formValues, user?._id);

      await savePdfToIndexedDb('generatedPdf', blob);
      router.push('/documents/result/');
    } catch {
      setGenerateError('Не вдалося згенерувати документ');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={40} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            documentId && (
              <Button color="inherit" size="small" onClick={handleRefresh}>
                <RefreshIcon sx={{ mr: 1 }} />
                Спробувати знову
              </Button>
            )
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!documentDetails) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Документ не знайдено</Alert>
      </Container>
    );
  }

  const unknownVariables = documentDetails?.variables.template_variables.filter(
    (v) => !documentDetails?.variables.variables.find((x) => x.variable === v),
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Box>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mb: 2 }}>
            Назад
          </Button>

          <Typography variant="h4" gutterBottom>
            {formatFilename(documentDetails.file.name, documentDetails.file.mime_type)}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Оновлено: {formatDateTime(new Date(documentDetails.file.modified_time))}
          </Typography>

          {unknownVariables.length > 0 && (
            <Alert severity="warning">
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {unknownVariables.map((v) => (
                  <Chip key={v} label={v} size="small" color="warning" />
                ))}
              </Stack>
            </Alert>
          )}
        </Box>

        <Paper sx={{ p: 3 }}>
          <Form
            liveValidate
            showErrorList={false}
            schema={schema}
            formData={formValues}
            validator={validator}
            onChange={handleFormChange}
            onSubmit={handleGenerate}
          >
            <Divider sx={{ my: 3 }} />

            {generateError && <Alert severity="error">{generateError}</Alert>}

            <Button
              variant="contained"
              size="large"
              type="submit"
              startIcon={isGenerating ? <CircularProgress size={20} /> : <DownloadIcon />}
              disabled={!isValid || isGenerating}
              sx={{
                minWidth: { xs: '100%', sm: 200 },
              }}
            >
              {isGenerating ? 'Генерація...' : 'Згенерувати PDF'}
            </Button>
          </Form>
        </Paper>
      </Stack>
    </Container>
  );
}
