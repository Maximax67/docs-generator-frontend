import { FC, useEffect, useRef, useState } from 'react';
import deepEqual from 'fast-deep-equal';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Button,
} from '@mui/material';
import { AccessLevel, ScopeSettings } from '@/types/scopes';

interface ScopeSettingsTabProps {
  driveId: string;
  isFolder: boolean;
  initialSettings: ScopeSettings | null;
  setupOnly?: boolean;
  onChange: (settings: ScopeSettings | null) => void;
}

const accessLevelLabels: Record<AccessLevel, string> = {
  [AccessLevel.ANY]: 'Усі користувачі',
  [AccessLevel.AUTHENTICATED]: 'Авторизовані користувачі',
  [AccessLevel.VERIFIED]: 'Підтверджена пошта',
  [AccessLevel.ADMIN]: 'Адміністратори',
};

const DEFAULT_SETTINGS = (driveId: string): ScopeSettings => ({
  drive_id: driveId,
  is_pinned: false,
  restrictions: {
    access_level: AccessLevel.ANY,
    max_depth: null,
  },
});

export const ScopeSettingsTab: FC<ScopeSettingsTabProps> = ({
  driveId,
  isFolder,
  initialSettings,
  setupOnly,
  onChange,
}) => {
  const [hasLocalScope, setHasLocalScope] = useState<boolean>(!!initialSettings || !!setupOnly);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(
    initialSettings?.restrictions.access_level ?? AccessLevel.ANY,
  );
  const [maxDepth, setMaxDepth] = useState<number | null>(
    initialSettings?.restrictions.max_depth ?? null,
  );
  const [isPinned, setIsPinned] = useState<boolean>(initialSettings?.is_pinned ?? false);
  const [isInfiniteDepth, setIsInfiniteDepth] = useState<boolean>(
    initialSettings?.restrictions.max_depth === null,
  );
  const lastEmittedRef = useRef<ScopeSettings | null>(null);

  useEffect(() => {
    if (!hasLocalScope) {
      lastEmittedRef.current = null;
      return;
    }

    const nextSettings: ScopeSettings = {
      drive_id: driveId,
      is_pinned: isPinned,
      restrictions: {
        access_level: accessLevel,
        max_depth: isInfiniteDepth ? null : maxDepth,
      },
    };

    if (!deepEqual(lastEmittedRef.current, nextSettings)) {
      lastEmittedRef.current = nextSettings;
      onChange(nextSettings);
    }
  }, [accessLevel, maxDepth, isPinned, isInfiniteDepth, driveId, hasLocalScope, onChange]);

  const handleAddScope = () => {
    const defaults = DEFAULT_SETTINGS(driveId);

    setAccessLevel(defaults.restrictions.access_level);
    setMaxDepth(defaults.restrictions.max_depth);
    setIsInfiniteDepth(true);
    setIsPinned(false);

    setHasLocalScope(true);
    onChange(defaults);
  };

  const handleCancel = () => {
    setHasLocalScope(false);
    onChange(null);
  };

  const handleDelete = () => {
    setHasLocalScope(false);
    onChange(null);
  };

  const handleAccessLevelChange = (value: string) => {
    setAccessLevel(value as AccessLevel);
  };

  const handleMaxDepthChange = (value: string) => {
    if (value === '') {
      setMaxDepth(0);
      return;
    }

    const num = Number(value);
    if (!Number.isNaN(num) && num >= 0) {
      setMaxDepth(num);
    }
  };

  const handleInfiniteDepthToggle = (checked: boolean) => {
    setIsInfiniteDepth(checked);
    if (checked) {
      setMaxDepth(null);
    } else if (maxDepth === null) {
      setMaxDepth(1);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Налаштування доступу
      </Typography>

      {!hasLocalScope && !setupOnly ? (
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={handleAddScope}>
              Додати доступ
            </Button>
          }
        >
          Доступ не налаштовано. Використовується доступ з батьківського розділу.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            select
            fullWidth
            label="Рівень доступу"
            value={accessLevel}
            onChange={(e) => handleAccessLevelChange(e.target.value)}
            helperText="Хто може переглядати цей розділ та його вміст"
          >
            {Object.entries(accessLevelLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>

          {isFolder && (
            <>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isInfiniteDepth}
                      onChange={(e) => handleInfiniteDepthToggle(e.target.checked)}
                    />
                  }
                  label="Необмежена глибина"
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 5 }}>
                  Якщо увімкнено, доступ поширюється на всі вкладені елементи
                </Typography>
              </Box>

              {!isInfiniteDepth && (
                <TextField
                  fullWidth
                  type="number"
                  label="Максимальна глибина"
                  value={maxDepth ?? 1}
                  onChange={(e) => handleMaxDepthChange(e.target.value)}
                  slotProps={{ htmlInput: { min: 0, step: 1 } }}
                  helperText="1 = тільки файли цієї папки"
                />
              )}
            </>
          )}

          <Box>
            <FormControlLabel
              control={
                <Switch checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
              }
              label="Закріпити в кореневому дереві"
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 5 }}>
              Показувати цей елемент у кореневому дереві документів
            </Typography>
          </Box>

          {!setupOnly && (
            <Button
              color={initialSettings ? 'error' : 'primary'}
              onClick={initialSettings ? handleDelete : handleCancel}
            >
              {initialSettings ? 'Видалити доступ' : 'Скасувати'}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};
