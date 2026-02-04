import { FC, JSX, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Paper,
  Typography,
  Box,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { VariableInfo } from '@/types/variables';
import { ConstantVariableModal } from './ConstantVariableModal';
import { variablesApi } from '@/lib/api';
import { useNotify } from '@/providers/NotificationProvider';
import { useConfirm } from '@/providers/ConfirmProvider';
import { toErrorMessage } from '@/utils/errors-messages';
import { JSONValue } from '@/types/json';
import { FolderTree } from '@/types/documents';

interface ConstantsTableProps {
  scope: string | null;
  folderTree: FolderTree[] | null;
  variables: VariableInfo[];
  onConstantClear: (id: string) => void;
  onConstantDelete: (id: string) => void;
  onConstantEdit: (updatedVariable: VariableInfo) => void;
}

export const ConstantsTable: FC<ConstantsTableProps> = ({
  scope,
  folderTree,
  variables,
  onConstantClear,
  onConstantDelete,
  onConstantEdit,
}) => {
  const notify = useNotify();
  const { confirm } = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<VariableInfo | null>(null);
  const [valueDialogOpen, setValueDialogOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<JSONValue>(null);

  const allConstants = variables.filter((v) => v.value !== null);

  const handleAddClick = async () => {
    setEditingVariable(null);
    setModalOpen(true);
  };

  const handleEditClick = async (variable: VariableInfo) => {
    setEditingVariable(variable);
    setModalOpen(true);
  };

  const handleClearClick = async (variableId: string) => {
    const confirmed = await confirm({
      title: 'Видалити значення',
      message:
        'Ви впевнені, що хочете видалити значення константи? Змінна залишиться в розділі "Збереження значень".',
      confirmText: 'Видалити',
      cancelText: 'Скасувати',
      severity: 'error',
    });

    if (!confirmed) {
      return;
    }

    try {
      await variablesApi.updateVariable(variableId, { value: null });
      notify('Значення константи успішно видалено');
      onConstantClear(variableId);
    } catch (error) {
      notify(toErrorMessage(error, 'Не вдалося видалити значення константи'), 'error');
    }
  };

  const handleDeleteClick = async (variableId: string) => {
    const confirmed = await confirm({
      title: 'Видалити змінну',
      message: 'Ви впевнені, що хочете видалити цю змінну?',
      confirmText: 'Видалити',
      cancelText: 'Скасувати',
      severity: 'error',
    });

    if (!confirmed) {
      return;
    }

    try {
      await variablesApi.deleteVariable(variableId);
      notify('Змінну успішно видалено');
      onConstantDelete(variableId);
    } catch (error) {
      notify(toErrorMessage(error, 'Не вдалося видалити змінну'), 'error');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingVariable(null);
  };

  const handleModalSave = (updatedVariable: VariableInfo) => {
    setModalOpen(false);
    setEditingVariable(null);
    onConstantEdit(updatedVariable);
  };

  const handleValueClick = (value: JSONValue) => {
    const type = getValueType(value);
    if (type === 'json' || (type === 'text' && String(value).length > 50)) {
      setSelectedValue(value);
      setValueDialogOpen(true);
    }
  };

  const getValueType = (value: JSONValue): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') return 'text';
    return 'json';
  };

  const formatValue = (value: JSONValue): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Так' : 'Ні';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const formatShortValue = (value: JSONValue): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Так' : 'Ні';
    if (typeof value === 'object') return '{...}';
    const str = String(value);
    return str.length > 50 ? str.substring(0, 50) + '...' : str;
  };

  const getScopeName = (scopeId: string | null): { name: string; icon: JSX.Element } => {
    if (!scopeId) {
      return { name: 'Глобальний', icon: <FolderIcon fontSize="small" /> };
    }

    if (!folderTree) {
      return { name: scopeId, icon: <FolderIcon fontSize="small" /> };
    }

    const findInTree = (
      items: FolderTree[],
      id: string,
    ): { name: string; icon: JSX.Element } | null => {
      for (const item of items) {
        if (item.current_folder?.id === id) {
          return { name: item.current_folder.name, icon: <FolderIcon fontSize="small" /> };
        }

        if (item.documents) {
          const doc = item.documents.find((d) => d.id === id);
          if (doc) {
            return { name: doc.name, icon: <DocumentIcon fontSize="small" /> };
          }
        }

        if (item.folders) {
          const result = findInTree(item.folders, id);
          if (result) return result;
        }
      }
      return null;
    };

    const result = findInTree(folderTree, scopeId);
    return result || { name: scopeId, icon: <FolderIcon fontSize="small" /> };
  };

  const isClickable = (value: JSONValue): boolean => {
    const type = getValueType(value);
    return type === 'json' || (type === 'text' && String(value).length > 50);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Константи</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Додати константу
        </Button>
      </Box>

      {allConstants.length === 0 ? (
        <Alert severity="info">Немає визначених констант</Alert>
      ) : (
        <TableContainer component={Paper}>
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
              {allConstants.map((variable) => {
                const scopeInfo = getScopeName(variable.scope);
                return (
                  <TableRow key={variable.id}>
                    <TableCell>{variable.variable}</TableCell>
                    <TableCell>
                      <Chip label={getValueType(variable.value)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: isClickable(variable.value) ? 'pointer' : 'default',
                          '&:hover': isClickable(variable.value)
                            ? { textDecoration: 'underline' }
                            : {},
                        }}
                        onClick={() => handleValueClick(variable.value)}
                      >
                        {formatShortValue(variable.value)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {scopeInfo.icon}
                        <Typography variant="body2">{scopeInfo.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEditClick(variable)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleClearClick(variable.id)}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteClick(variable.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConstantVariableModal
        open={modalOpen}
        scope={scope}
        editingVariable={editingVariable}
        existingVariables={variables}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />

      <Dialog
        open={valueDialogOpen}
        onClose={() => setValueDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Значення константи</DialogTitle>
        <DialogContent>
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            }}
          >
            {formatValue(selectedValue)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValueDialogOpen(false)}>Закрити</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
