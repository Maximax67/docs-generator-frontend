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
import { Visibility, VisibilityOff } from '@mui/icons-material';
import AuthScaffold from '@/components/AuthScaffold';
import { validateEmail, validatePassword, validateName } from '@/utils/validators';
import { toErrorMessage } from '@/utils/errors-messages';
import { useDictionary, useLang } from '@/contexts/LangContext';

export default function RegisterPage() {
  const router = useRouter();
  const dict = useDictionary();
  const lang = useLang();
  const { user, registerWithCredentials } = useUserStore();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTos, setAgreeTos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string>('');
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
    setFirstNameError(val && !validateName(val) ? dict.auth.invalidFirstName : '');
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLastName(val);
    setLastNameError(val && !validateName(val) ? dict.auth.invalidLastName : '');
  };

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

  const handleTogglePasswordVisibility = () => {
    setShowPassword((v) => !v);
  };

  const handleAgreeTosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgreeTos(e.target.checked);
  };

  useEffect(() => {
    if (user) {
      router.push(`/${lang}/profile/`);
    }
  }, [router, user, lang]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTos) return;

    setLoading(true);
    setRegisterError('');

    try {
      await registerWithCredentials({
        email,
        first_name: firstName,
        last_name: lastName,
        password,
      });
      router.push(`/${lang}/profile/`);
    } catch (e) {
      setRegisterError(toErrorMessage(e) || dict.auth.register.error);
      setLoading(false);
    }
  };

  return (
    <AuthScaffold title={dict.auth.register.title} subtitle={dict.auth.register.subtitle}>
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Stack spacing={2.25} sx={{ mt: 3 }}>
          {registerError && <Alert severity="error">{registerError}</Alert>}
          <TextField
            label={dict.auth.firstName}
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
            label={dict.auth.lastName}
            value={lastName}
            onChange={handleLastNameChange}
            fullWidth
            size="medium"
            autoComplete="family-name"
            error={!!lastNameError}
            helperText={lastNameError}
          />
          <TextField
            label={dict.auth.email}
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
            label={dict.auth.password}
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
            control={<Checkbox checked={agreeTos} onChange={handleAgreeTosChange} required />}
            label={
              <Typography component="span" variant="body2">
                {dict.auth.register.agreeToTerms}{' '}
                <Link
                  href={`/${lang}/tos`}
                  style={{
                    color: 'inherit',
                    textDecoration: 'underline',
                    fontWeight: 600,
                  }}
                >
                  {dict.auth.register.termsOfService}
                </Link>{' '}
                {dict.auth.register.and}{' '}
                <Link
                  href={`/${lang}/privacy`}
                  style={{
                    color: 'inherit',
                    textDecoration: 'underline',
                    fontWeight: 600,
                  }}
                >
                  {dict.auth.register.privacyPolicy}
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
            {dict.auth.register.submit}
          </Button>

          <Divider flexItem sx={{ my: 1.5 }} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {dict.auth.register.alreadyHaveAccount}
              </Typography>
              <Button
                component={Link}
                href={`/${lang}/login`}
                variant="text"
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                {dict.auth.register.signIn}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </AuthScaffold>
  );
}
