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
  IconButton,
  Chip,
  Pagination,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { JSONValue } from '@/types/json';
import { SavedVariable } from '@/types/variables';
import { Paginated } from '@/types/pagination';
import { useState } from 'react';
import { EditVariableDialog } from '../dialogs/EditVariableDialog';
import { formatDateTime } from '@/utils/dates';

type VariablesSectionProps = {
  savedVars: Paginated<SavedVariable> | null;
  loading: boolean;
  onRefresh: () => void;
  onClear: () => void;
  onDelete: (key: string) => void;
  onUpdate: (key: string, value: JSONValue) => void;
  onPageChange: (page: number) => void;
};

export default function VariablesSection({
  savedVars,
  loading,
  onRefresh,
  onClear,
  onDelete,
  onUpdate,
  onPageChange,
}: VariablesSectionProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<SavedVariable | null>(null);

  const handleEdit = (variable: SavedVariable) => {
    setEditingVariable(variable);
    setEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    setEditDialogOpen(false);
    setEditingVariable(null);
  };

  const handleSaveEdit = (newValue: JSONValue) => {
    if (editingVariable) {
      onUpdate(editingVariable.variable, newValue);
    }
  };

  const renderValue = (value: JSONValue): React.ReactNode => {
    if (value === null) return <Chip label="null" size="small" />;
    if (typeof value === 'boolean') return <Chip label={value.toString()} size="small" />;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      return value.length > 50 ? `${value.substring(0, 50)}...` : value;
    }
    if (Array.isArray(value)) {
      return <Chip label={`Масив (${value.length})`} size="small" color="primary" />;
    }
    if (typeof value === 'object') {
      return <Chip label="Об'єкт" size="small" color="secondary" />;
    }
    return '-';
  };

  const totalItems = savedVars?.meta.total_items ?? 0;
  const currentPage = savedVars?.meta.current_page ?? 1;
  const totalPages = savedVars?.meta.total_pages ?? 1;

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Збережені дані</Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        {totalItems > 0 && (
          <Button variant="outlined" color="warning" onClick={onClear} disabled={loading}>
            Очистити все
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={loading}
        >
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
        {totalItems === 0 ? (
          <Alert severity="info">Немає збережених данних</Alert>
        ) : (
          <>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Змінна</TableCell>
                    <TableCell>Значення</TableCell>
                    <TableCell>Оновлено</TableCell>
                    <TableCell align="right">Дії</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {savedVars?.data.map((variable) => (
                    <TableRow key={variable.variable}>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {variable.variable}
                        </Typography>
                      </TableCell>
                      <TableCell>{renderValue(variable.value)}</TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(new Date(variable.updated_at))}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(variable)}
                          disabled={loading}
                          title="Редагувати"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(variable.variable)}
                          disabled={loading}
                          title="Видалити"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              <Stack spacing={1}>
                {savedVars?.data.map((variable) => (
                  <Box
                    key={variable.variable}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" fontFamily="monospace">
                        {variable.variable}
                      </Typography>
                      <Box>{renderValue(variable.value)}</Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(new Date(variable.updated_at))}
                      </Typography>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(variable)}
                          disabled={loading}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(variable.variable)}
                          disabled={loading}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>

            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => onPageChange(page)}
                  disabled={loading}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>

      {editingVariable && (
        <EditVariableDialog
          open={editDialogOpen}
          variableId={editingVariable.variable}
          variableName={editingVariable.variable}
          currentValue={editingVariable.value}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      )}
    </Stack>
  );
}
