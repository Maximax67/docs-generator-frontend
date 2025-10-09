'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import {
  Box,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
  Typography,
  Alert,
  Container,
  Chip,
  Card,
  CardContent,
  Stack,
  useMediaQuery,
  Divider,
  MenuItem,
  FormControl,
  Select,
  SelectChangeEvent,
  Button,
} from '@mui/material';
import {
  Launch as LaunchIcon,
  Verified as VerifiedIcon,
  ErrorOutline as ErrorOutlineIcon,
  Block as BlockIcon,
  Refresh as RefreshIcon,
  HorizontalRule as HorizontalRuleIcon,
} from '@mui/icons-material';
import { formatDate } from '@/utils/dates';
import Link from 'next/link';
import { User } from '@/types/user';
import { useUserStore } from '@/store/user';
import { useTheme } from '@mui/material/styles';
import RoleChip from '@/components/RoleChip';
import { toErrorMessage } from '@/utils/errors-messages';

export default function UsersPage() {
  const { user, getAllUsers } = useUserStore();
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    (async () => {
      try {
        if (user?.role !== 'admin' && user?.role !== 'god') return;
        const users = await getAllUsers();
        const sorted = users.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setUsers(sorted);
        setFiltered(sorted);
      } catch (e) {
        setError(toErrorMessage(e, 'Не вдалось завантажити список користувачів'));
      } finally {
        setLoading(false);
      }
    })();
  }, [user, getAllUsers]);

  useEffect(() => {
    let result = [...users];

    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter((u) => {
        const fullName = `${u.first_name} ${u.last_name ?? ''}`.toLowerCase();
        const email = (u.email ?? '').toLowerCase();
        return fullName.includes(term) || email.includes(term);
      });
    }

    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((u) => (statusFilter === 'banned' ? u.is_banned : !u.is_banned));
    }

    setFiltered(result);
  }, [search, users, roleFilter, statusFilter]);

  if (!user) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="info">Ви не авторизовані</Alert>
      </Container>
    );
  }

  if (user.role !== 'admin' && user.role !== 'god') {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">Сторінка лише для адміністраторів</Alert>
      </Container>
    );
  }

  const handleRefresh = () => {
    window.location.reload();
  };

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              <RefreshIcon sx={{ mr: 1 }} />
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleRoleFilter = (e: SelectChangeEvent) => {
    setRoleFilter(e.target.value);
  };

  const handleStatusFilter = (e: SelectChangeEvent) => {
    setStatusFilter(e.target.value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Користувачі
      </Typography>

      <Stack
        direction="row"
        flexWrap={{ xs: 'wrap', md: 'nowrap' }}
        mb={2}
        mt={3}
        alignItems="center"
        spacing={{ md: 2 }}
      >
        <TextField
          label="Пошук"
          variant="outlined"
          value={search}
          onChange={handleSearch}
          sx={{
            flex: { xs: '1 1 100%', md: '1 1 auto' },
            minWidth: 0,
          }}
        />

        <FormControl
          variant="outlined"
          sx={{
            flex: { xs: '1 1 auto', md: '0 0 auto' },
            minWidth: { xs: 0, md: 200 },
            mt: { xs: 1, md: 0 },
            mr: { xs: 0.5, md: 0 },
          }}
        >
          <Select value={roleFilter} onChange={handleRoleFilter}>
            <MenuItem value="all">Всі ролі</MenuItem>
            <MenuItem value="user">Користувач</MenuItem>
            <MenuItem value="admin">Адмін</MenuItem>
            <MenuItem value="god">Бог</MenuItem>
          </Select>
        </FormControl>

        <FormControl
          variant="outlined"
          sx={{
            flex: { xs: '1 1 auto', md: '0 0 auto' },
            minWidth: { xs: 0, md: 200 },
            mt: { xs: 1, md: 0 },
            ml: { xs: 0.5, md: 0 },
          }}
        >
          <Select value={statusFilter} onChange={handleStatusFilter}>
            <MenuItem value="all">Всі статуси</MenuItem>
            <MenuItem value="active">Активні</MenuItem>
            <MenuItem value="banned">Заблоковані</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {isMobile ? (
        <Stack spacing={2}>
          {filtered.map((user) => (
            <Card key={user._id} variant="outlined">
              <CardContent>
                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mr: 1,
                      }}
                      title={`${user.first_name} ${user.last_name ?? ''}`}
                    >
                      {`${user.first_name} ${user.last_name ?? ''}`.trim()}
                    </Typography>

                    <IconButton
                      component={Link}
                      href={`/profile?id=${user._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Переглянути профіль"
                      size="small"
                    >
                      <LaunchIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {user.email && (
                    <Typography variant="body2">
                      {user.email}
                      {user.email_verified ? (
                        <VerifiedIcon
                          color="success"
                          fontSize="small"
                          sx={{ verticalAlign: 'middle', ml: 0.5 }}
                        />
                      ) : (
                        <ErrorOutlineIcon
                          color="warning"
                          fontSize="small"
                          sx={{ verticalAlign: 'middle', ml: 0.5 }}
                        />
                      )}
                    </Typography>
                  )}

                  {user.telegram_id && (
                    <Typography variant="body2">
                      {user.telegram_username ? (
                        <a
                          href={`https://t.me/${user.telegram_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#0088cc' }}
                        >
                          @{user.telegram_username}
                        </a>
                      ) : (
                        user.telegram_id
                      )}
                    </Typography>
                  )}
                  <Typography variant="body2">{formatDate(new Date(user.created_at))}</Typography>

                  <Divider />

                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 0.75,
                    }}
                  >
                    <RoleChip role={user.role} />
                    <Chip
                      label={user.is_banned ? 'Заблокований' : 'Активний'}
                      color={user.is_banned ? 'error' : 'success'}
                      size="small"
                      icon={user.is_banned ? <BlockIcon /> : <VerifiedIcon />}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Повне ім&apos;я</TableCell>
              <TableCell>E‑mail</TableCell>
              <TableCell>Telegram</TableCell>
              <TableCell>Дата реєстрації</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{`${user.first_name} ${user.last_name ?? ''}`.trim()}</TableCell>
                <TableCell>
                  {user.email ?? <HorizontalRuleIcon color={'disabled'}></HorizontalRuleIcon>}
                  {user.email &&
                    (user.email_verified ? (
                      <VerifiedIcon
                        color="success"
                        fontSize="small"
                        sx={{ verticalAlign: 'middle', ml: 0.5 }}
                      />
                    ) : (
                      <ErrorOutlineIcon
                        color="warning"
                        fontSize="small"
                        sx={{ verticalAlign: 'middle', ml: 0.5 }}
                      />
                    ))}
                </TableCell>
                <TableCell>
                  {user.telegram_username ? (
                    <a
                      href={`https://t.me/${user.telegram_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#0088cc' }}
                    >
                      @{user.telegram_username}
                    </a>
                  ) : (
                    (user.telegram_id ?? (
                      <HorizontalRuleIcon color={'disabled'}></HorizontalRuleIcon>
                    ))
                  )}
                </TableCell>
                <TableCell>{formatDate(new Date(user.created_at))}</TableCell>
                <TableCell>
                  <RoleChip role={user.role} />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.is_banned ? 'Заблокований' : 'Активний'}
                    color={user.is_banned ? 'error' : 'success'}
                    icon={user.is_banned ? <BlockIcon /> : <VerifiedIcon />}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    component={Link}
                    href={`/profile?id=${user._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Переглянути профіль"
                  >
                    <LaunchIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
