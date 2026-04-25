'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Collapse,
  Divider,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  AccountCircle as AccountCircleIcon,
  Login as LoginIcon,
  Description as DescriptionIcon,
  HelpOutline as HelpOutlineIcon,
  Person as PersonIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useUserStore } from '@/store/user';
import { useThemeMode } from '@/providers/AppThemeProvider';
import { useState, useMemo } from 'react';
import { isAdminUser } from '@/utils/is-admin';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useDictionary, useLang } from '@/contexts/LangContext';

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const { user } = useUserStore();
  const isAdmin = isAdminUser(user);
  const { mode, toggle, mounted } = useThemeMode();
  const dict = useDictionary();
  const lang = useLang();

  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = useMemo(() => {
    const prefix = `/${lang}`;
    const links = [
      { href: `${prefix}/documents`, label: dict.nav.documents, icon: <DescriptionIcon /> },
      { href: `${prefix}/faq`, label: dict.nav.faq, icon: <HelpOutlineIcon /> },
    ];

    if (isAdmin) {
      links.push({
        href: `${prefix}/generations`,
        label: dict.nav.generations,
        icon: <PictureAsPdfIcon />,
      });
      links.push({
        href: `${prefix}/users`,
        label: dict.nav.users,
        icon: <PersonIcon />,
      });
    }

    return links;
  }, [isAdmin, dict, lang]);

  if (!mounted) return null;

  const renderLinks = (isMobileView = false) =>
    navLinks.map(({ href, label, icon }) =>
      isMobileView ? (
        <Button
          key={href}
          fullWidth
          color="inherit"
          component={Link}
          href={href}
          startIcon={icon}
          sx={{ justifyContent: 'flex-start' }}
          onClick={() => setMobileOpen(false)}
        >
          {label}
        </Button>
      ) : (
        <Button key={href} component={Link} href={href} color="inherit" startIcon={icon}>
          {label}
        </Button>
      ),
    );

  const prefix = `/${lang}`;

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar sx={{ gap: { xs: 0, sm: 1 } }}>
        {isMobile && (
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={dict.nav.menu}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box sx={{ flexGrow: 1 }}>
          <Link
            href={`${prefix}/`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Image
              src="/logo.png"
              alt="Logo"
              width={isMobile ? 35 : 45}
              height={isMobile ? 35 : 45}
            />
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Docs Generator
            </Typography>
          </Link>
        </Box>

        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>{renderLinks()}</Box>
        )}

        <LanguageSwitcher />

        <IconButton color="inherit" onClick={toggle} aria-label={dict.nav.toggleTheme}>
          {mode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>

        {user ? (
          <IconButton
            component={Link}
            size={isMobile ? 'medium' : 'large'}
            color="inherit"
            href={`${prefix}/profile`}
            aria-label={dict.nav.profile}
          >
            <AccountCircleIcon />
          </IconButton>
        ) : isMobile ? (
          <IconButton
            component={Link}
            size="medium"
            color="inherit"
            href={`${prefix}/login`}
            aria-label={dict.nav.signIn}
          >
            <LoginIcon />
          </IconButton>
        ) : (
          <Button
            component={Link}
            href={`${prefix}/login`}
            color="inherit"
            startIcon={<LoginIcon />}
          >
            {dict.nav.signIn}
          </Button>
        )}
      </Toolbar>

      {isMobile && (
        <Collapse in={mobileOpen} unmountOnExit timeout="auto">
          <Divider sx={{ opacity: 0.2 }} />
          <Box sx={{ px: 2, py: 1 }}>{renderLinks(true)}</Box>
        </Collapse>
      )}
    </AppBar>
  );
}
