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
  Alert,
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { JSONValue } from '@/types/json';
import { SavedVariable } from '@/types/variables';
import { Paginated } from '@/types/pagination';
import { useRef, useState } from 'react';
import { EditVariableDialog } from '../dialogs/EditVariableDialog';
import { PaginationControls } from '@/components/PaginationControls';
import { LoadingContent } from '@/components/LoadingContent';
import { VariableTypeBadge } from '@/components/VariableTypeBadge';
import { ValueDisplay } from '@/components/ValueDisplay';
import { FullValueDialog, FullValueDialogRef } from '@/components/FullValueDialog';
import { FolderTreeGlobal } from '@/types/documents';
import { ScopeBadge } from '@/components/ScopeBadge';

type VariablesSectionProps = {
  savedVars: Paginated<SavedVariable> | null;
  folderTree: FolderTreeGlobal | null;
  loading: boolean;
  onRefresh: () => void;
  onClear: () => void;
  onDelete: (variableId: string) => void;
  onUpdate: (variableId: string, value: JSONValue) => void;
  onPageChange: (page: number) => void;
};

export default function VariablesSection({
  savedVars,
  folderTree,
  loading,
  onRefresh,
  onClear,
  onDelete,
  onUpdate,
  onPageChange,
}: VariablesSectionProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<SavedVariable | null>(null);
  const fullValueDialogRef = useRef<FullValueDialogRef>(null);

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
      onUpdate(editingVariable.variable.id, newValue);
    }
  };

  const showFullValue = (value: JSONValue) => {
    fullValueDialogRef.current?.open(value);
  };

  const totalItems = savedVars?.meta.total_items ?? 0;

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

      <Divider />

      {!savedVars || savedVars.data.length === 0 ? (
        <Alert severity="info">Немає збережених данних</Alert>
      ) : (
        <>
          <LoadingContent loading={loading} sx={{ mb: 2 }}>
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
                      <TableCell>Тип</TableCell>
                      <TableCell>Значення</TableCell>
                      <TableCell>Scope</TableCell>
                      <TableCell align="right">Дії</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {savedVars.data.map((savedVar) => (
                      <TableRow key={savedVar.variable.id}>
                        <TableCell>
                          <ValueDisplay value={savedVar.variable.variable} />
                        </TableCell>
                        <TableCell>
                          <VariableTypeBadge value={savedVar.value} />
                        </TableCell>
                        <TableCell>
                          <ValueDisplay value={savedVar.value} onClick={showFullValue} />
                        </TableCell>
                        <TableCell>
                          <ScopeBadge folderTree={folderTree} scope={savedVar.variable.scope} />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(savedVar)}
                            disabled={loading}
                            title="Редагувати"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(savedVar.variable.id)}
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
                  {savedVars.data.map((savedVar) => (
                    <Box
                      key={savedVar.variable.id}
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                      }}
                    >
                      <Stack spacing={1}>
                        <Typography variant="subtitle2">{savedVar.variable.variable}</Typography>
                        <Box>
                          <VariableTypeBadge value={savedVar.value} />
                        </Box>
                        <Box>
                          <ValueDisplay value={savedVar.value} onClick={showFullValue} />
                        </Box>
                        <ScopeBadge folderTree={folderTree} scope={savedVar.variable.scope} />
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(savedVar)}
                            disabled={loading}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(savedVar.variable.id)}
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
            </Box>
          </LoadingContent>

          <PaginationControls
            meta={savedVars.meta}
            onPageChange={onPageChange}
            disabled={loading}
          />
        </>
      )}

      {editingVariable && (
        <EditVariableDialog
          open={editDialogOpen}
          variable={editingVariable.variable}
          value={editingVariable.value}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      )}

      <FullValueDialog ref={fullValueDialogRef} />
    </Stack>
  );
}
