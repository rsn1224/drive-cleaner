import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';
import { ConfirmProvider } from './lib/confirmContext';
import { ToastProvider } from './lib/toastContext';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ToastProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </ToastProvider>
    </StrictMode>,
  );
}
