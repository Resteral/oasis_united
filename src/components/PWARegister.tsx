"use client";
import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    // 1. Register Service Worker (The Oasis Node)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('Oasis Signal Synchronized:', registration.scope);
        },
        (err) => {
          console.log('Oasis Signal Interference:', err);
        }
      );
    }

    // 2. Deployment Protocol (A2HS)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      // Store event on window for global access
      (window as any).deferredPrompt = e;
      console.log('Oasis Ready for Deployment to Home Screen');
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('oasis_pwa_ready'));
    });
  }, []);

  return null;
}
