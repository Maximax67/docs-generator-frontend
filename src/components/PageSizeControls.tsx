import { Box, FormControl, Select, MenuItem, Typography } from '@mui/material';

type PageSizeControlProps = {
  pageSize: number;
  totalItems: number;
  onPageSizeChange: (pageSize: number) => void;
  disabled?: boolean;
  pageSizeOptions?: number[];
};

export function PageSizeControl({
  pageSize,
  totalItems,
  onPageSizeChange,
  disabled = false,
  pageSizeOptions = [10, 25, 50, 100],
}: PageSizeControlProps) {
  return (
    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
      <Typography variant="body2">Елементів на сторінці:</Typography>
      <FormControl size="small" variant="outlined">
        <Select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          disabled={disabled}
        >
          {pageSizeOptions.map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="body2" color="text.secondary">
        Всього: {totalItems}
      </Typography>
    </Box>
  );
}
