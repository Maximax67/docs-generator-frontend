'use client';

import { useEffect, useState, ChangeEvent, KeyboardEvent } from 'react';
import {
  Box,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
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
  Pagination,
  InputAdornment,
} from '@mui/material';
import {
  Launch as LaunchIcon,
  Verified as VerifiedIcon,
  ErrorOutline as ErrorOutlineIcon,
  Block as BlockIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { formatDate } from '@/utils/dates';
import Link from 'next/link';
import { User } from '@/types/user';
import { useUserStore } from '@/store/user';
import { useTheme } from '@mui/material/styles';
import RoleChip from '@/components/RoleChip';
import { toErrorMessage } from '@/utils/errors-messages';
import { useRouter, useSearchParams } from 'next/navigation';
import { Paginated } from '@/types/pagination';
import { LoadingContent } from '@/components/LoadingContent';
import { adminApi } from '@/lib/api';

export default function UsersPage() {
  const { user } = useUserStore();
  const [searchResult, setSearchResult] = useState<Paginated<User> | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') ?? 1);
  const pageSize = Number(searchParams.get('page_size') ?? 25);
  const appliedSearch = searchParams.get('q') ?? '';
  const roleFilter = searchParams.get('role') ?? 'all';
  const statusFilter = searchParams.get('status') ?? 'all';

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'god') return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const response = await adminApi.getUsers(
          page,
          pageSize,
          appliedSearch || undefined,
          roleFilter !== 'all' ? roleFilter : undefined,
          statusFilter !== 'all' ? statusFilter : undefined,
        );
        if (!cancelled) {
          setSearchResult(response);
        }
      } catch (e) {
        if (!cancelled) {
          setError(toErrorMessage(e, 'Не вдалось завантажити список користувачів'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, page, pageSize, appliedSearch, roleFilter, statusFilter]);

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

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const updateURL = (
    newPage: number,
    newPageSize: number,
    search: string,
    role: string,
    status: string,
  ) => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    params.set('page_size', newPageSize.toString());
    if (search) params.set('q', search);
    if (role !== 'all') params.set('role', role);
    if (status !== 'all') params.set('status', status);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const performSearch = () => {
    if (searchInput.trim() !== appliedSearch) {
      updateURL(1, pageSize, searchInput.trim(), roleFilter, statusFilter);
    }
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const handleSearchBlur = () => {
    performSearch();
  };

  const handleRoleFilter = (e: SelectChangeEvent) => {
    updateURL(1, pageSize, appliedSearch, e.target.value, statusFilter);
  };

  const handleStatusFilter = (e: SelectChangeEvent) => {
    updateURL(1, pageSize, appliedSearch, roleFilter, e.target.value);
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    updateURL(newPage, pageSize, appliedSearch, roleFilter, statusFilter);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    updateURL(1, Number(event.target.value), appliedSearch, roleFilter, statusFilter);
  };

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
          value={searchInput}
          onChange={handleSearchInputChange}
          onKeyDown={handleSearchKeyDown}
          onBlur={handleSearchBlur}
          sx={{
            flex: { xs: '1 1 100%', md: '1 1 auto' },
            minWidth: 0,
          }}
          slotProps={{
            input: {
              endAdornment: searchInput.trim() !== appliedSearch && (
                <InputAdornment position="end">
                  <IconButton onClick={performSearch} edge="end" aria-label="Шукати" size="small">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
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

      <Box mb={2} display="flex" alignItems="center" gap={2}>
        <Typography variant="body2">Елементів на сторінці:</Typography>
        <FormControl size="small" variant="outlined">
          <Select value={pageSize} onChange={handlePageSizeChange}>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
        {searchResult && (
          <Typography variant="body2" color="text.secondary">
            Всього: {searchResult.meta.total_items}
          </Typography>
        )}
      </Box>

      {isMobile ? (
        <LoadingContent loading={loading}>
          <Stack spacing={2}>
            {searchResult?.data.map((user) => (
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
        </LoadingContent>
      ) : (
        <LoadingContent loading={loading}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Повне ім&apos;я</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Дата реєстрації</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Дії</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {searchResult?.data.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{`${user.first_name} ${user.last_name ?? ''}`.trim()}</TableCell>

                  <TableCell>
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
        </LoadingContent>
      )}

      <Box display="flex" justifyContent="center" mt={3}>
        {searchResult && (
          <Pagination
            count={searchResult.meta.total_pages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            disabled={loading}
          />
        )}
      </Box>
    </Box>
  );
}
