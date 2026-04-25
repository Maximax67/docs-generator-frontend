'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, CircularProgress, Stack, Typography } from '@mui/material';
import { useUserStore } from '@/store/user';

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useUserStore();

  useEffect(() => {
    (async () => {
      await logout();
      router.replace('/');
    })();
  }, [logout, router]);

  return (
    <Container sx={{ py: 6 }}>
      <Stack spacing={2} alignItems="center">
        <CircularProgress />
        <Typography>Вихід...</Typography>
      </Stack>
    </Container>
  );
}
