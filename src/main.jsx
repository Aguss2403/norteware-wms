import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClientProvider } from './context/ClientContext.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClientProvider>
        <App />
      </ClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
