'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { RJSFSchema } from '@rjsf/utils';
import deepEqual from 'fast-deep-equal';

import { VariableInfo } from '@/types/variables';
import { DocumentDetails } from '@/types/documents';
import { documentsApi } from '@/lib/api';
import { formatDateTime } from '@/utils/dates';
import { formatFilename } from '@/utils/format-filename';
import { savePdfToIndexedDb } from '@/lib/indexed-db-pdf';
import { IChangeEvent } from '@rjsf/core';
import { JSONValue } from '@/types/json';
import { SaveVariablesModal, SaveCandidate } from './SaveVariablesModal';
import { DocumentInputForm, DocumentInputFormRef } from '@/components/DocumentInputForm';
import { applyTitleFallbacks } from '@/utils/json-schema';
import { useUserStore } from '@/store/user';
import { GenerationSuccessModal } from './GenerationSuccessModal';

interface GeneratedDocument {
  blob: Blob;
  filename: string;
  format: 'pdf' | 'docx';
  formData: Record<string, JSONValue>;
}

export default function SelectedDocumentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserStore();
  const documentId = searchParams.get('id');
  const formRef = useRef<DocumentInputFormRef>(null);
  const requestedFormatRef = useRef<'pdf' | 'docx'>('pdf');

  const [documentDetails, setDocumentDetails] = useState<DocumentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [initialFormData, setInitialFormData] = useState<Record<string, JSONValue>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [generatedDocument, setGeneratedDocument] = useState<GeneratedDocument | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const loadData = useCallback(async () => {
    if (!documentId) {
      setError('Документ не обрано!');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const details = await documentsApi.getDocumentDetails(documentId);
      setDocumentDetails(details);

      const initialValues: Record<string, JSONValue> = {};
      details.variables.variables.forEach((v: VariableInfo) => {
        if (v.value === null && v.saved_value !== null) {
          initialValues[v.variable] = v.saved_value;
        }
      });

      setInitialFormData(initialValues);
    } catch {
      setError('Не вдалося завантажити дані документа');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const schema: RJSFSchema = useMemo(() => {
    const properties: Record<string, JSONValue> = {};
    const required: string[] = [];

    const variableMap = new Map(documentDetails?.variables.variables.map((v) => [v.variable, v]));

    documentDetails?.variables.template_variables.forEach((name) => {
      const info = variableMap.get(name);

      if (info?.id && info.value !== null) {
        return;
      }

      if (info?.id && info.validation_schema) {
        properties[name] = applyTitleFallbacks(info.validation_schema);
        if (info.required) {
          required.push(name);
        }
      } else {
        properties[name] = {
          type: 'string',
          title: name,
        };
      }
    });

    const sortedKeys = Object.keys(properties).sort((a, b) => {
      const infoA = variableMap.get(a);
      const infoB = variableMap.get(b);

      const orderA = infoA?.order ?? 10;
      const orderB = infoB?.order ?? 10;

      if (orderA === orderB) {
        return a.localeCompare(b);
      }

      return orderA - orderB;
    });

    const sortedProperties = sortedKeys.reduce<Record<string, JSONValue>>((acc, key) => {
      acc[key] = properties[key];
      return acc;
    }, {});

    return {
      type: 'object',
      properties: sortedProperties,
      required,
    } as RJSFSchema;
  }, [documentDetails?.variables.template_variables, documentDetails?.variables.variables]);

  const calculateSaveCandidates = useCallback(
    (formValues: Record<string, JSONValue>): SaveCandidate[] => {
      if (!documentDetails || !user) {
        return [];
      }

      return documentDetails.variables.variables
        .filter((v): v is VariableInfo & { id: string } =>
          Boolean(v.allow_save && v.id && v.variable in formValues),
        )
        .map((v) => {
          const currentValue = formValues[v.variable];
          const isChanged = !deepEqual(currentValue, v.saved_value);
          return {
            id: v.id,
            variable: v.variable,
            currentValue,
            savedValue: v.saved_value,
            isChanged,
          };
        })
        .filter((c) => c.isChanged || c.savedValue === null);
    },
    [documentDetails, user],
  );

  const handleGenerate = async (data: Record<string, JSONValue>) => {
    if (!documentId || !documentDetails) {
      return;
    }

    const format = requestedFormatRef.current;

    try {
      setIsGenerating(true);
      setGenerateError(null);
      requestedFormatRef.current = format;

      const formatParam = format === 'docx' ? 'docx' : undefined;
      const blob = await documentsApi.generateDocument(documentId, data, formatParam);

      const baseFilename = formatFilename(
        documentDetails.file.name,
        documentDetails.file.mime_type,
      );
      const filename = format === 'docx' ? baseFilename.replace(/\.pdf$/, '.docx') : baseFilename;

      const generated: GeneratedDocument = {
        blob,
        filename,
        format: format,
        formData: data,
      };

      setGeneratedDocument(generated);

      if (format === 'pdf') {
        // Save PDF to IndexedDB for preview
        await savePdfToIndexedDb('generatedPdf', blob);

        // Check if we need to show save variables modal
        const saveCandidates = calculateSaveCandidates(data);
        if (saveCandidates.length > 0) {
          setShowSaveModal(true);
        } else {
          setShowSuccessModal(true);
        }
      } else {
        // For DOCX, show success modal immediately
        setShowSuccessModal(true);
      }
    } catch {
      setGenerateError(
        format === 'docx'
          ? 'Не вдалося згенерувати DOCX документ'
          : 'Не вдалося згенерувати документ',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (e: IChangeEvent) => {
    handleGenerate(e.formData);
  };

  const onGenerateEmpty = async (format: 'pdf' | 'docx') => {
    requestedFormatRef.current = format;
    handleGenerate({});
  };

  const handlePdfClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    requestedFormatRef.current = 'pdf';
    formRef.current?.submit();
  };

  const handleDocxClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    requestedFormatRef.current = 'docx';
    formRef.current?.submit();
  };

  const handleAfterSaveModal = () => {
    setShowSaveModal(false);
    setShowSuccessModal(true);
  };

  const handleDownload = () => {
    if (!generatedDocument) return;

    const url = URL.createObjectURL(generatedDocument.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = generatedDocument.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePreview = () => {
    // This will work because it's a direct response to user click
    window.open('/documents/result/', '_blank');
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setGeneratedDocument(null);
  };

  const saveCandidates = useMemo(() => {
    if (!generatedDocument) {
      return [];
    }
    return calculateSaveCandidates(generatedDocument.formData);
  }, [generatedDocument, calculateSaveCandidates]);

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
          sx={{ pt: 0 }}
          action={
            documentId && (
              <Button color="inherit" size="small" onClick={loadData} sx={{ pt: 1 }}>
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

  const isNoVariables = documentDetails?.variables.template_variables.length === 0;

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
            Оновлено: {formatDateTime(documentDetails.file.modified_time)}
          </Typography>
        </Box>

        <Paper sx={{ p: 3, pb: 1 }}>
          {isNoVariables && (
            <Alert severity="warning">Документ не містить полів для заповнення!</Alert>
          )}

          {!isNoVariables && (
            <DocumentInputForm
              ref={formRef}
              schema={schema}
              initialFormData={initialFormData}
              showErrorList={'bottom'}
              onSubmit={onSubmit}
              uiSchema={{
                'ui:submitButtonOptions': {
                  norender: true,
                },
              }}
            />
          )}

          <Divider sx={{ my: 3 }} />

          {generateError && (
            <Alert severity="error" sx={{ my: 3 }}>
              {generateError}
            </Alert>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={
                isGenerating && requestedFormatRef.current === 'pdf' ? (
                  <CircularProgress size={20} />
                ) : (
                  <DownloadIcon />
                )
              }
              disabled={isGenerating}
              onClick={isNoVariables ? () => onGenerateEmpty('pdf') : handlePdfClick}
              sx={{
                minWidth: { xs: '100%', sm: 200 },
              }}
            >
              {isGenerating && requestedFormatRef.current === 'pdf' ? 'Генерація...' : 'Згенерувати PDF'}
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={
                isGenerating && requestedFormatRef.current === 'docx' ? (
                  <CircularProgress size={20} />
                ) : (
                  <DescriptionIcon />
                )
              }
              disabled={isGenerating}
              onClick={isNoVariables ? () => onGenerateEmpty('docx') : handleDocxClick}
              sx={{
                minWidth: { xs: '100%', sm: 200 },
              }}
            >
              {isGenerating && requestedFormatRef.current === 'docx'
                ? 'Генерація...'
                : 'Згенерувати DOCX'}
            </Button>
          </Stack>
        </Paper>
      </Stack>

      {showSaveModal && generatedDocument && (
        <SaveVariablesModal
          open={showSaveModal}
          candidates={saveCandidates}
          onClose={handleAfterSaveModal}
          onSaved={handleAfterSaveModal}
        />
      )}

      {showSuccessModal && generatedDocument && (
        <GenerationSuccessModal
          open={showSuccessModal}
          filename={generatedDocument.filename}
          fileSize={generatedDocument.blob.size}
          format={generatedDocument.format}
          onDownload={handleDownload}
          onPreview={generatedDocument.format === 'pdf' ? handlePreview : undefined}
          onClose={handleCloseSuccessModal}
        />
      )}
    </Container>
  );
}
