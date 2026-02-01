import { Box, Pagination as MuiPagination } from '@mui/material';
import { PaginationMetadata } from '@/types/pagination';

type PaginationControlsProps = {
  meta: PaginationMetadata;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export function PaginationControls({
  meta,
  onPageChange,
  disabled = false,
}: PaginationControlsProps) {
  return (
    <Box display="flex" justifyContent="center">
      <MuiPagination
        count={meta.total_pages}
        page={meta.current_page}
        onChange={(_, value) => onPageChange(value)}
        disabled={disabled}
        color="primary"
        showFirstButton
        showLastButton
      />
    </Box>
  );
}
