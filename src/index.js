import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { applyAuditToFormData, buildAuditPayload, getLoggedInUserId } from './utils/audit';

// 🔥 ADD THIS
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient(); // 🔥 create client

axios.interceptors.request.use((config) => {
  const userId = getLoggedInUserId();

  if (userId && config && typeof config === 'object') {
    if (config.data instanceof FormData) {
      config.data = applyAuditToFormData(config.data, config.method, userId);
    } else if (config.data && typeof config.data === 'string') {
      try {
        const parsed = JSON.parse(config.data);
        const audited = buildAuditPayload(config.method, parsed, userId);
        config.data = JSON.stringify(audited);
      } catch {
        // ignore non-JSON payloads
      }
    } else if (config.data && typeof config.data === 'object') {
      config.data = buildAuditPayload(config.method, config.data, userId);
    }

    config.headers = {
      ...config.headers,
      'X-User-Id': userId,
    };
  }

  return config;
});

const originalFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const userId = getLoggedInUserId();
  const method = (init.method || 'GET').toUpperCase();

  if (userId && ['POST', 'PUT', 'PATCH'].includes(method)) {
    const headers = new Headers(init.headers || {});
    headers.set('X-User-Id', userId);

    let body = init.body;

    if (body instanceof FormData) {
      body = applyAuditToFormData(body, method, userId);
    } else if (body !== undefined && body !== null) {
      if (typeof body === 'string') {
        try {
          const parsed = JSON.parse(body);
          const audited = buildAuditPayload(method, parsed, userId);
          body = JSON.stringify(audited);
        } catch {
          // keep as-is for non-JSON payloads
        }
      } else if (typeof body === 'object') {
        body = JSON.stringify(buildAuditPayload(method, body, userId));
      }
    }

    return originalFetch(input, {
      ...init,
      method,
      headers,
      body,
    });
  }

  return originalFetch(input, init);
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* 🔥 WRAP HERE */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

reportWebVitals();