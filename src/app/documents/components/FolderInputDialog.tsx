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
} from '@mui/material';

interface FolderInputDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (folderId: string) => void;
}

export const FolderInputDialog: FC<FolderInputDialogProps> = ({ open, onClose, onSubmit }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

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

  const handleSubmit = () => {
    const folderId = extractFolderId(input);

    if (!folderId) {
      setError('Невірний формат. Введіть ID папки або URL Google Drive');
      return;
    }

    onSubmit(folderId);
    setInput('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setInput('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Відкрити папку Google Drive</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Введіть URL папки Google Drive або ID папки
          </Typography>
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
            helperText={error}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Скасувати</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!input.trim()}>
          Відкрити
        </Button>
      </DialogActions>
    </Dialog>
  );
};
