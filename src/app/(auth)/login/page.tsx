'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user';
import { getBrowserSessionName } from '@/utils/session';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AuthScaffold from '@/components/AuthScaffold';

export default function LoginPage() {
  const router = useRouter();
  const { user, loginWithCredentials, loading, error, clearError } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/profile');
    }
  }, [router, user]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await loginWithCredentials(email, password, getBrowserSessionName());
    if (ok) router.push('/profile');
  };

  return (
    <AuthScaffold
      title="Увійти"
      subtitle="Раді бачити вас знову. Введіть свої дані, щоб продовжити"
    >
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Stack spacing={2.25} mt={3}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Ел. пошта"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            size="medium"
            autoComplete="email"
          />
          <TextField
            label="Пароль"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            size="medium"
            autoComplete="current-password"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              py: 1.25,
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            Увійти
          </Button>

          <Divider flexItem sx={{ my: 1.5 }} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Button component={Link} href="/reset-password" sx={{ textTransform: 'none' }}>
              Забули пароль?
            </Button>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Немає акаунта?
              </Typography>
              <Button
                component={Link}
                href="/register"
                variant="text"
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Зареєструватися
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </AuthScaffold>
  );
}
