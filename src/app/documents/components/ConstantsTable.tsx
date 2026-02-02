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
  Chip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { VariableCompactResponse } from '@/types/variables';
import { ConstantVariableModal } from './ConstntVariableModal';
import { variablesApi } from '@/lib/api';
import { useNotify } from '@/providers/NotificationProvider';
import { toErrorMessage } from '@/utils/errors-messages';
import { JSONValue } from '@/types/json';

interface ConstantsTableProps {
  scope: string | null;
  variables: VariableCompactResponse[];
  onVariableChange: () => void;
}

export const ConstantsTable: FC<ConstantsTableProps> = ({ scope, variables, onVariableChange }) => {
  const notify = useNotify();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<VariableCompactResponse | null>(null);

  const currentScopeConstants = variables.filter((v) => v.value !== null && v.scope === scope);
  const otherScopeConstants = variables.filter((v) => v.value !== null && v.scope !== scope);

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

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Константи</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Додати константу
        </Button>
      </Box>

      {currentScopeConstants.length === 0 && otherScopeConstants.length === 0 ? (
        <Alert severity="info">Немає визначених констант для цього scope</Alert>
      ) : (
        <>
          {currentScopeConstants.length > 0 && (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Назва змінної</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Значення</TableCell>
                    <TableCell align="right">Дії</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentScopeConstants.map((variable) => (
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
                          }}
                        >
                          {formatValue(variable.value)}
                        </Typography>
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
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {otherScopeConstants.length > 0 && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Наступні константи визначені в вищіх scope і будуть перевизначені, якщо ви створите
                константу з такою ж назвою
              </Alert>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Назва змінної</TableCell>
                      <TableCell>Тип</TableCell>
                      <TableCell>Значення</TableCell>
                      <TableCell>Обсяг</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {otherScopeConstants.map((variable) => (
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
                            }}
                          >
                            {formatValue(variable.value)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={variable.scope || 'Глобальний'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </>
      )}

      <ConstantVariableModal
        open={modalOpen}
        scope={scope}
        editingVariable={editingVariable}
        existingVariables={variables}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </Box>
  );
};
