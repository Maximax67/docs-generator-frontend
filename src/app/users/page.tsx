'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
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
  Button,
} from '@mui/material';
import {
  Launch as LaunchIcon,
  Verified as VerifiedIcon,
  ErrorOutline as ErrorOutlineIcon,
  Block as BlockIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { formatDate } from '@/utils/dates';
import Link from 'next/link';
import { User } from '@/types/user';
import { useUserStore } from '@/store/user';
import { useTheme } from '@mui/material/styles';
import RoleChip from '@/components/RoleChip';
import { toErrorMessage } from '@/utils/errors-messages';
import { Paginated } from '@/types/pagination';
import { LoadingContent } from '@/components/LoadingContent';
import { adminApi } from '@/lib/api';
import { isAdminUser } from '@/utils/is-admin';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { SearchField } from '@/components/SearchField';
import { FilterSelect, FilterOption } from '@/components/FilterSelect';
import { PaginationControls } from '@/components/PaginationControls';
import { PageSizeControl } from '@/components/PageSizeControls';

const ROLE_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Всі ролі' },
  { value: 'user', label: 'Користувач' },
  { value: 'admin', label: 'Адмін' },
  { value: 'god', label: 'Бог' },
];

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Всі статуси' },
  { value: 'active', label: 'Активні' },
  { value: 'banned', label: 'Заблоковані' },
];

export default function UsersPage() {
  const { user } = useUserStore();
  const isAdmin = isAdminUser(user);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { page, pageSize, filters, setPage, setPageSize, setFilter } = usePaginationParams({
    defaultPageSize: 25,
    filterDefaults: {
      q: '',
      role: 'all',
      status: 'all',
    },
  });

  const searchQuery = (filters.q as string) || '';
  const roleFilter = (filters.role as string) || 'all';
  const statusFilter = (filters.status as string) || 'all';

  const [searchResult, setSearchResult] = useState<Paginated<User> | null>(null);

  const cancelledRef = useRef(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers(
        page,
        pageSize,
        searchQuery || undefined,
        roleFilter !== 'all' ? roleFilter : undefined,
        statusFilter !== 'all' ? statusFilter : undefined,
      );

      if (!cancelledRef.current) {
        setSearchResult(response);
      }
    } catch (e) {
      if (!cancelledRef.current) {
        setError(toErrorMessage(e, 'Не вдалось завантажити список користувачів'));
      }
    } finally {
      if (!cancelledRef.current) {
        setLoading(false);
      }
    }
  }, [searchQuery, page, pageSize, roleFilter, statusFilter]);

  useEffect(() => {
    if (!isAdmin) return;

    cancelledRef.current = false;
    setError(null);
    loadUsers();

    return () => {
      cancelledRef.current = true;
    };
  }, [loadUsers, isAdmin]);

  if (!user) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="info">Ви не авторизовані</Alert>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">Сторінка лише для адміністраторів</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={loadUsers}>
              <RefreshIcon sx={{ mr: 1 }} />
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
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
        <SearchField
          value={searchQuery}
          onSearch={(value) => setFilter('q', value)}
          disabled={loading}
        />

        <FilterSelect
          value={roleFilter}
          onChange={(value) => setFilter('role', value)}
          options={ROLE_OPTIONS}
          disabled={loading}
          sx={{
            flex: { xs: '1 1 auto', md: '0 0 auto' },
            minWidth: { xs: 0, md: 200 },
            mt: { xs: 1, md: 0 },
            mr: { xs: 0.5, md: 0 },
          }}
        />

        <FilterSelect
          value={statusFilter}
          onChange={(value) => setFilter('status', value)}
          options={STATUS_OPTIONS}
          disabled={loading}
          sx={{
            flex: { xs: '1 1 auto', md: '0 0 auto' },
            minWidth: { xs: 0, md: 200 },
            mt: { xs: 1, md: 0 },
            ml: { xs: 0.5, md: 0 },
          }}
        />
      </Stack>

      {searchResult && (
        <Box my={2}>
          <PageSizeControl
            pageSize={pageSize}
            totalItems={searchResult.meta.total_items}
            onPageSizeChange={setPageSize}
            disabled={loading}
          />
        </Box>
      )}

      <LoadingContent loading={loading} sx={{ mb: 2 }}>
        {isMobile ? (
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
        ) : (
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
        )}
      </LoadingContent>

      {searchResult && (
        <PaginationControls meta={searchResult.meta} onPageChange={setPage} disabled={loading} />
      )}
    </Box>
  );
}
