import React from 'react';
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
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { VariableInput } from '@/components/VariableInput';
import { DocumentVariable } from '@/types/variables';

type VariablesSectionProps = {
  savedVars: Record<string, string>;
  allVars: Record<string, DocumentVariable>;
  savedDataValues: Record<string, string>;
  isOwnProfile: boolean;
  isTargetUserRestricted: boolean;
  isGod: boolean;
  onRefresh: () => void;
  onClear: () => void;
  onSave: (key: string, val: string) => void;
  onDelete: (key: string) => void;
  onChangeValue: (key: string, val: string) => void;
};

export default function VariablesSection({
  savedVars,
  allVars,
  savedDataValues,
  isOwnProfile,
  isTargetUserRestricted,
  isGod,
  onRefresh,
  onClear,
  onSave,
  onDelete,
  onChangeValue,
}: VariablesSectionProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Збережені дані</Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        {Object.keys(savedVars).length !== 0 && (isOwnProfile || isGod) && (
          <Button variant="outlined" color="warning" onClick={onClear}>
            Очистити все
          </Button>
        )}
        <Button variant="text" startIcon={<RefreshIcon />} onClick={onRefresh}>
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
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Змінна</TableCell>
                <TableCell>Значення</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {Object.entries(savedVars).map(([k, v]) => (
                <TableRow key={k}>
                  <TableCell width={240}>{allVars[k].name}</TableCell>
                  <TableCell>
                    <VariableInput
                      small
                      required
                      view_only={
                        (!isGod && !isOwnProfile) || (isOwnProfile && isTargetUserRestricted)
                      }
                      key={k}
                      variable={allVars[k]}
                      value={savedDataValues[k] || ''}
                      savedValue={v}
                      onChange={(value) => onChangeValue(k, value)}
                      onSave={onSave}
                      onDelete={onDelete}
                    />
                  </TableCell>
                </TableRow>
              ))}

              {Object.keys(savedVars).length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="body2" color="text.secondary">
                      Немає збережених данних
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          <Stack spacing={1}>
            {Object.entries(savedVars).map(([k, v]) => (
              <Box
                key={k}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="subtitle1">{allVars[k].name}</Typography>
                  <VariableInput
                    small
                    required
                    view_only={
                      (!isGod && !isOwnProfile) || (isOwnProfile && isTargetUserRestricted)
                    }
                    key={k}
                    variable={allVars[k]}
                    value={savedDataValues[k] || ''}
                    savedValue={v}
                    onChange={(value) => onChangeValue(k, value)}
                    onSave={onSave}
                    onDelete={onDelete}
                  />
                </Stack>
              </Box>
            ))}

            {Object.keys(savedVars).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Немає збережених данних
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
}
