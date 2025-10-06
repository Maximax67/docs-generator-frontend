import { FC, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, CircularProgress, Alert, Paper, IconButton, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { Launch as LaunchIcon } from '@mui/icons-material';
import { DriveFile } from '@/types/documents';
import { useDocumentStore } from '@/store/documents';
import { formatDateTime } from '@/utils/dates';
import { formatFilename } from '@/utils/format-filename';
import { PDFViewerClient } from './PDFViewerClient';

interface PDFPreviewProps {
  showWebLink?: boolean;
  document?: DriveFile | null;
  onRefresh?: () => void;
}

export const PDFPreview: FC<PDFPreviewProps> = ({ showWebLink, document, onRefresh }) => {
  const { previews, fetchPreview } = useDocumentStore();
  const router = useRouter();

  const preview = document ? previews[document.id] : null;

  useEffect(() => {
    if (document && !preview) {
      fetchPreview(document.id);
    }
  }, [document, preview, fetchPreview]);

  if (!document) {
    return (
      <Box
        sx={{
          p: 2,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Оберіть документ для перегляду
        </Typography>
      </Box>
    );
  }

  if (preview?.loading) {
    return (
      <Box
        sx={{
          p: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Завантаження попереднього перегляду...
        </Typography>
      </Box>
    );
  }

  if (preview?.error) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          p: 2,
        }}
      >
        <Alert severity="error" sx={{ width: '100%', maxWidth: 400 }}>
          {preview.error}
        </Alert>
        <IconButton onClick={onRefresh} color="primary" size="small">
          <RefreshIcon />
        </IconButton>
      </Box>
    );
  }

  if (!preview?.url || preview.url === '') {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Неможливо завантажити попередній перегляд
        </Typography>
      </Box>
    );
  }

  const documentSelectHandler = () => router.push(`/documents/selected?id=${document.id}`);
  const openWebViewHandler = () => {
    if (document.web_view_link) {
      window.open(document.web_view_link, '_blank', 'noopener,noreferrer');
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
        <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
          <Typography variant="h6" noWrap>
            {formatFilename(document.name, document.mime_type)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Остання зміна: {formatDateTime(new Date(document.modified_time))}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button size="medium" variant="outlined" onClick={documentSelectHandler}>
            Обрати
          </Button>
          {showWebLink && document.web_view_link && (
            <IconButton
              onClick={openWebViewHandler}
              color="primary"
              size="small"
              aria-label="Open in new tab"
            >
              <LaunchIcon />
            </IconButton>
          )}
        </Box>
      </Paper>

      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
        }}
      >
        <PDFViewerClient url={preview.url} className="h-full" />
      </Box>
    </Box>
  );
};
