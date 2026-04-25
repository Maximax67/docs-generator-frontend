import { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  AlertColor,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { useDictionary } from '@/contexts/LangContext';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: AlertColor;
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  severity = 'warning',
}) => {
  const dict = useDictionary();
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          elevation: 3,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <WarningIcon />
        {title ?? dict.confirmDialog.defaultTitle}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} color="inherit">
          {cancelText ?? dict.confirmDialog.cancel}
        </Button>
        <Button onClick={onConfirm} variant="contained" color={severity} autoFocus>
          {confirmText ?? dict.confirmDialog.defaultConfirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
