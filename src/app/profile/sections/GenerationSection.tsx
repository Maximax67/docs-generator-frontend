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
import { Generation } from '@/types/generations';
import { Paginated } from '@/types/pagination';

type GenerationSectionProps = {
  deleteAllowed: boolean;
  generations: Paginated<Generation> | null;
  loading: boolean;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onRegenerate: (id: string, oldValues: boolean) => void;
  onRefresh: () => void;
  onChangePage: (page: number) => void;
};

export default function GenerationSection({
  deleteAllowed,
  generations,
  loading,
  isAdmin,
  onDelete,
  onDeleteAll,
  onRegenerate,
  onRefresh,
  onChangePage,
}: GenerationSectionProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Генерації</Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        {!generations ||
          (generations.data.length !== 0 && deleteAllowed && (
            <Button variant="outlined" color="warning" onClick={onDeleteAll} disabled={loading}>
              Видалити все
            </Button>
          ))}
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

      {!generations || generations.data.length === 0 ? (
        <Alert severity="info">Немає згенерованих документів</Alert>
      ) : (
        <>
          {isMobile ? (
            <Stack spacing={2}>
              {generations.data.map((generation) => {
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
                  <TableCell>Дата генерації</TableCell>
                  <TableCell>Змінні</TableCell>
                  <TableCell align="right">Дії</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {generations.data.map((generation) => {
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
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}

          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={generations.meta.total_pages}
              page={generations.meta.current_page}
              onChange={(_, value) => onChangePage(value)}
              disabled={loading}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      )}
    </Stack>
  );
}
