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
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserStore } from '@/store/user';
import { getBrowserSessionName } from '@/utils/session';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AuthScaffold from '@/components/AuthScaffold';

export default function RegisterPage() {
  const router = useRouter();
  const { user, registerWithCredentials, loading, error, clearError } = useUserStore();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
    const ok = await registerWithCredentials({
      email,
      first_name: firstName,
      last_name: lastName,
      password,
      session_name: getBrowserSessionName(),
    });
    if (ok) router.push('/profile');
  };

  return (
    <AuthScaffold
      title="Реєстрація"
      subtitle="Створіть акаунт, щоб розпочати користування сервісом"
    >
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Stack spacing={2.25} mt={3}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Ім'я"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            fullWidth
            size="medium"
            autoComplete="given-name"
          />
          <TextField
            label="Прізвище"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            size="medium"
            autoComplete="family-name"
          />
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
            autoComplete="new-password"
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
            Зареєструватися
          </Button>

          <Divider flexItem sx={{ my: 1.5 }} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Вже маєте акаунт?
              </Typography>
              <Button
                component={Link}
                href="/login"
                variant="text"
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Увійти
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </AuthScaffold>
  );
}
