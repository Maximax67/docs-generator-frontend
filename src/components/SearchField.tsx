import { TextField, IconButton, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { ChangeEvent, KeyboardEvent, useState, useEffect } from 'react';

type SearchFieldProps = {
  value: string;
  onSearch: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
};

export function SearchField({
  value,
  onSearch,
  label = 'Пошук',
  placeholder,
  disabled = false,
  fullWidth = true,
}: SearchFieldProps) {
  const [input, setInput] = useState(value);

  useEffect(() => {
    setInput(value);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const performSearch = () => {
    const normalized = input.trim();
    if (normalized !== value.trim()) {
      onSearch(normalized);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const handleBlur = () => {
    performSearch();
  };

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      variant="outlined"
      value={input}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      disabled={disabled}
      fullWidth={fullWidth}
      slotProps={{
        input: {
          endAdornment: input.trim() !== value.trim() && (
            <InputAdornment position="end">
              <IconButton onClick={performSearch} edge="end" aria-label="Шукати" size="small">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
