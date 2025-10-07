'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserStore } from '@/store/user';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AuthScaffold from '@/components/AuthScaffold';
import { validateEmail, validatePassword, validateName } from '@/utils/validators';

export default function RegisterPage() {
  const router = useRouter();
  const { user, registerWithCredentials, loading, error, clearError } = useUserStore();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTos, setAgreeTos] = useState(false);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [firstNameError, setFirstNameError] = useState<string>('');
  const [lastNameError, setLastNameError] = useState<string>('');

  const isFormValid =
    firstName &&
    email &&
    password &&
    agreeTos &&
    !emailError &&
    !passwordError &&
    !firstNameError &&
    !lastNameError;

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFirstName(val);
    setFirstNameError(val && !validateName(val) ? "Не валідне ім'я" : '');
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLastName(val);
    setLastNameError(val && !validateName(val) ? 'Не валідне прізвище' : '');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    setEmailError(val && !validateEmail(val) ? 'Не валідна електронна пошта' : '');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    setPasswordError(val && !validatePassword(val) ? 'Пароль має бути від 8 до 32 символів' : '');
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((v) => !v);
  };

  const handleAgreeTosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgreeTos(e.target.checked);
  };

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
    if (!agreeTos) return;

    const ok = await registerWithCredentials({
      email,
      first_name: firstName,
      last_name: lastName,
      password,
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
            onChange={handleFirstNameChange}
            required
            fullWidth
            size="medium"
            autoComplete="given-name"
            error={!!firstNameError}
            helperText={firstNameError}
          />
          <TextField
            label="Прізвище"
            value={lastName}
            onChange={handleLastNameChange}
            fullWidth
            size="medium"
            autoComplete="family-name"
            error={!!lastNameError}
            helperText={lastNameError}
          />
          <TextField
            label="Ел. пошта"
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
            fullWidth
            size="medium"
            autoComplete="email"
            error={!!emailError}
            helperText={emailError}
          />
          <TextField
            label="Пароль"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
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
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            error={!!passwordError}
            helperText={passwordError}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={agreeTos}
                onChange={handleAgreeTosChange}
                required
              />
            }
            label={
              <Typography component="span" variant="body2">
                Я погоджуюся з{' '}
                <Link
                  href="/tos"
                  style={{
                    color: 'inherit',
                    textDecoration: 'underline',
                    fontWeight: 600,
                  }}
                >
                  умовами користування
                </Link>
              </Typography>
            }
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !isFormValid}
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
