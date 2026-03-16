"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register the service worker
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered: ', registration);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available, reload the page
                  console.log('New content is available; please reload.');
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });

      // Handle controller changes (new service worker becomes active)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Controller changed');
        // Optionally reload to get the latest version
        window.location.reload();
      });
    }
  }, []);

  return null; // This component doesn't render anything
}
