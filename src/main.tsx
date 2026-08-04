import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import 'antd/dist/reset.css'
import './index.css'
import App from './App.tsx'
import { queryClient } from './lib/queryClient'
import { store } from './store'

// Global Fetch Interceptor to prevent multiple rapid duplicate API calls (Double Clicks)
const originalFetch = window.fetch;
const pendingRequests = new Map();

window.fetch = async (...args) => {
  const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
  const options = args[1] || {};
  const method = options.method || 'GET';
  
  // Only deduplicate POST/PUT/DELETE/PATCH requests (prevents double submit)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
    const requestKey = `${method}_${url}_${options.body || ''}`;
    
    // If exact same request is already running, wait for it instead of sending new one
    if (pendingRequests.has(requestKey)) {
      console.warn('Blocked duplicate API call to:', url);
      return pendingRequests.get(requestKey);
    }
    
    const promise = originalFetch(...args).finally(() => {
      pendingRequests.delete(requestKey);
    });
    
    pendingRequests.set(requestKey, promise);
    return promise;
  }
  
  return originalFetch(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)
