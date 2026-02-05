import { FC, useRef, useState } from 'react';
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { VariableInfo } from '@/types/variables';
import { ConstantVariableModal } from './ConstantVariableModal';
import { variablesApi } from '@/lib/api';
import { useNotify } from '@/providers/NotificationProvider';
import { useConfirm } from '@/providers/ConfirmProvider';
import { toErrorMessage } from '@/utils/errors-messages';
import { FolderTreeGlobal } from '@/types/documents';
import { VariableTypeBadge } from '@/components/VariableTypeBadge';
import { ValueDisplay } from '@/components/ValueDisplay';
import { FullValueDialog, FullValueDialogRef } from '@/components/FullValueDialog';
import { JSONValue } from '@/types/json';
import { ScopeBadge } from '@/components/ScopeBadge';

interface ConstantsTableProps {
  scope: string | null;
  folderTree: FolderTreeGlobal | null;
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
  const fullValueDialogRef = useRef<FullValueDialogRef>(null);

  const allConstants = variables.filter((v) => v.value !== null);

  const showFullValue = (value: JSONValue) => {
    fullValueDialogRef.current?.open(value);
  };

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
              {allConstants.map((variable) => (
                <TableRow key={variable.id}>
                  <TableCell>{variable.variable}</TableCell>
                  <TableCell>
                    <VariableTypeBadge value={variable.value} />
                  </TableCell>
                  <TableCell>
                    <ValueDisplay value={variable.value} onClick={showFullValue} />
                  </TableCell>
                  <TableCell>
                    <ScopeBadge folderTree={folderTree} scope={variable.scope} />
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
              ))}
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

      <FullValueDialog ref={fullValueDialogRef} />
    </Box>
  );
};
