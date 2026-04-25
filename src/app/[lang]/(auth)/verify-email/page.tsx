'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Stack } from '@mui/material';
import Link from 'next/link';
import AuthScaffold from '@/components/AuthScaffold';
import { useUserStore } from '@/store/user';
import { useDictionary, useLang } from '@/contexts/LangContext';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const token = params.get('token');
  const router = useRouter();
  const dict = useDictionary();
  const lang = useLang();
  const { user, verifyEmail, refeshSession } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const confirmEmail = async () => {
      if (!token) {
        setError(dict.auth.verifyEmail.missingToken);
        setLoading(false);
        return;
      }

      try {
        await verifyEmail(token);
        setSuccess(dict.auth.verifyEmail.success);

        if (user) {
          try {
            await refeshSession();
          } catch {}
        }
      } catch {
        setError(dict.auth.verifyEmail.invalidToken);
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, verifyEmail, refeshSession]);

  useEffect(() => {
    if (!success) return;

    setCountdown(5);
    intervalRef.current = window.setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [success]);

  useEffect(() => {
    if (countdown === 0 && success) {
      router.push(user ? `/${lang}/profile/` : `/${lang}/`);
    }
  }, [countdown, success, router, user, lang]);

  return (
    <AuthScaffold title={dict.auth.verifyEmail.title}>
      <Box>
        <Stack spacing={2} mt={3} alignItems="center">
          {loading && (
            <>
              <CircularProgress />
              <Alert severity="info">{dict.auth.verifyEmail.verifying}</Alert>
            </>
          )}

          {!loading && !success && error && <Alert severity="error">{error}</Alert>}

          {!loading && success && (
            <>
              <Alert severity="success">{success}</Alert>
              <p>
                {dict.auth.verifyEmail.redirectingIn} {countdown} {dict.auth.verifyEmail.seconds}.
              </p>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                  component={Link}
                  href={user ? `/${lang}/profile` : `/${lang}`}
                  variant="outlined"
                  size="small"
                >
                  {dict.auth.verifyEmail.goNow}
                </Button>
              </Stack>
            </>
          )}

          {!loading && !error && !success && <Alert severity="info">{dict.auth.verifyEmail.waiting}</Alert>}
        </Stack>
      </Box>
    </AuthScaffold>
  );
}
