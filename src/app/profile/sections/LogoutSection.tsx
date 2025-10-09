import React from 'react';
import { Stack, Typography, Button } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';

type LogoutSectionProps = {
  onLogout: () => void;
  onLogoutEverywhere: () => void;
  onDeleteAccount: () => void;
};

export default function LogoutSection({
  onLogout,
  onLogoutEverywhere,
  onDeleteAccount,
}: LogoutSectionProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Вихід</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button startIcon={<LogoutIcon />} color="warning" variant="outlined" onClick={onLogout}>
          Вийти
        </Button>

        <Button
          startIcon={<LogoutIcon />}
          color="error"
          variant="outlined"
          onClick={onLogoutEverywhere}
        >
          Вийти з усіх сесій
        </Button>

        <Button color="error" variant="contained" onClick={onDeleteAccount}>
          Видалити акаунт
        </Button>
      </Stack>
    </Stack>
  );
}
