import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const isDevelopment = import.meta.env.DEV;

// Register service worker for PWA push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      if (isDevelopment) {
        console.log('SW registered:', registration.scope);
      }
    } catch (error) {
      if (isDevelopment) {
        console.log('SW registration failed:', error);
      }
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
