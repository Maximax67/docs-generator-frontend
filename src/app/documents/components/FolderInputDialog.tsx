import { FC, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { documentsApi, scopesApi } from '@/lib/api';
import { toErrorMessage } from '@/utils/errors-messages';
import { isAxiosError } from '@/utils/is-axios-error';
import { ScopeSettingsTab } from './ScopeSettingsTab';
import { AccessLevel, ScopeSettings } from '@/types/scopes';

interface FolderInputDialogProps {
  open: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onSubmit: (folderId: string) => void;
}

type DialogState = 'input' | 'scope-creation';

export const FolderInputDialog: FC<FolderInputDialogProps> = ({
  open,
  isAdmin,
  onClose,
  onSubmit,
}) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>('input');
  const [pendingFolderId, setPendingFolderId] = useState<string | null>(null);
  const [scopeSettings, setScopeSettings] = useState<ScopeSettings | null>(null);
  const [savingScope, setSavingScope] = useState(false);

  const extractFolderId = (input: string): string | null => {
    const trimmed = input.trim();

    // If it's already just an ID (no slashes or special chars)
    if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return trimmed;
    }

    // Try to extract from Google Drive URL
    // Format: https://drive.google.com/drive/folders/{folderId}
    const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch) {
      return folderMatch[1];
    }

    // Format: https://drive.google.com/drive/u/0/folders/{folderId}
    const folderMatch2 = trimmed.match(/\/u\/\d+\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch2) {
      return folderMatch2[1];
    }

    return null;
  };

  const handleSubmit = async () => {
    const folderId = extractFolderId(input);

    if (!folderId) {
      setError('Невірний формат. Введіть ID папки або URL Google Drive');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Try to load the folder tree to validate access
      await documentsApi.getFolderTree(folderId);

      // If successful, submit
      onSubmit(folderId);
      handleClose();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 403) {
        // Access forbidden - offer to create scope if admin
        if (isAdmin) {
          setPendingFolderId(folderId);
          const defaultSettings: ScopeSettings = {
            drive_id: folderId,
            is_pinned: false,
            restrictions: {
              access_level: AccessLevel.ANY,
              max_depth: null,
            },
          };
          setScopeSettings(defaultSettings);
          setDialogState('scope-creation');
        } else {
          setError('У вас немає доступу до цієї папки');
        }
      } else {
        setError(toErrorMessage(err, 'Не вдалося завантажити папку'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScopeCreate = async () => {
    if (!scopeSettings || !pendingFolderId) return;

    setSavingScope(true);
    try {
      await scopesApi.createScope(scopeSettings);

      // After creating scope, submit the folder
      onSubmit(pendingFolderId);
      handleClose();
    } catch (err) {
      setError(toErrorMessage(err, 'Не вдалося створити налаштування доступу'));
    } finally {
      setSavingScope(false);
    }
  };

  const handleScopeSettingsChange = (settings: ScopeSettings) => {
    setScopeSettings(settings);
  };

  const handleBackToInput = () => {
    setDialogState('input');
    setPendingFolderId(null);
    setScopeSettings(null);
    setError('');
  };

  const handleClose = () => {
    setInput('');
    setError('');
    setLoading(false);
    setDialogState('input');
    setPendingFolderId(null);
    setScopeSettings(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {dialogState === 'input' ? (
        <>
          <DialogTitle>Відкрити папку Google Drive</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Введіть URL папки Google Drive або ID папки
              </Typography>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                autoFocus
                fullWidth
                label="URL або ID папки"
                placeholder="https://drive.google.com/drive/folders/... або 1a2b3c4d..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError('');
                }}
                error={!!error}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleSubmit();
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={loading}>
              Скасувати
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!input.trim() || loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Завантаження...' : 'Відкрити'}
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle>Створити налаштування доступу</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                До папки не заданий доступ. Налаштуйте його, щоб дозволити користувачам переглядати
                цей розділ.
              </Alert>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {scopeSettings && (
                <ScopeSettingsTab
                  driveId={pendingFolderId!}
                  isFolder={true}
                  initialSettings={scopeSettings}
                  onChange={handleScopeSettingsChange}
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleBackToInput} disabled={savingScope}>
              Назад
            </Button>
            <Button onClick={handleClose} disabled={savingScope}>
              Скасувати
            </Button>
            <Button
              onClick={handleScopeCreate}
              variant="contained"
              disabled={savingScope}
              startIcon={savingScope ? <CircularProgress size={20} /> : null}
            >
              {savingScope ? 'Створення...' : 'Створити і відкрити'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};
