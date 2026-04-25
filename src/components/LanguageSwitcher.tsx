'use client';

import { useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Menu, MenuItem, Box, Typography } from '@mui/material';
import { KeyboardArrowDown as ArrowDownIcon } from '@mui/icons-material';
import { locales, localeLabels, type Locale, getFlagUrl } from '@/i18n';
import { useLang } from '@/contexts/LangContext';

export function LanguageSwitcher() {
  const lang = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSwitch = (newLang: Locale) => {
    handleClose();
    if (newLang === lang) return;

    const newPath = pathname.replace(/^\/(en|uk)/, `/${newLang}`);

    startTransition(() => {
      router.push(newPath);
    });
  };

  return (
    <>
      <Button
        color="inherit"
        onClick={handleOpen}
        endIcon={<ArrowDownIcon fontSize="small" />}
        aria-label="Select language"
        disabled={isPending}
        sx={{
          minWidth: 'auto',
          px: 1,
          gap: 0.5,
          textTransform: 'none',
          opacity: isPending ? 0.7 : 1,
          '& .MuiButton-endIcon': { ml: 0.25 },
        }}
      >
        <Box
          component="img"
          src={getFlagUrl(lang)}
          alt={localeLabels[lang]}
          sx={{
            width: 20,
            height: 14,
            objectFit: 'cover',
            borderRadius: '2px',
          }}
        />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { elevation: 3, sx: { minWidth: 160, mt: 0.5 } } }}
      >
        {locales.map((code) => (
          <MenuItem
            key={code}
            selected={code === lang}
            onClick={() => handleSwitch(code)}
            sx={{ gap: 1.5, py: 1 }}
          >
            <Box
              component="img"
              src={getFlagUrl(code)}
              alt={localeLabels[code]}
              sx={{
                width: 20,
                height: 14,
                objectFit: 'cover',
                borderRadius: '2px',
              }}
            />
            <Typography variant="body2">{localeLabels[code]}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
