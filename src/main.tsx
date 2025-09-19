/**
 * Main entry point for the Deforum Web Pilot application
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

// Create root and render app
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
