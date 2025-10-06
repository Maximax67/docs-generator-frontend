'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useUserStore } from '@/store/user';

export default function RateLimitOverlay() {
  const rateLimitedUntil = useUserStore((s) => s.rateLimitedUntil);
  const clearRateLimit = useUserStore((s) => s.clearRateLimit);

  const [now, setNow] = useState<number>(() => Date.now());

  const msLeft = useMemo(() => {
    if (!rateLimitedUntil) return 0;
    return Math.max(0, rateLimitedUntil - now);
  }, [rateLimitedUntil, now]);

  useEffect(() => {
    if (!rateLimitedUntil) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [rateLimitedUntil]);

  useEffect(() => {
    if (rateLimitedUntil && msLeft === 0) {
      clearRateLimit();
    }
  }, [msLeft, rateLimitedUntil, clearRateLimit]);

  if (!rateLimitedUntil || msLeft <= 0) return null;

  const secondsLeft = Math.ceil(msLeft / 1000);

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: (theme) => theme.zIndex.modal + 10,
        bgcolor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 640,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          p: { xs: 3, sm: 4 },
          textAlign: 'center',
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Typography
            variant="h1"
            sx={{
              fontWeight: 800,
              lineHeight: 1,
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: 2,
            }}
          >
            429
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Занадто багато запитів
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Будь ласка, зачекайте трохи та спробуйте ще раз.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ви зможете повторити запит через {secondsLeft} с.
          </Typography>
          <Button variant="contained" onClick={clearRateLimit}>
            Закрити
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
