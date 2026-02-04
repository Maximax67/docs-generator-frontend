import { Chip, ChipProps } from '@mui/material';
import { JSONValue } from '@/types/json';

type ValueType = 'Null' | 'Boolean' | 'Number' | 'Text' | 'JSON';

interface VariableTypeBadgeProps {
  value: JSONValue;
  size?: 'small' | 'medium';
}

const getValueType = (value: JSONValue): ValueType => {
  if (value === null || value === undefined) return 'Null';
  if (typeof value === 'boolean') return 'Boolean';
  if (typeof value === 'number') return 'Number';
  if (typeof value === 'string') return 'Text';
  return 'JSON';
};

const typeColors: Record<ValueType, ChipProps['color']> = {
  Null: 'default',
  Boolean: 'primary',
  Number: 'success',
  Text: 'info',
  JSON: 'warning',
};

export const VariableTypeBadge = ({ value, size = 'small' }: VariableTypeBadgeProps) => {
  const type = getValueType(value);
  return <Chip label={type} size={size} color={typeColors[type]} />;
};
