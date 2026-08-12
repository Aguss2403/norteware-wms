// Dark "Terminal Industrial" theme (design D1 + D1b, spec: Dark theme).
// Single token source for every MUI surface; CssBaseline applies the base colors.
// Primary contrast is near-black so white is never used on the CLI green.

import { createTheme } from '@mui/material/styles';

// D1 tokens — the dark palette shared by MUI and the Tailwind @theme remap.
const palette = {
  mode: 'dark',
  primary: { main: '#00ff87', contrastText: '#04140a' },
  secondary: { main: '#4af626' },
  background: { default: '#0d1117', paper: '#161b22' },
  divider: '#30363d',
  text: { primary: '#e6edf3', secondary: '#8b949e' },
  error: { main: '#f85149' },
  warning: { main: '#d29922' },
  success: { main: '#3fb950' },
};

const theme = createTheme({
  palette,
  // Match the Tailwind font stack so MUI and Tailwind surfaces read identically.
  typography: {
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    // D1b component defaults — shared finish, no per-call overrides.
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },
    MuiPaper: {
      styleOverrides: {
        // Solid surface color — drop the elevation gradient overlay.
        root: { backgroundImage: 'none', backgroundColor: palette.background.paper },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { boxShadow: 'none', borderBottom: `1px solid ${palette.divider}` },
      },
    },
  },
});

export default theme;
