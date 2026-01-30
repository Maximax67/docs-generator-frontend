'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { ThemeMode, ThemeModeContextValue } from '@/types/theme';

const THEME_KEY = 'app-theme-mode';
const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within AppThemeProvider');
  return ctx;
}

export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
      const preferred = saved
        ? saved
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';

      setMode(preferred);
    } catch {
      setMode('light');
    } finally {
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(THEME_KEY, mode);
    } catch {}
  }, [mode, mounted]);

  const toggle = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  const theme = useMemo(
    () =>
      createTheme({
        cssVariables: true,
        palette: { mode },
        typography: {
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"',
        },
        shape: { borderRadius: 10 },
        components: {
          MuiCssBaseline: {
            styleOverrides: (themeParam) => ({
              html: { colorScheme: themeParam.palette.mode, height: '100%' },
              body: {
                minHeight: '100%',
                backgroundColor: themeParam.palette.background.default,
                color: themeParam.palette.text.primary,
                transition: 'background-color 150ms ease, color 150ms ease',
              },
              '#__next, body > div': { minHeight: '100%' },
            }),
          },
        },
      }),
    [mode],
  );

  if (!mounted) return null;

  return (
    <ThemeModeContext.Provider value={{ mode, toggle, setMode, mounted }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100dvh',
            bgcolor: 'background.default',
            color: 'text.primary',
          }}
        >
          {children}
        </Box>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
