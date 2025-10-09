'use client';

import { FC } from 'react';
import { validateVariableValue } from '@/lib/validation';
import { DocumentVariable, VariableType, VariableTypeNames } from '@/types/variables';
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

interface GenerationVariablesProps {
  variables: Record<string, string>;
  allVars: Record<string, DocumentVariable>;
  showConstants: boolean;
  fullWidth?: boolean;
  view: 'table' | 'json';
}

export const GenerationVariables: FC<GenerationVariablesProps> = ({
  variables,
  allVars,
  fullWidth,
  view,
  showConstants,
}) => {
  const filteredVariables = Object.fromEntries(
    Object.entries(variables).filter(([name]) => {
      const variableMeta = allVars[name];
      if (!showConstants && variableMeta?.type === VariableType.CONSTANT) {
        return false;
      }
      return true;
    }),
  );

  if (view === 'json') {
    return (
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          fontFamily: 'monospace',
          fontSize: 13,
          overflowX: 'auto',
        }}
      >
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {JSON.stringify(filteredVariables, null, 2)}
        </pre>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1.5, overflowX: 'auto' }}>
      <Table size="small" sx={fullWidth ? {} : { tableLayout: 'auto', width: 'auto' }}>
        <TableHead>
          <TableRow>
            <TableCell>Змінна</TableCell>
            <TableCell>Тип</TableCell>
            <TableCell>Значення</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(filteredVariables).map(([variableName, value]) => {
            const variableMeta = allVars[variableName];
            const validationError = variableMeta
              ? validateVariableValue(variableMeta, value)
              : 'Змінна не існує';
            const displayName = variableMeta ? variableMeta.name : variableName;
            const type = variableMeta?.type ? VariableTypeNames[variableMeta.type] : '?';

            return (
              <TableRow key={variableName}>
                <TableCell>
                  {validationError && (
                    <span title={validationError}>
                      <ErrorIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                    </span>
                  )}
                  {displayName}
                </TableCell>
                <TableCell>{type}</TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};
