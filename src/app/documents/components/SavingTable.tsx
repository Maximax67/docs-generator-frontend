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
  Switch,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { VariableInfo } from '@/types/variables';
import { SavingVariableModal } from './SavingVariableModal';
import { variablesApi } from '@/lib/api';
import { useNotify } from '@/providers/NotificationProvider';
import { useConfirm } from '@/providers/ConfirmProvider';
import { toErrorMessage } from '@/utils/errors-messages';
import { FolderTree } from '@/types/documents';

interface SavingTableProps {
  scope: string | null;
  folderTree: FolderTree[] | null;
  variables: VariableInfo[];
  onChangeSave: (id: string, value: boolean) => void;
  onAddVariable: (variable: VariableInfo) => void;
  onDeleteVariable: (id: string) => void;
}

export const SavingTable: FC<SavingTableProps> = ({
  scope,
  folderTree,
  variables,
  onChangeSave,
  onAddVariable,
  onDeleteVariable,
}) => {
  const notify = useNotify();
  const { confirm } = useConfirm();

  const [modalOpen, setModalOpen] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);

  const savingVariables = variables.filter((v) => v.value === null);

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

  const handleAddClick = async () => {
    setModalOpen(true);
  };

  const handleModalAddVariable = (variable: VariableInfo) => {
    setModalOpen(false);
    onAddVariable(variable);
  };

  const handleAllowSaveToggle = async (variable: VariableInfo) => {
    const newValue = !variable.allow_save;

    setSavingToggle(true);

    try {
      await variablesApi.updateVariable(variable.id, {
        allow_save: newValue,
      });
      onChangeSave(variable.id, newValue);
    } catch (error) {
      notify(toErrorMessage(error), 'error');
    } finally {
      setSavingToggle(false);
    }
  };

  const handleDeleteClick = async (variable: VariableInfo) => {
    const hasValidation =
      variable.validation_schema && Object.keys(variable.validation_schema).length > 0;

    const message = hasValidation
      ? `Ви впевнені, що хочете видалити змінну "${variable.variable}"? Ця змінна має схему валідації. При видаленні схема валідації також буде видалена.`
      : `Ви впевнені, що хочете видалити змінну "${variable.variable}"?`;

    const confirmed = await confirm({
      title: 'Видалити змінну',
      message,
      confirmText: 'Видалити',
      cancelText: 'Скасувати',
      severity: 'error',
    });

    if (!confirmed) {
      return;
    }

    try {
      await variablesApi.deleteVariable(variable.id);
      notify('Змінну успішно видалено');
      onDeleteVariable(variable.id);
    } catch (error) {
      notify(toErrorMessage(error, 'Не вдалося видалити змінну'), 'error');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Збереження значень</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Додати змінну
        </Button>
      </Box>

      {savingVariables.length === 0 ? (
        <Alert severity="info">Немає змінних для збереження</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Змінна</TableCell>
                <TableCell>Scope</TableCell>
                <TableCell>Дозволити збереження</TableCell>
                <TableCell align="right">Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {savingVariables.map((variable) => {
                const scopeInfo = getScopeName(variable.scope);

                return (
                  <TableRow key={variable.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {variable.variable}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {scopeInfo.icon}
                        <Typography variant="body2">{scopeInfo.name}</Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Switch
                        size="small"
                        checked={variable.allow_save}
                        onChange={() => handleAllowSaveToggle(variable)}
                        disabled={savingToggle}
                        color="primary"
                      />
                    </TableCell>

                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(variable)}
                        disabled={savingToggle}
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

      <SavingVariableModal
        open={modalOpen}
        scope={scope}
        existingVariables={variables}
        onClose={() => setModalOpen(false)}
        onAddVariable={handleModalAddVariable}
      />
    </Box>
  );
};
