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
import { PaginationControls } from '@/components/PaginationControls';
import { LoadingContent } from '@/components/LoadingContent';
import { JSONValue } from '@/types/json';
import { useDictionary } from '@/contexts/LangContext';

type GenerationSectionProps = {
  deleteAllowed: boolean;
  generations: Paginated<Generation> | null;
  loading: boolean;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onRegenerate: (id: string, variables?: Record<string, JSONValue>) => void;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
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
  onPageChange,
}: GenerationSectionProps) {
  const dict = useDictionary();
  const [expanded, setExpanded] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{dict.profile.generations.title}</Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        {!generations ||
          (generations.data.length !== 0 && deleteAllowed && (
            <Button variant="outlined" color="warning" onClick={onDeleteAll} disabled={loading}>
              {dict.profile.generations.deleteAll}
            </Button>
          ))}
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={loading}
        >
          {dict.common.refresh}
        </Button>
      </Stack>

      <Divider />

      {!generations || generations.data.length === 0 ? (
        <Alert severity="info">{dict.profile.generations.noData}</Alert>
      ) : (
        <>
          <LoadingContent loading={loading} sx={{ mb: 2 }}>
            {isMobile ? (
              <Stack spacing={2}>
                {generations.data.map((generation) => {
                  const isExpanded = expanded === generation.id;
                  return (
                    <Card key={generation.id} variant="outlined">
                      <CardContent>
                        <Stack spacing={1}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography sx={{ fontWeight: 'bold' }}>
                              {generation.template_name}
                            </Typography>
                            <Stack direction="row" spacing={0.5}>
                              {isAdmin && (
                                <IconButton
                                  component={Link}
                                  href={`https://docs.google.com/document/d/${generation.template_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  size="small"
                                  title={dict.generations.openTemplate}
                                >
                                  <LaunchIcon fontSize="small" />
                                </IconButton>
                              )}
                              <IconButton
                                size="small"
                                onClick={() => onRegenerate(generation.id, generation.variables)}
                                title={dict.generations.regenerate}
                                disabled={loading}
                              >
                                <ReplayIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => onRegenerate(generation.id)}
                                title={dict.generations.regenerateOld}
                                disabled={loading}
                              >
                                <RestoreIcon fontSize="small" />
                              </IconButton>
                              {deleteAllowed && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => onDelete(generation.id)}
                                  title={dict.generations.delete}
                                  disabled={loading}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Stack>
                          </Box>

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
                                {isExpanded
                                  ? dict.profile.generations.hideVars
                                  : dict.profile.generations.showVars}
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
                    <TableCell>{dict.profile.generations.templateCol}</TableCell>
                    <TableCell>{dict.profile.generations.dateCol}</TableCell>
                    <TableCell>{dict.profile.generations.variablesCol}</TableCell>
                    <TableCell align="right">{dict.profile.generations.actionsCol}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {generations.data.map((generation) => {
                    const isExpanded = expanded === generation.id;
                    return (
                      <Fragment key={generation.id}>
                        <TableRow>
                          <TableCell>{generation.template_name}</TableCell>
                          <TableCell>{formatDateTime(generation.created_at)}</TableCell>
                          <TableCell>
                            {Object.entries(generation.variables).length > 0 ? (
                              <IconButton
                                onClick={() => setExpanded(isExpanded ? null : generation.id)}
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
                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                              {isAdmin && (
                                <IconButton
                                  component={Link}
                                  href={`https://docs.google.com/document/d/${generation.template_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={dict.generations.openTemplate}
                                >
                                  <LaunchIcon />
                                </IconButton>
                              )}
                              <IconButton
                                onClick={() => onRegenerate(generation.id, generation.variables)}
                                disabled={loading}
                                title={dict.generations.regenerate}
                              >
                                <ReplayIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => onRegenerate(generation.id)}
                                disabled={loading}
                                title={dict.generations.regenerateOld}
                              >
                                <RestoreIcon />
                              </IconButton>
                              {deleteAllowed && (
                                <IconButton
                                  color="error"
                                  onClick={() => onDelete(generation.id)}
                                  disabled={loading}
                                  title={dict.generations.delete}
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
          </LoadingContent>
          <PaginationControls
            meta={generations.meta}
            onPageChange={onPageChange}
            disabled={loading}
          />
        </>
      )}
    </Stack>
  );
}
