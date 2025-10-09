'use client';

import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Pagination,
  Alert,
  useMediaQuery,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Replay as ReplayIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
  HorizontalRule as HorizontalRuleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useState, Fragment } from 'react';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { formatDateTime } from '@/utils/dates';
import { DocumentVariable } from '@/types/variables';
import { Generation, PaginationMeta } from '@/types/generations';
import { GenerationVariables } from '@/components/GenerationVariables';
import { GenerationVariablesControls } from '@/components/GenerationVariablesControls';

type GenerationSectionProps = {
  deleteAllowed: boolean;
  generations: Generation[];
  meta: PaginationMeta | null;
  loading: boolean;
  variableView: 'table' | 'json';
  isAdmin: boolean;
  allVars: Record<string, DocumentVariable>;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onRegenerate: (id: string, oldValues: boolean) => void;
  onRefresh: () => void;
  onChangePage: (page: number) => void;
  setVariableView: (value: 'table' | 'json') => void;
};

export default function GenerationSection({
  deleteAllowed,
  generations,
  meta,
  loading,
  variableView,
  isAdmin,
  allVars,
  onDelete,
  onDeleteAll,
  onRegenerate,
  onRefresh,
  onChangePage,
  setVariableView,
}: GenerationSectionProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showConstants, setShowConstants] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Генерації</Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        {generations.length !== 0 && deleteAllowed && (
          <Button variant="outlined" color="warning" onClick={onDeleteAll} disabled={loading}>
            Видалити все
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={loading}
        >
          Оновити
        </Button>
      </Stack>

      <Divider />

      {generations.length === 0 ? (
        <Alert severity="info">Немає згенерованих документів</Alert>
      ) : (
        <>
          {isAdmin && (
            <GenerationVariablesControls
              showConstants={showConstants}
              variableView={variableView}
              setShowConstants={setShowConstants}
              setVariableView={setVariableView}
            />
          )}
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
                            {isAdmin && (
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
                            )}
                            <IconButton
                              size="small"
                              onClick={() => onRegenerate(generation._id, false)}
                              title="Перегенерувати"
                              disabled={loading}
                            >
                              <ReplayIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => onRegenerate(generation._id, true)}
                              title="Перегенерувати зі старими значеннями"
                              disabled={loading}
                            >
                              <RestoreIcon fontSize="small" />
                            </IconButton>
                            {deleteAllowed && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => onDelete(generation._id)}
                                title="Видалити"
                                disabled={loading}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Stack>
                        </Box>

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
                  <TableCell>Дата генерації</TableCell>
                  <TableCell>Змінні</TableCell>
                  <TableCell align="right">Дії</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {generations.map((generation) => {
                  const isExpanded = expanded === generation._id;
                  return (
                    <Fragment key={generation._id}>
                      <TableRow>
                        <TableCell>{generation.template_name}</TableCell>
                        <TableCell>{formatDateTime(new Date(generation.created_at))}</TableCell>
                        <TableCell>
                          {Object.entries(generation.variables).length > 0 ? (
                            <IconButton
                              onClick={() => setExpanded(isExpanded ? null : generation._id)}
                            >
                              {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          ) : (
                            <IconButton disabled>
                              <HorizontalRuleIcon />
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {isAdmin && (
                              <IconButton
                                component={Link}
                                href={`https://docs.google.com/document/d/${generation.template_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Відкрити шаблон"
                              >
                                <LaunchIcon />
                              </IconButton>
                            )}
                            <IconButton
                              onClick={() => onRegenerate(generation._id, false)}
                              disabled={loading}
                              title="Перегенерувати"
                            >
                              <ReplayIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => onRegenerate(generation._id, true)}
                              disabled={loading}
                              title="Перегенерувати зі старими значеннями"
                            >
                              <RestoreIcon />
                            </IconButton>
                            {deleteAllowed && (
                              <IconButton
                                color="error"
                                onClick={() => onDelete(generation._id)}
                                disabled={loading}
                                title="Видалити"
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell colSpan={4} sx={{ p: 0 }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <GenerationVariables
                              showConstants={showConstants}
                              allVars={allVars}
                              variables={generation.variables}
                              view={variableView}
                            />
                          </Collapse>
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
                page={meta.current_page}
                onChange={(_, value) => onChangePage(value)}
                disabled={loading}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Stack>
  );
}
