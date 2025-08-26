// Service Worker Registration with Update Notifications

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: () => void;
  onNeedRefresh?: () => void;
};

let deferredPrompt: any = null;
let swRegistration: ServiceWorkerRegistration | null = null;

export function register(config?: Config) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL!, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('🔧 PWA: App is being served cache-first by a service worker');
          config?.onOfflineReady?.();
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }

  // Handle PWA install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPromotion();
  });

  // Listen for app installed
  window.addEventListener('appinstalled', () => {
    console.log('📱 PWA: App was installed');
    deferredPrompt = null;
    hideInstallPromotion();
  });
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      swRegistration = registration;
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('🔄 PWA: New content is available; please refresh');
              config?.onUpdate?.(registration);
              showUpdateNotification(registration);
            } else {
              console.log('📦 PWA: Content is cached for offline use');
              config?.onSuccess?.(registration);
              config?.onOfflineReady?.();
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('❌ PWA: Service worker registration failed:', error);
    });

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SW_UPDATED') {
      console.log('✅ PWA:', event.data.message);
    }
  });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('🔌 PWA: No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Update notification system
function showUpdateNotification(registration: ServiceWorkerRegistration) {
  // Remove any existing notification
  const existingNotification = document.getElementById('sw-update-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.id = 'sw-update-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="font-size: 24px;">🚀</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 4px;">New Version Available!</div>
        <div style="opacity: 0.9; font-size: 13px;">Tap to update and get the latest features</div>
      </div>
      <button id="sw-update-btn" style="
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
      ">Update</button>
      <button id="sw-dismiss-btn" style="
        background: none;
        border: none;
        color: rgba(255,255,255,0.7);
        cursor: pointer;
        font-size: 18px;
        padding: 4px;
        line-height: 1;
      ">×</button>
    </div>
  `;

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  // Handle update button
  document.getElementById('sw-update-btn')?.addEventListener('click', () => {
    updateServiceWorker(registration);
  });

  // Handle dismiss button
  document.getElementById('sw-dismiss-btn')?.addEventListener('click', () => {
    notification.remove();
  });

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 10000);
}

function updateServiceWorker(registration: ServiceWorkerRegistration) {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Listen for the controlling service worker change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }
}

// Install promotion
function showInstallPromotion() {
  // Only show if not already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return;
  }

  const promotion = document.createElement('div');
  promotion.id = 'pwa-install-promotion';
  promotion.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    animation: slideUp 0.3s ease-out;
  `;

  promotion.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="font-size: 24px;">📱</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 4px;">Install Productivity Suite</div>
        <div style="opacity: 0.9; font-size: 13px;">Add to your home screen for quick access</div>
      </div>
      <button id="pwa-install-btn" style="
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
      ">Install</button>
      <button id="pwa-dismiss-btn" style="
        background: none;
        border: none;
        color: rgba(255,255,255,0.7);
        cursor: pointer;
        font-size: 18px;
        padding: 4px;
        line-height: 1;
      ">×</button>
    </div>
  `;

  // Add animation
  const style = document.createElement('style');
  style.textContent += `
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;

  document.body.appendChild(promotion);

  // Handle install
  document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install outcome: ${outcome}`);
      deferredPrompt = null;
      promotion.remove();
    }
  });

  // Handle dismiss
  document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
    promotion.remove();
  });
}

function hideInstallPromotion() {
  const promotion = document.getElementById('pwa-install-promotion');
  if (promotion) {
    promotion.remove();
  }
}

// Export utilities
export { swRegistration };
