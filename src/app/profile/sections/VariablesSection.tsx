import {
  Stack,
  Typography,
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { JSONValue } from '@/types/json';

type VariablesSectionProps = {
  savedVars: Record<string, JSONValue>;
  onRefresh: () => void;
  onClear: () => void;
  onDelete: (key: string) => void;
};

export default function VariablesSection({
  savedVars,
  onRefresh,
  onClear,
  onDelete,
}: VariablesSectionProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Збережені дані</Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        {Object.keys(savedVars).length !== 0 && (
          <Button variant="outlined" color="warning" onClick={onClear}>
            Очистити все
          </Button>
        )}
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh}>
          Оновити
        </Button>
      </Stack>

      <Box
        sx={{
          bgcolor: 'background.default',
          p: 2,
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Змінна</TableCell>
                <TableCell>Значення</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {/* TODO */}

              {Object.keys(savedVars).length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="body2" color="text.secondary">
                      Немає збережених данних
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          <Stack spacing={1}>
            {/* TODO */}

            {Object.keys(savedVars).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Немає збережених данних
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
}
