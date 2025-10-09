'use client';

import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Collapse,
  Stack,
  Button,
  Chip,
  Container,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  Pagination,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Launch as LaunchIcon,
  Delete as DeleteIcon,
  Replay as ReplayIcon,
  Refresh as RefreshIcon,
  Restore as RestoreIcon,
  Error as ErrorIcon,
  HorizontalRule as HorizontalRuleIcon,
} from '@mui/icons-material';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useUserStore } from '@/store/user';
import { useGenerationsStore } from '@/store/generations';
import Link from 'next/link';
import RoleChip from '@/components/RoleChip';
import { formatDateTime } from '@/utils/dates';
import { toErrorMessage } from '@/utils/errors-messages';
import { AllVariablesResponse, DocumentVariable } from '@/types/variables';
import { api } from '@/lib/api/core';
import { validateVariableValue } from '@/lib/validation';

export default function GenerationsPage() {
  const { user } = useUserStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [resultsFetched, setResultsFetched] = useState(false);
  const { results, meta, fetchResults, deleteResult, regenerateResult } = useGenerationsStore();

  const [variableView, setVariableView] = useState<'table' | 'json'>('table');
  const [allVars, setAllVars] = useState<Record<string, DocumentVariable>>({});
  const [allVarsLoaded, setAllVarsLoaded] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [disabledUI, setDisabledUI] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await fetchResults(page);

      if (!allVarsLoaded) {
        const allVarsResponse = await api.get<AllVariablesResponse>('/config/variables');
        const newAllVars: Record<string, DocumentVariable> = {};
        for (const variable of allVarsResponse.data.variables) {
          newAllVars[variable.variable] = variable;
        }
        setAllVars(newAllVars);
        setAllVarsLoaded(true);
      }
    } catch (e) {
      setError(toErrorMessage(e, 'Не вдалось завантажити список генерацій'));
    } finally {
      setLoading(false);
    }
  }, [fetchResults, page, allVarsLoaded]);

  useEffect(() => {
    if (!resultsFetched && user && (user.role === 'admin' || user.role === 'god')) {
      setResultsFetched(true);
      fetchData();
    }
  }, [user, resultsFetched, fetchData]);

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
        <Alert severity="error">Сторінка доступна лише модераторам</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
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

  if (!results.length) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="info">Немає згенерованих документів</Alert>
      </Container>
    );
  }

  const handleRegenerateResult = async (id: string, oldConstants: boolean) => {
    setDisabledUI(true);
    try {
      const blob = await regenerateResult(id, oldConstants);
      const pdfUrl = window.URL.createObjectURL(blob);
      sessionStorage.setItem('generatedPdfUrl', pdfUrl);

      window.open('/documents/result');
    } catch (e) {
      setError(toErrorMessage(e, 'Не вдалось перегенерувати PDF'));
    } finally {
      setDisabledUI(false);
    }
  };

  const handleDeleteResult = async (id: string) => {
    setDisabledUI(true);
    try {
      await deleteResult(id);
    } catch (e) {
      setError(toErrorMessage(e, 'Не вдалось перегенерувати PDF'));
    } finally {
      setDisabledUI(false);
    }
  };

  const handleChangePage = async (page: number) => {
    setPage(page);
    setResultsFetched(false);
  };

  return (
    <Box p={2}>
      <Typography variant="h4" mb={3}>
        Генерації
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        mb={1}
        gap={2}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Typography variant="h5">Відображення змінних:</Typography>

        <ToggleButtonGroup
          value={variableView}
          exclusive
          onChange={(_, value) => value && setVariableView(value)}
          size="small"
          fullWidth
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <ToggleButton value="table" sx={{ flex: 1, px: 2 }}>
            Таблиця
          </ToggleButton>
          <ToggleButton value="json" sx={{ flex: 1, px: 2 }}>
            JSON
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {isMobile ? (
        <Stack spacing={2}>
          {results.map((result) => {
            const isExpanded = expanded === result._id;
            return (
              <Card key={result._id} variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography fontWeight="bold">{result.template_name}</Typography>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          component={Link}
                          href={`https://docs.google.com/document/d/${result.template_id}`}
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
                          onClick={() => handleRegenerateResult(result._id, false)}
                          title="Перегенерувати"
                        >
                          <ReplayIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          disabled={disabledUI}
                          onClick={() => handleRegenerateResult(result._id, true)}
                          title="Перегенерувати зі старими значеннями"
                        >
                          <RestoreIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={disabledUI}
                          onClick={() => handleDeleteResult(result._id)}
                          title="Видалити"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>

                    {result.user ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2">
                          {`${result.user.first_name} ${result.user.last_name ?? ''}`}
                        </Typography>
                        <RoleChip role={result.user.role} />
                        <IconButton
                          component={Link}
                          href={`/profile?id=${result.user.id}`}
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
                      {formatDateTime(new Date(result.created_at))}
                    </Typography>

                    {Object.entries(result.variables).length > 0 && (
                      <>
                        <Divider />
                        <Button
                          variant="text"
                          size="small"
                          startIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                          onClick={() => setExpanded(isExpanded ? null : result._id)}
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          {isExpanded ? 'Приховати змінні' : 'Показати змінні'}
                        </Button>

                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          {variableView === 'json' ? (
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                fontFamily: 'monospace',
                                fontSize: 13,
                                overflowX: 'auto',
                              }}
                            >
                              <pre style={{ margin: 0 }}>
                                {JSON.stringify(result.variables, null, 2)}
                              </pre>
                            </Box>
                          ) : (
                            <Box sx={{ p: 1.5, overflowX: 'auto' }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Змінна</TableCell>
                                    <TableCell>Тип</TableCell>
                                    <TableCell>Значення</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {Object.entries(result.variables).map(([variableName, value]) => {
                                    const variableMeta = allVars[variableName];
                                    const validationError = variableMeta
                                      ? validateVariableValue(variableMeta, value)
                                      : 'Змінна не існує';

                                    const displayName = variableMeta
                                      ? variableMeta.name
                                      : variableName;

                                    return (
                                      <TableRow key={variableName}>
                                        <TableCell>
                                          {validationError && (
                                            <span title={validationError}>
                                              <ErrorIcon
                                                fontSize="small"
                                                color="error"
                                                sx={{ mr: 0.5 }}
                                              />
                                            </span>
                                          )}
                                          {displayName}
                                        </TableCell>
                                        <TableCell>{variableMeta?.type ?? '?'}</TableCell>
                                        <TableCell>{value}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </Box>
                          )}
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
            {results.map((result, index) => {
              const isExpanded = expanded === result._id;
              return (
                <Fragment key={index}>
                  <TableRow key={result._id}>
                    <TableCell>
                      <Typography fontWeight="bold">{result.template_name}</Typography>
                    </TableCell>

                    <TableCell>
                      {result.user ? (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography>
                            {`${result.user.first_name} ${result.user.last_name ?? ''}`}
                          </Typography>
                          <IconButton
                            component={Link}
                            href={`/profile?id=${result.user.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                          >
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Chip label="Не авторизований"></Chip>
                      )}
                    </TableCell>

                    <TableCell>
                      {result.user ? (
                        <RoleChip role={result.user.role} />
                      ) : (
                        <HorizontalRuleIcon color="disabled" />
                      )}
                    </TableCell>

                    <TableCell>{formatDateTime(new Date(result.created_at))}</TableCell>

                    <TableCell>
                      {Object.entries(result.variables).length > 0 ? (
                        <IconButton onClick={() => setExpanded(isExpanded ? null : result._id)}>
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
                          href={`https://docs.google.com/document/d/${result.template_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Відкрити шаблон"
                        >
                          <LaunchIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleRegenerateResult(result._id, false)}
                          disabled={disabledUI}
                          title="Перегенерувати"
                        >
                          <ReplayIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleRegenerateResult(result._id, true)}
                          disabled={disabledUI}
                          title="Перегенерувати зі старими значеннями"
                        >
                          <RestoreIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteResult(result._id)}
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
                      {Object.entries(result.variables).length > 0 && (
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          {variableView === 'json' ? (
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                fontFamily: 'monospace',
                                fontSize: 13,
                                overflowX: 'auto',
                              }}
                            >
                              <pre style={{ margin: 0 }}>
                                {JSON.stringify(result.variables, null, 2)}
                              </pre>
                            </Box>
                          ) : (
                            <Box sx={{ p: 1.5, overflowX: 'auto' }}>
                              <Table size="small" sx={{ tableLayout: 'auto', width: 'auto' }}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Змінна</TableCell>
                                    <TableCell>Тип</TableCell>
                                    <TableCell>Значення</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {Object.entries(result.variables).map(([variableName, value]) => {
                                    const variableMeta = allVars[variableName];
                                    const validationError = variableMeta
                                      ? validateVariableValue(variableMeta, value)
                                      : 'Змінна не існує';

                                    const displayName = variableMeta
                                      ? variableMeta.name
                                      : variableName;

                                    return (
                                      <TableRow key={variableName}>
                                        <TableCell>
                                          {validationError && (
                                            <span title={validationError}>
                                              <ErrorIcon
                                                fontSize="small"
                                                color="error"
                                                sx={{ mr: 0.5 }}
                                              />
                                            </span>
                                          )}
                                          {displayName}
                                        </TableCell>
                                        <TableCell>{variableMeta?.type ?? '?'}</TableCell>
                                        <TableCell>{value}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </Box>
                          )}
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

      {meta && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={meta.total_pages}
            page={page}
            onChange={(_, value) => handleChangePage(value)}
            disabled={disabledUI}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}
