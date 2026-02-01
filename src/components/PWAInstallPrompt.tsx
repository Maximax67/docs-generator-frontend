'use client';

import { useEffect, useState } from 'react';
import { Snackbar, Button, IconButton, Slide } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      if (localStorage.getItem('pwaPromptShown')) return;

      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setShowPrompt(true);
      localStorage.setItem('pwaPromptShown', 'true');
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => setShowPrompt(false);

  return (
    <Snackbar
      open={showPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      slots={{ transition: Slide }}
      slotProps={{ transition: { direction: 'up' } }}
      message="Встановити додаток?"
      sx={{
        '& .MuiPaper-root': {
          backgroundColor: (theme) => theme.palette.background.paper,
          color: (theme) => theme.palette.text.primary,
        },
      }}
      action={
        <>
          <Button color="primary" size="small" onClick={handleInstallClick}>
            Встановити
          </Button>
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </>
      }
    />
  );
}
