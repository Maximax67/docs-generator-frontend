import { FC } from 'react';
import {
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  FormControlLabel,
} from '@mui/material';

interface GenerationVariablesControlsControlsProps {
  variableView: 'table' | 'json';
  showConstants: boolean;
  setVariableView: (value: 'table' | 'json') => void;
  setShowConstants: (value: boolean) => void;
}

export const GenerationVariablesControls: FC<GenerationVariablesControlsControlsProps> = ({
  variableView,
  showConstants,
  setVariableView,
  setShowConstants,
}) => {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      mb={1}
      gap={2}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
    >
      <Typography variant="h5">Відображення змінних:</Typography>

      <ToggleButtonGroup
        value={variableView}
        exclusive
        onChange={(_, value) => value && setVariableView(value)}
        size="small"
        fullWidth
        sx={{ width: { xs: '100%', sm: 'auto' } }}
      >
        <ToggleButton value="table" sx={{ flex: 1, px: 2 }}>
          Таблиця
        </ToggleButton>
        <ToggleButton value="json" sx={{ flex: 1, px: 2 }}>
          JSON
        </ToggleButton>
      </ToggleButtonGroup>

      <FormControlLabel
        control={
          <Checkbox
            checked={showConstants}
            onChange={(e) => setShowConstants(e.target.checked)}
            size="small"
          />
        }
        label="Константи"
      />
    </Stack>
  );
};
