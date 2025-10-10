'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Stack } from '@mui/material';
import Link from 'next/link';
import AuthScaffold from '@/components/AuthScaffold';
import { useUserStore } from '@/store/user';

export default function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const router = useRouter();
  const { user, verifyEmail, refeshSession } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    if (success) return;

    let intervalId: number | undefined;

    const startRedirect = (secs: number) => {
      setCountdown(secs);
      intervalId = window.setInterval(() => {
        setCountdown((c) => (c > 0 ? c - 1 : 0));
      }, 1000);
    };

    const confirmEmail = async () => {
      if (!token) {
        setError('Відсутній токен підтвердження');
        setLoading(false);
        return;
      }

      try {
        await verifyEmail(token);

        setSuccess('Пошта підтверджена');
        startRedirect(5);

        if (user) {
          try {
            await refeshSession();
          } catch {}
        }
      } catch {
        setError('Не валідний або прострочений токен підтвердження');
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [token, user, success, verifyEmail, refeshSession]);

  useEffect(() => {
    if (countdown === 0 && success) {
      router.push(user ? '/profile/' : '/');
    }
  }, [countdown, success, router, user]);

  return (
    <AuthScaffold title="Підтвердження пошти">
      <Box>
        <Stack spacing={2} mt={3} alignItems="center">
          {loading && (
            <>
              <CircularProgress />
              <Alert severity="info">Перевіряю токен...</Alert>
            </>
          )}

          {!loading && !success && error && <Alert severity="error">{error}</Alert>}

          {!loading && success && (
            <>
              <Alert severity="success">{success}</Alert>
              <p>Перенаправлення через {countdown} c.</p>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                  component={Link}
                  href={user ? '/profile' : '/'}
                  variant="outlined"
                  size="small"
                >
                  Перейти зараз
                </Button>
              </Stack>
            </>
          )}

          {!loading && !error && !success && <Alert severity="info">Очікування...</Alert>}
        </Stack>
      </Box>
    </AuthScaffold>
  );
}
