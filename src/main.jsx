import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme.js';
import { ClientProvider } from './context/ClientContext.jsx';
import { RoleProvider } from './context/RoleContext.jsx';
import App from './App.jsx';

// D2 self-hosted fonts (@fontsource, offline-safe classroom demo) — loaded
// before index.css so Tailwind utilities can reference the same families.
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './index.css';

// Wiring order (design D1): router owns routing, ThemeProvider owns theming,
// CssBaseline applies the light base colors, ClientProvider owns client state,
// and RoleProvider owns the browser-only demo role.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RoleProvider>
          <ClientProvider>
            <App />
          </ClientProvider>
        </RoleProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
