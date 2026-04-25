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
import { Visibility, VisibilityOff } from '@mui/icons-material';
import AuthScaffold from '@/components/AuthScaffold';
import { validateEmail, validatePassword } from '@/utils/validators';
import { toErrorMessage } from '@/utils/errors-messages';
import { useDictionary, useLang } from '@/contexts/LangContext';

export default function LoginPage() {
  const router = useRouter();
  const lang = useLang();
  const dict = useDictionary();
  const a = dict.auth; // shorthand

  const { user, loginWithCredentials } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    setEmailError(val && !validateEmail(val) ? a.invalidEmail : '');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    setPasswordError(val && !validatePassword(val) ? a.invalidPassword : '');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      await loginWithCredentials(email, password);
      router.push(`/${lang}/profile/`);
    } catch (e) {
      setLoginError(toErrorMessage(e) || a.login.error);
      setLoading(false);
    }
  };

  const isFormValid = email && password && !emailError && !passwordError;

  useEffect(() => {
    if (user) router.push(`/${lang}/profile/`);
  }, [router, user, lang]);

  return (
    <AuthScaffold title={a.login.title} subtitle={a.login.subtitle}>
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Stack spacing={2.25} sx={{ mt: 3 }}>
          {loginError && <Alert severity="error">{loginError}</Alert>}
          <TextField
            label={a.email}
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
            fullWidth
            autoComplete="email"
            error={!!emailError}
            helperText={emailError}
          />
          <TextField
            label={a.password}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
            required
            fullWidth
            autoComplete="current-password"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            error={!!passwordError}
            helperText={passwordError}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !isFormValid}
            sx={{ py: 1.25, borderRadius: 3, textTransform: 'none', fontWeight: 700 }}
          >
            {a.login.submit}
          </Button>

          <Divider flexItem sx={{ my: 1.5 }} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}
          >
            <Button
              component={Link}
              href={`/${lang}/reset-password`}
              sx={{ textTransform: 'none' }}
            >
              {a.login.forgotPassword}
            </Button>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {a.login.noAccount}
              </Typography>
              <Button
                component={Link}
                href={`/${lang}/register`}
                variant="text"
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                {a.login.register}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </AuthScaffold>
  );
}
