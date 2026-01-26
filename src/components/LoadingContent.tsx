import { Box, CircularProgress } from '@mui/material';
import { FC, memo } from 'react';

interface LoadingContentProps {
  loading: boolean;
  children: React.ReactNode;
}

const LoadingContentComponent: FC<LoadingContentProps> = ({ loading, children }) => {
  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{
          pointerEvents: loading ? 'none' : 'auto',
          transition: 'opacity 0.2s ease',
          filter: loading ? 'grayscale(1) blur(1px)' : 'none',
        }}
      >
        {children}
      </Box>

      {loading && (
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
          <Box sx={{ position: 'sticky', top: '40vh', display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export const LoadingContent = memo(LoadingContentComponent);
