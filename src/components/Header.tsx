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
  Home as HomeIcon,
  Person as PersonIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useUserStore } from '@/store/user';
import { useThemeMode } from '@/providers/AppThemeProvider';
import { useState, useMemo } from 'react';
import { isAdminUser } from '@/utils/is-admin';

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const { user } = useUserStore();
  const isAdmin = isAdminUser(user);
  const { mode, toggle, mounted } = useThemeMode();

  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = useMemo(() => {
    const links = [
      { href: '/', label: 'Головна', icon: <HomeIcon /> },
      { href: '/documents', label: 'Документи', icon: <DescriptionIcon /> },
      { href: '/faq', label: 'FAQ', icon: <HelpOutlineIcon /> },
    ];

    if (isAdmin) {
      links.push({ href: '/generations', label: 'Генерації', icon: <PictureAsPdfIcon /> });
      links.push({ href: '/users', label: 'Користувачі', icon: <PersonIcon /> });
    }

    return links;
  }, [isAdmin]);

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

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar sx={{ gap: 1 }}>
        {isMobile && (
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Меню"
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box sx={{ flexGrow: 1 }}>
          <Link
            href="/"
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

        <IconButton color="inherit" onClick={toggle} aria-label="Змінити тему">
          {mode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>

        {user ? (
          <IconButton
            component={Link}
            size={isMobile ? 'medium' : 'large'}
            color="inherit"
            href="/profile"
            aria-label="Профіль"
          >
            <AccountCircleIcon />
          </IconButton>
        ) : isMobile ? (
          <IconButton
            component={Link}
            size="medium"
            color="inherit"
            href="/login"
            aria-label="Увійти"
          >
            <LoginIcon />
          </IconButton>
        ) : (
          <Button component={Link} href="/login" color="inherit" startIcon={<LoginIcon />}>
            Увійти
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
