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
import { useDictionary } from '@/contexts/LangContext';

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
  const dict = useDictionary();
  const d = dict.documents.drive;

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
      setError(d.invalidFormat);
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
          setError(d.noAccess);
        }
      } else {
        setError(toErrorMessage(err, d.loadError));
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
      setError(toErrorMessage(err, d.createError));
    } finally {
      setSavingScope(false);
    }
  };

  const handleScopeSettingsChange = (settings: ScopeSettings | null) => {
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
          <DialogTitle>{d.dialogTitle}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {d.description}
              </Typography>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                autoFocus
                fullWidth
                label={d.label}
                placeholder={d.placeholder}
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
              {dict.common.cancel}
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!input.trim() || loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? dict.common.loading : dict.common.open}
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle>{d.createAccessTitle}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                {d.createAccessInfo}
              </Alert>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {scopeSettings && (
                <ScopeSettingsTab
                  setupOnly
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
              {dict.common.back}
            </Button>
            <Button onClick={handleClose} disabled={savingScope}>
              {dict.common.cancel}
            </Button>
            <Button
              onClick={handleScopeCreate}
              variant="contained"
              disabled={savingScope}
              startIcon={savingScope ? <CircularProgress size={20} /> : null}
            >
              {savingScope ? dict.common.creating : d.createAndOpen}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};
