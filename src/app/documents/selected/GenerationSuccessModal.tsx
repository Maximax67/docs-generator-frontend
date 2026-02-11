import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';

interface GenerationSuccessModalProps {
  open: boolean;
  filename: string;
  fileSize: number;
  format: 'pdf' | 'docx';
  onDownload: () => void;
  onPreview?: () => void;
  onClose: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
};

export const GenerationSuccessModal: React.FC<GenerationSuccessModalProps> = ({
  open,
  filename,
  fileSize,
  format,
  onDownload,
  onPreview,
  onClose,
}) => {
  const isPdf = format === 'pdf';

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
          <Box>
            <Typography variant="h6" component="div">
              Документ успішно згенеровано!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ваш файл готовий до завантаження
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 3, 
            bgcolor: 'background.default',
            borderRadius: 2,
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              {isPdf ? (
                <PictureAsPdfIcon sx={{ fontSize: 48, color: 'error.main' }} />
              ) : (
                <DescriptionIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600,
                    wordBreak: 'break-word',
                  }}
                >
                  {filename}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  <Chip 
                    label={format.toUpperCase()} 
                    size="small" 
                    color={isPdf ? 'error' : 'primary'}
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip 
                    label={formatFileSize(fileSize)} 
                    size="small" 
                    variant="outlined"
                  />
                </Stack>
              </Box>
            </Stack>

            <Divider />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {isPdf ? 'Ви можете переглянути документ або завантажити його на свій пристрій.' : 'Натисніть кнопку нижче, щоб завантажити документ.'}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Button onClick={onClose} color="inherit">
          Закрити
        </Button>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onDownload}
            size="large"
          >
            Завантажити
          </Button>
          {isPdf && onPreview && (
            <Button
              variant="contained"
              startIcon={<VisibilityIcon />}
              onClick={onPreview}
              size="large"
            >
              Переглянути
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
