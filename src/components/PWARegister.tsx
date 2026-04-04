"use client";
import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('Oasis Node Registered:', registration.scope);
        },
        (err) => {
          console.log('Oasis Signal Interference:', err);
        }
      );
    }
  }, []);

  return null;
}
