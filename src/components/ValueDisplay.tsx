import { Typography } from '@mui/material';
import { JSONValue } from '@/types/json';

interface ValueDisplayProps {
  value: JSONValue;
  maxLength?: number;
  onClick?: (value: JSONValue) => void;
}

const formatShortValue = (value: JSONValue, maxLength: number) => {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? 'Так' : 'Ні';
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return '[...]';
    }

    return '{...}';
  }

  const str = String(value);
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};

export const ValueDisplay = ({ value, maxLength = 20, onClick }: ValueDisplayProps) => {
  const clickable =
    onClick &&
    ((typeof value === 'object' && value !== null) ||
      (typeof value === 'string' && value.length > maxLength));

  return (
    <Typography
      variant="body2"
      sx={{
        maxWidth: 300,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        cursor: clickable ? 'pointer' : 'default',
        '&:hover': clickable ? { textDecoration: 'underline' } : {},
      }}
      onClick={() => clickable && onClick(value)}
    >
      {formatShortValue(value, maxLength)}
    </Typography>
  );
};
