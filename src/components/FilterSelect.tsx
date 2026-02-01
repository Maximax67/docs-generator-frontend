import {
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  InputLabel,
  SxProps,
  Theme,
} from '@mui/material';
import { useId } from 'react';

export type FilterOption = {
  value: string;
  label: string;
};

type FilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  disabled?: boolean;
  minWidth?: number | string;
  label?: string;
  sx?: SxProps<Theme>;
};

export function FilterSelect({
  value,
  onChange,
  options,
  disabled = false,
  minWidth = 200,
  label,
  sx,
}: FilterSelectProps) {
  const handleChange = (e: SelectChangeEvent) => {
    onChange(e.target.value);
  };

  const id = useId();
  const labelId = label ? `filter-select-label-${id}` : undefined;

  return (
    <FormControl variant="outlined" disabled={disabled} sx={{ minWidth, ...sx }}>
      {label && <InputLabel id={labelId}>{label}</InputLabel>}
      <Select labelId={labelId} value={value} onChange={handleChange} label={label}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
