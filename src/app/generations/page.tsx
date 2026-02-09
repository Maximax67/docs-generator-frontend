'use client';

import {
  Box,
  Typography,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Collapse,
  Stack,
  Button,
  Container,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Launch as LaunchIcon,
  Delete as DeleteIcon,
  Replay as ReplayIcon,
  Refresh as RefreshIcon,
  Restore as RestoreIcon,
  HorizontalRule as HorizontalRuleIcon,
} from '@mui/icons-material';
import { Fragment, useCallback, useEffect, useState, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { useUserStore } from '@/store/user';
import Link from 'next/link';
import RoleChip from '@/components/RoleChip';
import { formatDateTime } from '@/utils/dates';
import { toErrorMessage } from '@/utils/errors-messages';
import { savePdfToIndexedDb } from '@/lib/indexed-db-pdf';
import { generationsApi } from '@/lib/api';
import { Generation } from '@/types/generations';
import { Paginated } from '@/types/pagination';
import { isAdminUser } from '@/utils/is-admin';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { LoadingContent } from '@/components/LoadingContent';
import { PaginationControls } from '@/components/PaginationControls';
import { PageSizeControl } from '@/components/PageSizeControls';
import { JSONValue } from '@/types/json';
import { useRouter } from 'next/navigation';

export default function GenerationsPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const isAdmin = isAdminUser(user);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generations, setGenerations] = useState<Paginated<Generation> | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expanded, setExpanded] = useState<string | null>(null);
  const [disabledUI, setDisabledUI] = useState(false);

  const { page, pageSize, setPage, setPageSize } = usePaginationParams({
    defaultPageSize: 25,
  });

  const cancelledRef = useRef(false);
  const isFetched = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await generationsApi.getGenerations({ page, pageSize });

      if (!cancelledRef.current) {
        isFetched.current = true;
        setGenerations(response);
      }
    } catch (e) {
      if (!cancelledRef.current) {
        setError(toErrorMessage(e, 'Не вдалось завантажити список генерацій'));
      }
    } finally {
      if (!cancelledRef.current) {
        setLoading(false);
      }
    }
  }, [page, pageSize]);

  useEffect(() => {
    if (!isAdmin) return;

    cancelledRef.current = false;
    setError(null);
    fetchData();

    return () => {
      cancelledRef.current = true;
    };
  }, [isAdmin, fetchData]);

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
        <Alert severity="error">Сторінка доступна лише модераторам</Alert>
      </Container>
    );
  }

  const handlePageChange = (value: number) => {
    setPage(value);
    setExpanded(null);
  };

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchData}>
              <RefreshIcon sx={{ mr: 1 }} />
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  const handleRegenerateGeneration = async (id: string, variables?: Record<string, JSONValue>) => {
    setDisabledUI(true);
    try {
      const blob = await generationsApi.regenerateGeneration(id, variables);
      await savePdfToIndexedDb('generatedPdf', blob);
      router.push('/documents/result');
    } catch (e) {
      setError(toErrorMessage(e, 'Не вдалось перегенерувати PDF'));
    } finally {
      setDisabledUI(false);
    }
  };

  const handleDeleteGeneration = async (id: string) => {
    setDisabledUI(true);
    try {
      await generationsApi.deleteGeneration(id);
      const isLastItemOnPage = generations?.data.length === 1;
      const isNotFirstPage = page > 1;

      if (isLastItemOnPage && isNotFirstPage) {
        setPage(page - 1);
      } else {
        await fetchData();
      }
    } catch (e) {
      setError(toErrorMessage(e, 'Не вдалось видалити PDF'));
    } finally {
      setDisabledUI(false);
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h4" mb={3}>
        Генерації
      </Typography>

      {!isFetched.current && (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {isFetched.current && (!generations || generations.data.length === 0) && (
        <Alert severity="info">Немає згенерованих документів</Alert>
      )}

      {isFetched.current && generations && generations.data.length > 0 && (
        <>
          <PageSizeControl
            pageSize={pageSize}
            totalItems={generations.meta.total_items}
            onPageSizeChange={setPageSize}
            disabled={disabledUI || loading}
          />

          <LoadingContent loading={loading} sx={{ my: 2 }}>
            {isMobile ? (
              <Stack spacing={2}>
                {generations.data.map((generation) => {
                  const isExpanded = expanded === generation.id;
                  return (
                    <Card key={generation.id} variant="outlined">
                      <CardContent>
                        <Stack spacing={1}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography fontWeight="bold">{generation.template_name}</Typography>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton
                                component={Link}
                                href={`https://docs.google.com/document/d/${generation.template_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                title="Відкрити шаблон"
                              >
                                <LaunchIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                disabled={disabledUI}
                                onClick={() =>
                                  handleRegenerateGeneration(generation.id, generation.variables)
                                }
                                title="Перегенерувати"
                              >
                                <ReplayIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                disabled={disabledUI}
                                onClick={() => handleRegenerateGeneration(generation.id)}
                                title="Перегенерувати зі старими значеннями"
                              >
                                <RestoreIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={disabledUI}
                                onClick={() => handleDeleteGeneration(generation.id)}
                                title="Видалити"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Box>

                          {generation.user ? (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="body2">
                                {`${generation.user.first_name} ${generation.user.last_name ?? ''}`}
                              </Typography>
                              <RoleChip role={generation.user.role} />
                              <IconButton
                                component={Link}
                                href={`/profile?id=${generation.user.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                              >
                                <LaunchIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          ) : (
                            <Typography variant="body2">Не авторизований</Typography>
                          )}

                          <Typography variant="body2" color="text.secondary">
                            {formatDateTime(generation.created_at)}
                          </Typography>

                          {Object.entries(generation.variables).length > 0 && (
                            <>
                              <Divider />
                              <Button
                                variant="text"
                                size="small"
                                startIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                                onClick={() => setExpanded(isExpanded ? null : generation.id)}
                                sx={{ alignSelf: 'flex-start' }}
                              >
                                {isExpanded ? 'Приховати змінні' : 'Показати змінні'}
                              </Button>

                              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <Box
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    fontFamily: 'monospace',
                                    fontSize: 13,
                                    overflowX: 'auto',
                                  }}
                                >
                                  <pre
                                    style={{
                                      margin: 0,
                                      whiteSpace: 'pre-wrap',
                                      wordBreak: 'break-word',
                                    }}
                                  >
                                    {JSON.stringify(generation.variables, null, 2)}
                                  </pre>
                                </Box>
                              </Collapse>
                            </>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Шаблон</TableCell>
                    <TableCell>Користувач</TableCell>
                    <TableCell>Роль</TableCell>
                    <TableCell>Дата генерації</TableCell>
                    <TableCell>Змінні</TableCell>
                    <TableCell align="right">Дії</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {generations.data.map((generation, index) => {
                    const isExpanded = expanded === generation.id;
                    return (
                      <Fragment key={index}>
                        <TableRow key={generation.id}>
                          <TableCell>
                            <Typography fontWeight="bold">{generation.template_name}</Typography>
                          </TableCell>

                          <TableCell>
                            {generation.user ? (
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography>
                                  {`${generation.user.first_name} ${generation.user.last_name ?? ''}`}
                                </Typography>
                                <IconButton
                                  component={Link}
                                  href={`/profile?id=${generation.user.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  size="small"
                                >
                                  <LaunchIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            ) : (
                              <Typography>Не авторизований</Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            {generation.user ? (
                              <RoleChip role={generation.user.role} />
                            ) : (
                              <HorizontalRuleIcon color="disabled" />
                            )}
                          </TableCell>

                          <TableCell>{formatDateTime(generation.created_at)}</TableCell>

                          <TableCell>
                            {Object.entries(generation.variables).length > 0 ? (
                              <IconButton
                                onClick={() => setExpanded(isExpanded ? null : generation.id)}
                              >
                                {isExpanded ? <ExpandLess /> : <ExpandMore />}
                              </IconButton>
                            ) : (
                              <IconButton disabled={true}>
                                <HorizontalRuleIcon></HorizontalRuleIcon>
                              </IconButton>
                            )}
                          </TableCell>

                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <IconButton
                                component={Link}
                                href={`https://docs.google.com/document/d/${generation.template_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Відкрити шаблон"
                              >
                                <LaunchIcon />
                              </IconButton>
                              <IconButton
                                onClick={() =>
                                  handleRegenerateGeneration(generation.id, generation.variables)
                                }
                                disabled={disabledUI}
                                title="Перегенерувати"
                              >
                                <ReplayIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleRegenerateGeneration(generation.id)}
                                disabled={disabledUI}
                                title="Перегенерувати зі старими значеннями"
                              >
                                <RestoreIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteGeneration(generation.id)}
                                disabled={disabledUI}
                                title="Видалити"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell colSpan={6} sx={{ p: 0 }}>
                            {Object.entries(generation.variables).length > 0 && (
                              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <Box
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    fontFamily: 'monospace',
                                    fontSize: 13,
                                    overflowX: 'auto',
                                  }}
                                >
                                  <pre
                                    style={{
                                      margin: 0,
                                      whiteSpace: 'pre-wrap',
                                      wordBreak: 'break-word',
                                    }}
                                  >
                                    {JSON.stringify(generation.variables, null, 2)}
                                  </pre>
                                </Box>
                              </Collapse>
                            )}
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </LoadingContent>
          <PaginationControls
            meta={generations.meta}
            onPageChange={handlePageChange}
            disabled={disabledUI || loading}
          />
        </>
      )}
    </Box>
  );
}
