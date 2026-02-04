import { FC, useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { VariableInfo } from '@/types/variables';
import { variablesApi } from '@/lib/api';
import { useNotify } from '@/providers/NotificationProvider';
import { toErrorMessage } from '@/utils/errors-messages';
import { JSONValue } from '@/types/json';
import deepEqual from 'fast-deep-equal';

const formatValue = (value: JSONValue): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Так' : 'Ні';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const truncate = (str: string, max = 80): string =>
  str.length > max ? str.slice(0, max) + '…' : str;

interface SaveCandidate {
  id: string;
  variable: string;
  currentValue: JSONValue;
  savedValue: JSONValue;
  isChanged: boolean;
}

interface SaveVariablesModalProps {
  open: boolean;
  variables: VariableInfo[];
  formValues: Record<string, JSONValue>;
  onClose: () => void;
  onSaved: () => void;
}

export const SaveVariablesModal: FC<SaveVariablesModalProps> = ({
  open,
  variables,
  formValues,
  onClose,
  onSaved,
}) => {
  const notify = useNotify();
  const [saving, setSaving] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const candidates: SaveCandidate[] = useMemo(() => {
    return variables
      .filter((v): v is VariableInfo & { id: string } =>
        Boolean(v.allow_save && v.id && v.variable in formValues),
      )
      .map((v) => {
        const currentValue = formValues[v.variable];
        const isChanged = !deepEqual(currentValue, v.saved_value);
        return {
          id: v.id,
          variable: v.variable,
          currentValue,
          savedValue: v.saved_value,
          isChanged,
        };
      });
  }, [variables, formValues]);

  useEffect(() => {
    if (!open) return;
    const autoChecked = new Set(candidates.filter((c) => c.isChanged).map((c) => c.id));
    setChecked(autoChecked);
  }, [open, candidates]);

  if (candidates.length === 0) return null;

  const toggleOne = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const toggleAll = () => {
    if (checked.size === candidates.length) {
      setChecked(new Set());
    } else {
      setChecked(new Set(candidates.map((c) => c.id)));
    }
  };

  const handleSave = async () => {
    const payload = candidates
      .filter((c) => checked.has(c.id))
      .map((c) => ({ id: c.id, value: c.currentValue }));

    if (payload.length === 0) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      await variablesApi.saveVariables(payload);
      notify({ message: 'Зміни успішно збережені', severity: 'success' });
      onSaved();
    } catch (err) {
      notify({ message: toErrorMessage(err, 'Не вдалося зберегти зміни'), severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const allChecked = checked.size === candidates.length;
  const someChecked = checked.size > 0 && !allChecked;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Зберегти значення?</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Оберіть змінні, значення яких ви хочете зберегти для наступних генерацій.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 0.5,
            borderBottom: 1,
            borderColor: 'divider',
            mb: 1,
          }}
        >
          <Checkbox
            indeterminate={someChecked}
            checked={allChecked}
            onChange={toggleAll}
            disabled={saving}
            size="small"
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Змінна
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ width: 120, textAlign: 'right' }}
          >
            Поточне значення
          </Typography>
        </Box>

        {candidates.map((c, idx) => (
          <Box key={c.id}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 0.75,
                cursor: saving ? 'default' : 'pointer',
              }}
              onClick={() => !saving && toggleOne(c.id)}
            >
              <Checkbox
                checked={checked.has(c.id)}
                onChange={() => toggleOne(c.id)}
                disabled={saving}
                size="small"
                // eat the click so the row onClick doesn't double-toggle
                onClick={(e) => e.stopPropagation()}
              />

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {c.variable}
                </Typography>

                {c.isChanged && c.savedValue !== null && c.savedValue !== undefined && (
                  <Typography variant="caption" color="text.secondary">
                    Було: {truncate(formatValue(c.savedValue))}
                  </Typography>
                )}

                {c.isChanged && (c.savedValue === null || c.savedValue === undefined) && (
                  <Typography variant="caption" color="warning.main">
                    Ще не зберегано
                  </Typography>
                )}
              </Box>

              <Typography
                variant="body2"
                sx={{ width: 120, textAlign: 'right', fontFamily: 'monospace', fontSize: '0.8rem' }}
              >
                {truncate(formatValue(c.currentValue), 18)}
              </Typography>
            </Box>

            {idx < candidates.length - 1 && <Divider />}
          </Box>
        ))}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Пропустити
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || checked.size === 0}
          startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
        >
          {saving ? 'Збереження…' : `Зберегти (${checked.size})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
