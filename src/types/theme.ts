export type ThemeMode = 'light' | 'dark';

export type ThemeModeContextValue = {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
  mounted: boolean;
};
