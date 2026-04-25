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
import { filterOverriddenVariables } from '@/utils/filter-overriden-variables';
import { useDictionary } from '@/contexts/LangContext';

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
  const dict = useDictionary();
  const c = dict.documents.constants;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<VariableInfo | null>(null);
  const fullValueDialogRef = useRef<FullValueDialogRef>(null);

  const allConstants = filterOverriddenVariables(variables).filter((v) => v.value !== null);

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
      title: c.clearTitle,
      message: c.clearMessage,
      confirmText: dict.common.delete,
      cancelText: dict.common.cancel,
      severity: 'error',
    });

    if (!confirmed) {
      return;
    }

    try {
      await variablesApi.updateVariable(variableId, { value: null });
      notify(c.clearedSuccess);
      onConstantClear(variableId);
    } catch (error) {
      notify(toErrorMessage(error, c.clearError), 'error');
    }
  };

  const handleDeleteClick = async (variableId: string) => {
    const confirmed = await confirm({
      title: c.deleteTitle,
      message: c.deleteMessage,
      confirmText: dict.common.delete,
      cancelText: dict.common.cancel,
      severity: 'error',
    });

    if (!confirmed) {
      return;
    }

    try {
      await variablesApi.deleteVariable(variableId);
      notify(c.deletedSuccess);
      onConstantDelete(variableId);
    } catch (error) {
      notify(toErrorMessage(error, c.deleteError), 'error');
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
        <Typography variant="h6">{c.title}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          {c.addButton}
        </Button>
      </Box>

      {allConstants.length === 0 ? (
        <Alert severity="info">{c.noData}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{c.variableCol}</TableCell>
                <TableCell>{c.typeCol}</TableCell>
                <TableCell>{c.valueCol}</TableCell>
                <TableCell>{c.scopeCol}</TableCell>
                <TableCell align="right">{c.actionsCol}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allConstants.map((variable) => (
                <TableRow key={variable.id}>
                  <TableCell>
                    <ValueDisplay value={variable.variable} />
                  </TableCell>
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
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      <IconButton size="small" onClick={() => handleEditClick(variable)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleClearClick(variable.id)}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteClick(variable.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
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
