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
import { GenerationVariables } from '@/components/GenerationVariables';
import { savePdfToIndexedDb } from '@/lib/indexedDbPdf';
import { GenerationVariablesControls } from '@/components/GenerationVariablesControls';

export default function GenerationsPage() {
  const { user } = useUserStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generationsFetched, setGenerationsFetched] = useState(false);
  const { generations, meta, fetchGenerations, deleteGeneration, regenerateGeneration } =
    useGenerationsStore();

  const [variableView, setVariableView] = useState<'table' | 'json'>('table');
  const [showConstants, setShowConstants] = useState(false);
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
      await fetchGenerations(page);

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
  }, [fetchGenerations, page, allVarsLoaded]);

  useEffect(() => {
    if (!generationsFetched && user && (user.role === 'admin' || user.role === 'god')) {
      setGenerationsFetched(true);
      fetchData();
    }
  }, [user, generationsFetched, fetchData]);

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

  if (!generations.length) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="info">Немає згенерованих документів</Alert>
      </Container>
    );
  }

  const handleRegenerateGeneration = async (id: string, oldConstants: boolean) => {
    setDisabledUI(true);
    try {
      const blob = await regenerateGeneration(id, oldConstants);
      await savePdfToIndexedDb('generatedPdf', blob);

      window.open('/documents/result/', '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError(toErrorMessage(e, 'Не вдалось перегенерувати PDF'));
    } finally {
      setDisabledUI(false);
    }
  };

  const handleDeleteGeneration = async (id: string) => {
    setDisabledUI(true);
    try {
      await deleteGeneration(id);
    } catch (e) {
      setError(toErrorMessage(e, 'Не вдалось перегенерувати PDF'));
    } finally {
      setDisabledUI(false);
    }
  };

  const handleChangePage = async (page: number) => {
    setPage(page);
    setGenerationsFetched(false);
  };

  return (
    <Box p={2}>
      <Typography variant="h4" mb={3}>
        Генерації
      </Typography>

      <GenerationVariablesControls
        showConstants={showConstants}
        variableView={variableView}
        setShowConstants={setShowConstants}
        setVariableView={setVariableView}
      />

      {isMobile ? (
        <Stack spacing={2}>
          {generations.map((generation) => {
            const isExpanded = expanded === generation._id;
            return (
              <Card key={generation._id} variant="outlined">
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
                          onClick={() => handleRegenerateGeneration(generation._id, false)}
                          title="Перегенерувати"
                        >
                          <ReplayIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          disabled={disabledUI}
                          onClick={() => handleRegenerateGeneration(generation._id, true)}
                          title="Перегенерувати зі старими значеннями"
                        >
                          <RestoreIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={disabledUI}
                          onClick={() => handleDeleteGeneration(generation._id)}
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
                      {formatDateTime(new Date(generation.created_at))}
                    </Typography>

                    {Object.entries(generation.variables).length > 0 && (
                      <>
                        <Divider />
                        <Button
                          variant="text"
                          size="small"
                          startIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                          onClick={() => setExpanded(isExpanded ? null : generation._id)}
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          {isExpanded ? 'Приховати змінні' : 'Показати змінні'}
                        </Button>

                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <GenerationVariables
                            fullWidth
                            showConstants={showConstants}
                            allVars={allVars}
                            variables={generation.variables}
                            view={variableView}
                          />
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
            {generations.map((generation, index) => {
              const isExpanded = expanded === generation._id;
              return (
                <Fragment key={index}>
                  <TableRow key={generation._id}>
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
                        <Chip label="Не авторизований"></Chip>
                      )}
                    </TableCell>

                    <TableCell>
                      {generation.user ? (
                        <RoleChip role={generation.user.role} />
                      ) : (
                        <HorizontalRuleIcon color="disabled" />
                      )}
                    </TableCell>

                    <TableCell>{formatDateTime(new Date(generation.created_at))}</TableCell>

                    <TableCell>
                      {Object.entries(generation.variables).length > 0 ? (
                        <IconButton onClick={() => setExpanded(isExpanded ? null : generation._id)}>
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
                          onClick={() => handleRegenerateGeneration(generation._id, false)}
                          disabled={disabledUI}
                          title="Перегенерувати"
                        >
                          <ReplayIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleRegenerateGeneration(generation._id, true)}
                          disabled={disabledUI}
                          title="Перегенерувати зі старими значеннями"
                        >
                          <RestoreIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteGeneration(generation._id)}
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
                          <GenerationVariables
                            showConstants={showConstants}
                            allVars={allVars}
                            variables={generation.variables}
                            view={variableView}
                          />
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
