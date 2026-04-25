'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, CircularProgress, Stack, Typography } from '@mui/material';
import { useUserStore } from '@/store/user';
import { useDictionary, useLang } from '@/contexts/LangContext';

export default function LogoutPage() {
  const router = useRouter();
  const dict = useDictionary();
  const lang = useLang();
  const { logout } = useUserStore();

  useEffect(() => {
    (async () => {
      await logout();
      router.replace(`/${lang}/`);
    })();
  }, [logout, router, lang]);

  return (
    <Container sx={{ py: 6 }}>
      <Stack spacing={2} alignItems="center">
        <CircularProgress />
        <Typography>{dict.auth.logout.loading}</Typography>
      </Stack>
    </Container>
  );
}
