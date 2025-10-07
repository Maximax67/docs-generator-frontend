'use client';

import { useEffect, useState } from 'react';
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
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DocumentDetails, VariableType } from '@/types/variables';
import { documentApi, DocumentApiError } from '@/lib/documentApi';
import {
  validateFormValues,
  getInitialFormValues,
  canSubmitForm,
  hasVariablesToFill,
} from '@/lib/validation';
import { VariableInput } from '@/components/VariableInput';
import { useUserStore } from '@/store/user';
import { formatDateTime } from '@/utils/dates';
import { formatFilename } from '@/utils/format-filename';

export default function DocumentVariablesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateSavedVariable, deleteSavedVariable } = useUserStore();

  const [documentDetails, setDocumentDetails] = useState<DocumentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const documentId = searchParams.get('id');

  useEffect(() => {
    const loadData = async () => {
      if (!documentId) {
        setError('Документ не обрано!');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const details = await documentApi.getDocumentDetails(documentId);
        setDocumentDetails(details);
      } catch (err: unknown) {
        if (err instanceof DocumentApiError) {
          setError(err.message);
        } else {
          setError('Не вдалося завантажити дані документа');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [documentId]);

  useEffect(() => {
    if (!documentDetails) return;

    setFormValues((prev) => {
      if (Object.keys(prev).length > 0) {
        return prev;
      }

      const savedVariables =
        user?.email_verified || user?.role === 'admin' || user?.role === 'god'
          ? user.saved_variables
          : {};

      return getInitialFormValues(documentDetails.variables, savedVariables);
    });
  }, [documentDetails, user?.saved_variables, user?.email_verified, user?.role]);

  const handleValueChange = (variable: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [variable]: value }));

    if (fieldErrors[variable]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[variable];
        return newErrors;
      });
    }
  };

  const handleFieldError = (variable: string, error: string | undefined) => {
    setFieldErrors((prev) => {
      if (error) {
        return { ...prev, [variable]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[variable];
        return newErrors;
      }
    });
  };

  const handleSaveVariable = async (variable: string, value: string) => {
    if (!user) return;

    try {
      await updateSavedVariable(variable, value);
    } catch {
      setToastMessage('Не вдалося зберегти змінну');
      setToastOpen(true);
    }
  };

  const handleDeleteVariable = async (variable: string) => {
    if (!user) return;

    try {
      await deleteSavedVariable(variable);
    } catch {
      setToastMessage('Не вдалося видалити змінну');
      setToastOpen(true);
    }
  };

  const handleGenerate = async () => {
    if (!documentDetails || !documentId) return;

    const validation = validateFormValues(documentDetails.variables, formValues);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const blob = await documentApi.generateDocument(documentId, formValues, user?._id);
      const pdfUrl = window.URL.createObjectURL(blob);
      sessionStorage.setItem('generatedPdfUrl', pdfUrl);

      router.push('/documents/result');
    } catch (err: unknown) {
      if (err instanceof DocumentApiError) {
        setGenerateError(err.message);
      } else {
        setGenerateError('Не вдалося згенерувати документ');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleCloseToast = () => setToastOpen(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastOpen(true);
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

  const canSubmit = canSubmitForm(documentDetails.variables, formValues);
  const hasUnknownVariables = documentDetails.unknown_variables.length > 0;
  const hasVariablesToInput = hasVariablesToFill(documentDetails.variables);

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
            Остання зміна: {formatDateTime(new Date(documentDetails.file.modified_time))}
          </Typography>

          {hasUnknownVariables && (
            <Alert severity="warning" sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 0.75,
                }}
              >
                <Typography variant="subtitle2" component="span">
                  Невідомі змінні в документі:
                </Typography>

                {documentDetails.unknown_variables.map((variable) => (
                  <Chip key={variable} label={variable} size="small" color="warning" />
                ))}
              </Box>
            </Alert>
          )}
        </Box>

        <Paper sx={{ p: 3 }}>
          {!hasVariablesToInput && (
            <Alert severity="info">Цей документ не містить полів для заповнення</Alert>
          )}

          {hasVariablesToInput && (
            <>
              <Typography variant="h6">Заповніть дані</Typography>
              <Stack spacing={3} sx={{ mt: 3 }}>
                {documentDetails.variables
                  .filter((variable) => variable.type !== VariableType.CONSTANT)
                  .map((variable) => (
                    <VariableInput
                      with_example
                      with_label
                      key={variable.variable}
                      variable={variable}
                      value={formValues[variable.variable] || ''}
                      onChange={(value) => handleValueChange(variable.variable, value)}
                      onError={(error) => handleFieldError(variable.variable, error)}
                      savedValue={
                        user?.email_verified || user?.role === 'admin' || user?.role === 'god'
                          ? user?.saved_variables[variable.variable]
                          : undefined
                      }
                      onSave={handleSaveVariable}
                      onDelete={handleDeleteVariable}
                      onToast={showToast}
                    />
                  ))}
              </Stack>
            </>
          )}

          <Divider sx={{ my: 3 }} />

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={2}
          >
            {generateError && (
              <Alert severity="error" sx={{ flex: 1 }}>
                {generateError}
              </Alert>
            )}

            <Button
              variant="contained"
              size="large"
              startIcon={isGenerating ? <CircularProgress size={20} /> : <DownloadIcon />}
              onClick={handleGenerate}
              disabled={!canSubmit || isGenerating}
              sx={{
                minWidth: { xs: '100%', sm: 200 },
              }}
            >
              {isGenerating ? 'Генерація...' : 'Згенерувати PDF'}
            </Button>
          </Box>
        </Paper>

        <Snackbar
          open={toastOpen}
          autoHideDuration={6000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{
            '& .MuiPaper-root': {
              backgroundColor: (theme) => theme.palette.background.paper,
              color: (theme) => theme.palette.text.primary,
            },
          }}
        >
          <Alert onClose={handleCloseToast} severity="error" sx={{ width: '100%' }}>
            {toastMessage}
          </Alert>
        </Snackbar>
      </Stack>
    </Container>
  );
}
