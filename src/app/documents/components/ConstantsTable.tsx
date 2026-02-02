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
  Delete as DeleteIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { VariableCompactResponse } from '@/types/variables';
import { ConstantVariableModal } from './ConstantVariableModal';
import { variablesApi } from '@/lib/api';
import { useNotify } from '@/providers/NotificationProvider';
import { toErrorMessage } from '@/utils/errors-messages';
import { JSONValue } from '@/types/json';
import { FolderTree } from '@/types/documents';

interface ConstantsTableProps {
  scope: string | null;
  scopeName: string;
  folderTree: FolderTree[] | null;
  variables: VariableCompactResponse[];
  onVariableChange: () => void;
}

export const ConstantsTable: FC<ConstantsTableProps> = ({
  scope,
  scopeName,
  folderTree,
  variables,
  onVariableChange,
}) => {
  const notify = useNotify();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<VariableCompactResponse | null>(null);
  const [valueDialogOpen, setValueDialogOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<JSONValue>(null);

  const allConstants = variables.filter((v) => v.value !== null);

  const handleAddClick = () => {
    setEditingVariable(null);
    setModalOpen(true);
  };

  const handleEditClick = (variable: VariableCompactResponse) => {
    setEditingVariable(variable);
    setModalOpen(true);
  };

  const handleDeleteClick = async (variableId: string) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю константу?')) {
      return;
    }

    try {
      await variablesApi.deleteVariable(variableId);
      notify({ message: 'Константу успішно видалено', severity: 'success' });
      onVariableChange();
    } catch (error) {
      notify({
        message: toErrorMessage(error, 'Не вдалося видалити константу'),
        severity: 'error',
      });
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingVariable(null);
  };

  const handleModalSave = () => {
    setModalOpen(false);
    setEditingVariable(null);
    onVariableChange();
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
                  <TableRow key={variable.id.toString()}>
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
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(variable.id.toString())}
                      >
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
        scopeName={scopeName}
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
