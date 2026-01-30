import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, CircularProgress, Alert, Paper, IconButton, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { Launch as LaunchIcon } from '@mui/icons-material';
import { DriveFile, DocumentPreview } from '@/types/documents';
import { formatDateTime } from '@/utils/dates';
import { formatFilename } from '@/utils/format-filename';
import { PdfViewerClient } from '../../../components/PdfViewerClient';

interface PdfPreviewProps {
  showWebLink?: boolean;
  document?: DriveFile | null;
  preview?: DocumentPreview | null;
  onRefresh?: () => void;
}

export const PdfPreview: FC<PdfPreviewProps> = ({ showWebLink, document, preview, onRefresh }) => {
  const router = useRouter();

  const documentSelectHandler = () => {
    if (document) {
      router.push(`/documents/selected/?id=${document.id}`);
    }
  };

  const openWebViewHandler = () => {
    if (document?.web_view_link) {
      window.open(document.web_view_link, '_blank', 'noopener,noreferrer');
    }
  };

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
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center' }}>
          Оберіть документ для перегляду
        </Typography>
      </Box>
    );
  }

  const header = (
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
          Оновлено: {formatDateTime(new Date(document.modified_time))}
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
  );

  let previewSection;
  if (preview?.loading) {
    previewSection = (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          Завантаження попереднього перегляду...
        </Typography>
      </Box>
    );
  } else if (preview?.error) {
    previewSection = (
      <Box
        sx={{
          flex: 1,
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
  } else if (!preview?.url || preview.url === '') {
    previewSection = (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          Неможливо завантажити попередній перегляд
        </Typography>
      </Box>
    );
  } else {
    previewSection = (
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
        }}
      >
        <PdfViewerClient url={preview.url} className="h-full" />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {header}
      {previewSection}
    </Box>
  );
};
