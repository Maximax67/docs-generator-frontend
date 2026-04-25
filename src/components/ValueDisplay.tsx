import { Typography } from '@mui/material';
import { JSONValue } from '@/types/json';
import { useDictionary } from '@/contexts/LangContext';

interface ValueDisplayProps {
  value: JSONValue;
  maxLength?: number;
  onClick?: (value: JSONValue) => void;
}

const formatShortValue = (value: JSONValue, maxLength: number, yes: string, no: string) => {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? yes : no;
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
  const dict = useDictionary();
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
      {formatShortValue(value, maxLength, dict.common.yes, dict.common.no)}
    </Typography>
  );
};
