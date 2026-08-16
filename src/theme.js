// Light "SaaS workspace" theme (design D1 + D2, spec: light theme palette).
// Single token source for every MUI surface; CssBaseline applies the base colors.
// Brand green #2FAE58 is used for accents, icons, and large text; contained
// buttons rest on green-deep #1F8A44 because white-on-#2FAE58 is ~2.3:1 (fails
// AA) while white-on-#1F8A44 is ~4.4:1 (passes AA).

import { createTheme } from '@mui/material/styles';

// D1 tokens — the light palette shared by MUI and the Tailwind @theme remap.
const palette = {
  mode: 'light',
  primary: { main: '#2FAE58', dark: '#1F8A44', contrastText: '#FFFFFF' },
  secondary: { main: '#A8E063', contrastText: '#10241A' },
  background: { default: '#F4F7F3', paper: '#FFFFFF' },
  divider: '#E1E8E0',
  text: { primary: '#10241A', secondary: '#5C6B62' },
  error: { main: '#E1554F' },
  warning: { main: '#E8A93B' },
  info: { main: '#3B82C4' },
  success: { main: '#2FAE58' },
};

const theme = createTheme({
  palette,
  shape: { borderRadius: 16 },
  // D2 typography — self-hosted via @fontsource (offline-safe classroom demo).
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h1: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
    h2: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
    h3: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        // Subtle light shadow + hairline border — never hard drop shadows.
        root: { boxShadow: '0 1px 2px rgba(16,36,26,.04)', border: '1px solid #E1E8E0' },
      },
    },
    MuiButton: {
      variants: [
        // White contrast text only on green-deep (AA): resting primary state.
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            backgroundColor: '#1F8A44',
            '&:hover': { backgroundColor: '#177A3B' },
          },
        },
      ],
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 10 },
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
  },
});

export default theme;