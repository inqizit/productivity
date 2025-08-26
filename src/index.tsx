import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('✅ PWA: Service worker registered successfully');
  },
  onUpdate: (registration) => {
    console.log('🔄 PWA: New version available - update notification shown');
  },
  onOfflineReady: () => {
    console.log('📱 PWA: App is ready to work offline');
  },
  onNeedRefresh: () => {
    console.log('🔄 PWA: New content available, refresh needed');
  }
});
