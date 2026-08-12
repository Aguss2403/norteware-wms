import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme.js';
import { ClientProvider } from './context/ClientContext.jsx';
import App from './App.jsx';
import './index.css';

// Wiring order (design D1): router owns routing, ThemeProvider owns theming,
// CssBaseline applies the dark base colors, ClientProvider owns client state.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ClientProvider>
          <App />
        </ClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
