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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { toErrorMessage } from '@/utils/errors-messages';
import { FolderTree } from '@/types/documents';

interface SavingTableProps {
  scope: string | null;
  folderTree: FolderTree[] | null;
  variables: VariableInfo[];
  requiredVariables: string[];
  onVariableChange: () => void;
}

export const SavingTable: FC<SavingTableProps> = ({
  scope,
  folderTree,
  variables,
  requiredVariables,
  onVariableChange,
}) => {
  const notify = useNotify();

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<VariableInfo | null>(null);

  // ── Optimistic toggle state (id → boolean) ──────────────────────────────
  // We keep a local override map so the toggle flips instantly while the
  // request is in-flight.  On success we call onVariableChange() which
  // reloads the full list and the map entry is no longer needed.
  const [allowSaveOverrides, setAllowSaveOverrides] = useState<Record<string, boolean>>({});

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

  const handleModalSave = () => {
    setModalOpen(false);
    onVariableChange();
  };

  const handleAllowSaveToggle = async (variable: VariableInfo) => {
    const currentValue =
      variable.id in allowSaveOverrides ? allowSaveOverrides[variable.id] : variable.allow_save;

    const newValue = !currentValue;

    setAllowSaveOverrides((prev) => ({ ...prev, [variable.id]: newValue }));

    try {
      await variablesApi.updateVariable(variable.id.toString(), {
        variable: variable.variable,
        scope: variable.scope,
        value: null,
        validation_schema: variable.validation_schema,
        required: requiredVariables.includes(variable.variable),
        allow_save: newValue,
      });
      onVariableChange();
    } catch (error) {
      // Revert optimistic change on failure.
      setAllowSaveOverrides((prev) => {
        const next = { ...prev };
        delete next[variable.id];
        return next;
      });
      notify({ message: toErrorMessage(error), severity: 'error' });
    }
  };

  const handleDeleteClick = (variable: VariableInfo) => {
    setPendingDelete(variable);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    setConfirmOpen(false);

    try {
      await variablesApi.deleteVariable(pendingDelete.id.toString());
      notify({ message: 'Змінну успішно видалено', severity: 'success' });
      onVariableChange();
    } catch (error) {
      notify({
        message: toErrorMessage(error, 'Не вдалося видалити змінну'),
        severity: 'error',
      });
    } finally {
      setPendingDelete(null);
    }
  };

  /** Cancel handler – just close the dialog. */
  const handleDeleteCancel = () => {
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  /** Does this variable carry a non-empty validation_schema? */
  const hasValidation = (v: VariableInfo): boolean => {
    if (!v.validation_schema) return false;
    return Object.keys(v.validation_schema).length > 0;
  };

  /** Resolve the effective allow_save value (optimistic override first). */
  const getEffectiveAllowSave = (v: VariableInfo): boolean => {
    return v.id in allowSaveOverrides ? allowSaveOverrides[v.id] : v.allow_save;
  };

  // ---------------------------------------------------------------------------
  // JSX
  // ---------------------------------------------------------------------------

  return (
    <Box sx={{ p: 2 }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Збереження значень</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
          Додати змінну
        </Button>
      </Box>

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {savingVariables.length === 0 ? (
        <Alert severity="info">Немає змінних для збереження</Alert>
      ) : (
        /* ── Table ─────────────────────────────────────────────────────── */
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
                const allowSave = getEffectiveAllowSave(variable);

                return (
                  <TableRow key={variable.id.toString()}>
                    {/* Variable name */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {variable.variable}
                      </Typography>
                    </TableCell>

                    {/* Scope badge */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {scopeInfo.icon}
                        <Typography variant="body2">{scopeInfo.name}</Typography>
                      </Box>
                    </TableCell>

                    {/* allow_save toggle */}
                    <TableCell>
                      <Switch
                        size="small"
                        checked={allowSave}
                        onChange={() => handleAllowSaveToggle(variable)}
                        color="primary"
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleDeleteClick(variable)}>
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

      {/* ── Add-variable modal ──────────────────────────────────────────── */}
      <SavingVariableModal
        open={modalOpen}
        scope={scope}
        existingVariables={variables}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
      />

      {/* ── Delete-confirmation dialog ──────────────────────────────────── */}
      <Dialog open={confirmOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Видалити змінну</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Ви впевнені, що хочете видалити змінну{' '}
            <Typography component="span" sx={{ fontWeight: 700 }}>
              &quot;{pendingDelete?.variable}&quot;
            </Typography>
            ?
          </Typography>

          {/* Extra note when validation schema will be lost */}
          {pendingDelete && hasValidation(pendingDelete) && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Ця змінна має схему валідації. При видаленні схема валідації також буде видалена.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Скасувати</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
