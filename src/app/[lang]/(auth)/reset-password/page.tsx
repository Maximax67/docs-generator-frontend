'use client';

import { useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  CircularProgress,
} from '@mui/material';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/user';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import AuthScaffold from '@/components/AuthScaffold';
import { validateEmail, validatePassword } from '@/utils/validators';
import { toErrorMessage } from '@/utils/errors-messages';
import { useDictionary, useLang } from '@/contexts/LangContext';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get('token');
  const dict = useDictionary();
  const lang = useLang();
  const { requestPasswordReset, changePasswordWithToken } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    setEmailError(val && !validateEmail(val) ? dict.auth.invalidEmail : '');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    setPasswordError(val && !validatePassword(val) ? dict.auth.invalidPassword : '');
  };

  const onRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setDone(true);
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const onChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await changePasswordWithToken(token, password);
      setDone(true);
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold
      title={dict.auth.resetPassword.title}
      subtitle={
        token
          ? dict.auth.resetPassword.subtitleChange
          : dict.auth.resetPassword.subtitleRequest
      }
    >
      {token ? (
        <Box component="form" onSubmit={onChange} noValidate>
          <Stack spacing={2.25} sx={{ mt: 3 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {done ? (
              <Alert severity="success">{dict.auth.resetPassword.success}</Alert>
            ) : (
              <>
                <TextField
                  label={dict.auth.resetPassword.newPassword}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  required
                  fullWidth
                  size="medium"
                  autoComplete="new-password"
                  error={!!passwordError}
                  helperText={passwordError}
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
                  disabled={loading || !password || !!passwordError}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
                  sx={{
                    py: 1.25,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 700,
                  }}
                >
                  {dict.auth.resetPassword.submit}
                </Button>
              </>
            )}
            <Divider flexItem sx={{ my: 1.5 }} />
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center' }}>
              <Button component={Link} href={`/${lang}/login`} sx={{ textTransform: 'none' }}>
                {dict.auth.resetPassword.backToSignIn}
              </Button>
            </Stack>
          </Stack>
        </Box>
      ) : (
        <Box component="form" onSubmit={onRequest} noValidate>
          <Stack spacing={2.25} sx={{ mt: 3 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {done ? (
              <Alert severity="success">{dict.auth.resetPassword.emailSent}</Alert>
            ) : (
              <>
                <TextField
                  label={dict.auth.email}
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={loading}
                  required
                  fullWidth
                  size="medium"
                  autoComplete="email"
                  error={!!emailError}
                  helperText={emailError}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !email || !!emailError}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
                  sx={{
                    py: 1.25,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 700,
                  }}
                >
                  {dict.auth.resetPassword.sendLink}
                </Button>
              </>
            )}
            <Divider flexItem sx={{ my: 1.5 }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'center' }}>
              <Button component={Link} href={`/${lang}/login`} sx={{ textTransform: 'none' }}>
                {dict.auth.resetPassword.backToSignIn}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </AuthScaffold>
  );
}
