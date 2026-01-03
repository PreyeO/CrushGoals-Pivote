import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Register service worker only in production.
// In development we proactively unregister to avoid cached JS chunks causing React runtime mismatches.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      if (isProduction) {
        const registration = await navigator.serviceWorker.register("/sw.js");
        if (isDevelopment) {
          console.log("SW registered:", registration.scope);
        }
      } else {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch (error) {
      if (isDevelopment) {
        console.log("SW setup failed:", error);
      }
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
