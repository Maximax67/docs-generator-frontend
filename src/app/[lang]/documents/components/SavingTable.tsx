import { FC, useState } from 'react';
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
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { VariableInfo } from '@/types/variables';
import { SavingVariableModal } from './SavingVariableModal';
import { variablesApi } from '@/lib/api';
import { useNotify } from '@/providers/NotificationProvider';
import { useConfirm } from '@/providers/ConfirmProvider';
import { toErrorMessage } from '@/utils/errors-messages';
import { FolderTreeGlobal } from '@/types/documents';
import { ScopeBadge } from '@/components/ScopeBadge';
import { ValueDisplay } from '@/components/ValueDisplay';
import { filterOverriddenVariables } from '@/utils/filter-overriden-variables';
import { useDictionary } from '@/contexts/LangContext';

interface SavingTableProps {
  scope: string | null;
  folderTree: FolderTreeGlobal | null;
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
  const dict = useDictionary();
  const sv = dict.documents.savingVars;

  const [modalOpen, setModalOpen] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);

  const savingVariables = filterOverriddenVariables(variables).filter((v) => v.value === null);

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
      notify(toErrorMessage(error, sv.toggleError), 'error');
    } finally {
      setSavingToggle(false);
    }
  };

  const handleDeleteClick = async (variable: VariableInfo) => {
    const hasValidation =
      variable.validation_schema && Object.keys(variable.validation_schema).length > 0;

    const message = hasValidation
      ? sv.deleteWithSchemaMessage.replace('{name}', variable.variable)
      : sv.deleteMessage.replace('{name}', variable.variable);

    const confirmed = await confirm({
      title: sv.deleteTitle,
      message,
      confirmText: dict.common.delete,
      cancelText: dict.common.cancel,
      severity: 'error',
    });

    if (!confirmed) {
      return;
    }

    try {
      await variablesApi.deleteVariable(variable.id);
      notify(sv.deletedSuccess);
      onDeleteVariable(variable.id);
    } catch (error) {
      notify(toErrorMessage(error, dict.documents.constants.deleteError), 'error');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{sv.title}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          {sv.addButton}
        </Button>
      </Box>

      {savingVariables.length === 0 ? (
        <Alert severity="info">{sv.noData}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{sv.variableCol}</TableCell>
                <TableCell>{sv.scopeCol}</TableCell>
                <TableCell>{sv.allowSaveCol}</TableCell>
                <TableCell align="right">{sv.actionsCol}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {savingVariables.map((variable) => (
                <TableRow key={variable.id}>
                  <TableCell>
                    <ValueDisplay value={variable.variable} />
                  </TableCell>
                  <TableCell>
                    <ScopeBadge folderTree={folderTree} scope={variable.scope} />
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
              ))}
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
