'use client';

import { ReactNode } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';

type AuthScaffoldProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function AuthScaffold({ title, subtitle, children }: AuthScaffoldProps) {
  const theme = useTheme();

  const paperBg = alpha(theme.palette.background.paper, 0.6);
  const cardShadow =
    theme.palette.mode === 'dark'
      ? '0 8px 24px rgba(0,0,0,0.45)'
      : '0 10px 30px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.15)';

  return (
    <Box
      sx={{
        minHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 6,
        background: `radial-gradient(60rem 60rem at 0% 0%, rgba(99,102,241,0.25), transparent 60%),
          radial-gradient(60rem 60rem at 100% 0%, rgba(236,72,153,0.25), transparent 60%),
          radial-gradient(80rem 60rem at 50% 100%, rgba(56,189,248,0.25), transparent 60%)`,
      }}
    >
      <Container maxWidth="sm" sx={{ p: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            backdropFilter: 'blur(10px)',
            backgroundColor: paperBg,
            boxShadow: cardShadow,
          }}
        >
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="h4" fontWeight={700} letterSpacing={0.2}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Stack>

          <Box sx={{ mt: 3 }}>{children}</Box>
        </Paper>
      </Container>
    </Box>
  );
}
