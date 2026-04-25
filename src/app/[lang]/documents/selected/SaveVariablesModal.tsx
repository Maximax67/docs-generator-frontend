import { FC, useEffect, useState } from 'react';
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
import { variablesApi } from '@/lib/api';
import { useNotify } from '@/providers/NotificationProvider';
import { toErrorMessage } from '@/utils/errors-messages';
import { JSONValue } from '@/types/json';
import { ValueDisplay } from '@/components/ValueDisplay';
import { useDictionary } from '@/contexts/LangContext';

export interface SaveCandidate {
  id: string;
  variable: string;
  currentValue: JSONValue;
  savedValue: JSONValue;
  isChanged: boolean;
}

interface SaveVariablesModalProps {
  open: boolean;
  candidates: SaveCandidate[];
  onClose: () => void;
  onSaved: () => void;
}

export const SaveVariablesModal: FC<SaveVariablesModalProps> = ({
  open,
  candidates,
  onClose,
  onSaved,
}) => {
  const notify = useNotify();
  const dict = useDictionary();
  const sv = dict.documents.saveVariables;

  const [saving, setSaving] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    const autoChecked = new Set(candidates.filter((c) => c.isChanged).map((c) => c.id));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChecked(autoChecked);
  }, [open, candidates]);

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
      notify(sv.savedSuccess);
      onSaved();
    } catch (err) {
      notify(toErrorMessage(err, sv.saveError), 'error');
    } finally {
      setSaving(false);
    }
  };

  const allChecked = checked.size === candidates.length;
  const someChecked = checked.size > 0 && !allChecked;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{sv.title}</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {sv.description}
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
            {sv.variableCol}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ width: 120, textAlign: 'right' }}
          >
            {sv.currentValueCol}
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
                onClick={(e) => e.stopPropagation()}
              />

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {c.variable}
                </Typography>

                {c.isChanged && c.savedValue !== null && c.savedValue !== undefined && (
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {sv.was}
                    </Typography>
                    <ValueDisplay value={c.savedValue} />
                  </Box>
                )}

                {c.isChanged && (c.savedValue === null || c.savedValue === undefined) && (
                  <Typography variant="caption" color="warning.main">
                    {sv.notSaved}
                  </Typography>
                )}
              </Box>

              <Box sx={{ width: 120, textAlign: 'right' }}>
                <ValueDisplay value={c.currentValue} maxLength={18} />
              </Box>
            </Box>

            {idx < candidates.length - 1 && <Divider />}
          </Box>
        ))}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {sv.skip}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || checked.size === 0}
          startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
        >
          {saving ? dict.common.saving : sv.save.replace('{count}', checked.size.toString())}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
