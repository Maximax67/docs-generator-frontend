import { FC, useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon,
} from '@mui/icons-material';
import { VariableInfo } from '@/types/variables';
import { ScopeBadge } from '@/components/ScopeBadge';
import { FolderTreeGlobal } from '@/types/documents';

interface FieldOrderTabProps {
  folderTree: FolderTreeGlobal | null;
  orderableVariables: VariableInfo[];
  resetKey: number;
  onChange: (orders: VariableInfo[]) => void;
}

export const FieldOrderTab: FC<FieldOrderTabProps> = ({
  folderTree,
  orderableVariables,
  resetKey,
  onChange,
}) => {
  const [orderChanges, setOrderChanges] = useState<Record<string, number>>({});

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragBlocked, setDragBlocked] = useState(false);

  // Merge original variables with changed orders
  const displayVariables = useMemo(() => {
    return orderableVariables
      .map((v) => ({
        ...v,
        order: orderChanges[v.id] !== undefined ? orderChanges[v.id] : v.order,
      }))
      .sort((a, b) => {
        if (a.order === b.order) {
          return a.variable.localeCompare(b.variable);
        }
        return a.order - b.order;
      });
  }, [orderableVariables, orderChanges]);

  useEffect(() => {
    const id = setTimeout(() => setOrderChanges({}), 0);
    return () => clearTimeout(id);
  }, [resetKey]);

  useEffect(() => {
    const changedVariables = orderableVariables
      .filter((v) => orderChanges[v.id] !== undefined)
      .map((v) => ({
        ...v,
        order: orderChanges[v.id],
      }));

    onChange(changedVariables);
  }, [orderChanges, orderableVariables, onChange]);

  const handleOrderChange = (id: string, newOrder: string) => {
    const orderNum = parseInt(newOrder, 10);
    if (isNaN(orderNum)) return;

    const originalVariable = orderableVariables.find((v) => v.id === id);
    if (!originalVariable) return;

    if (orderNum === originalVariable.order) {
      setOrderChanges((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      setOrderChanges((prev) => ({
        ...prev,
        [id]: orderNum,
      }));
    }
  };

  // Apply order change for a variable
  const applyOrderChange = (id: string, newOrder: number) => {
    const originalVariable = orderableVariables.find((v) => v.id === id);
    if (!originalVariable) return;

    if (newOrder === originalVariable.order) {
      setOrderChanges((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      setOrderChanges((prev) => ({
        ...prev,
        [id]: newOrder,
      }));
    }
  };

  // Calculate what order the dragged item would get if dropped at target position
  const calculateDragOrder = (fromIndex: number, toIndex: number): number => {
    const tempVariables = [...displayVariables];
    tempVariables.splice(fromIndex, 1);

    if (toIndex === 0) {
      return tempVariables[0].order - 1;
    } else if (toIndex >= tempVariables.length) {
      return tempVariables[tempVariables.length - 1].order + 1;
    } else {
      return tempVariables[toIndex].order;
    }
  };

  const moveVariableByDrag = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= displayVariables.length || fromIndex === toIndex) return;

    const moved = displayVariables[fromIndex];
    const newOrder = calculateDragOrder(fromIndex, toIndex);

    applyOrderChange(moved.id, newOrder);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
    setDragBlocked(false);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) {
      return;
    }

    setDragOverIndex(index);
    setDragBlocked(false);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedIndex === null || dragBlocked) {
      return;
    }

    moveVariableByDrag(draggedIndex, index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDragBlocked(false);
  };


  const handleMoveUp = (index: number) => {
    if (index === 0) return;

    const variable = displayVariables[index];
    const variableOrder = orderChanges[variable.id] ?? variable.order;

    // Find previous item with DIFFERENT order
    let prevDifferentOrder: number | null = null;

    for (let i = index - 1; i >= 0; i--) {
      if (displayVariables[i].order !== variableOrder) {
        prevDifferentOrder = displayVariables[i].order;
        break;
      }
    }

    let newOrder: number;

    if (prevDifferentOrder !== null) {
      newOrder = prevDifferentOrder;
    } else {
      newOrder = variableOrder - 1;
    }

    applyOrderChange(variable.id, newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (index === displayVariables.length - 1) return;

    const variable = displayVariables[index];
    const variableOrder = orderChanges[variable.id] ?? variable.order;

    // Find next item with DIFFERENT order
    let nextDifferentOrder: number | null = null;

    for (let i = index + 1; i < displayVariables.length; i++) {
      if (displayVariables[i].order !== variableOrder) {
        nextDifferentOrder = displayVariables[i].order;
        break;
      }
    }

    let newOrder: number;

    if (nextDifferentOrder !== null) {
      newOrder = nextDifferentOrder;
    } else {
      newOrder = variableOrder + 1;
    }

    applyOrderChange(variable.id, newOrder);
  };

  if (displayVariables.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">Немає полів для сортування.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Порядок полів
      </Typography>

      <Paper variant="outlined">
        <List disablePadding>
          {displayVariables.map((variable, index) => {
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;
            const isBlocked = dragBlocked && isDragOver;
            const hasChanges = orderChanges[variable.id] !== undefined;

            return (
              <ListItem
                key={variable.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                sx={{
                  borderBottom: index < displayVariables.length - 1 ? 1 : 0,
                  borderColor: 'divider',
                  cursor: 'grab',
                  bgcolor: isDragging
                    ? 'action.selected'
                    : isBlocked
                      ? 'error.light'
                      : isDragOver
                        ? 'action.hover'
                        : hasChanges
                          ? 'warning.lighter'
                          : 'transparent',
                  borderLeft: isDragOver && !isBlocked ? 3 : hasChanges ? 2 : 0,
                  borderLeftColor: isDragOver && !isBlocked ? 'primary.main' : 'warning.main',
                  '&:active': { cursor: 'grabbing' },
                  display: 'flex',
                  gap: 2,
                  py: 1.5,
                  opacity: isDragging ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <DragIcon sx={{ color: 'text.secondary', alignSelf: 'center' }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <ListItemText
                      primary={variable.variable}
                      sx={{ m: 0 }}
                      slotProps={{ primary: { fontWeight: 500 } }}
                    />
                    <ScopeBadge folderTree={folderTree} scope={variable.scope} />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <UpIcon fontSize="small" />
                  </IconButton>

                  <TextField
                    type="number"
                    size="small"
                    value={variable.order}
                    onChange={(e) => handleOrderChange(variable.id, e.target.value)}
                    sx={{ width: 80 }}
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        step: 1,
                        style: { textAlign: 'center' },
                      },
                    }}
                  />

                  <IconButton
                    size="small"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === displayVariables.length - 1}
                  >
                    <DownIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
};
