import React from 'react';
import {
  Stack,
  Typography,
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';
import { SessionInfo } from '@/types/user';
import { formatDateTime } from '@/utils/dates';

type SessionsSectionProps = {
  sessions: SessionInfo[];
  loading: boolean;
  onRefresh: () => void;
  onRevoke: (id: string, current: boolean) => void;
  onLogoutEverywhere: () => void;
};

export default function SessionsSection({
  sessions,
  loading,
  onRefresh,
  onRevoke,
  onLogoutEverywhere,
}: SessionsSectionProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Сесії</Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button
          startIcon={<LogoutIcon />}
          color="error"
          variant="contained"
          onClick={onLogoutEverywhere}
        >
          Вийти з усіх сесій
        </Button>
        <Button startIcon={<RefreshIcon />} variant="outlined" onClick={onRefresh}>
          Оновити
        </Button>
      </Stack>

      <Box
        sx={{
          bgcolor: 'background.default',
          p: 2,
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Назва</TableCell>
                <TableCell>Створено</TableCell>
                <TableCell>Оновлено</TableCell>
                <TableCell align="right">Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(sessions) &&
                sessions.map((s: SessionInfo) => (
                  <TableRow key={s.id} selected={s.current}>
                    <TableCell>{s.name || 'Без назви'}</TableCell>
                    <TableCell>{formatDateTime(new Date(s.created_at))}</TableCell>
                    <TableCell>{formatDateTime(new Date(s.updated_at))}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        color="warning"
                        variant="outlined"
                        disabled={loading}
                        onClick={() => onRevoke(s.id, s.current)}
                      >
                        Завершити
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

              {(!sessions || sessions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary">
                      Сесій не знайдено
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          <Stack spacing={1}>
            {Array.isArray(sessions) &&
              sessions.map((s: SessionInfo) => (
                <Box
                  key={s.id}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: s.current ? 'warning.light' : 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1">{s.name || 'Без назви'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Створено: {formatDateTime(new Date(s.created_at))}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Оновлено: {formatDateTime(new Date(s.updated_at))}
                    </Typography>
                    <Stack direction="row" justifyContent="flex-end">
                      <Button
                        size="small"
                        color="warning"
                        variant="outlined"
                        disabled={loading}
                        onClick={() => onRevoke(s.id, s.current)}
                      >
                        Завершити
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ))}

            {(!sessions || sessions.length === 0) && (
              <Typography variant="body2" color="text.secondary">
                Сесій не знайдено
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
}
