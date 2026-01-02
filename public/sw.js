// Service Worker for CrushGoals PWA with Offline Support

const CACHE_NAME = "crushgoals-v1.1";
const API_CACHE_NAME = "crushgoals-api-v1.1";
const STATIC_CACHE_NAME = "crushgoals-static-v1.1";

// Files to cache immediately
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// API endpoints to cache
const API_ENDPOINTS = [
  "/rest/v1/profiles",
  "/rest/v1/goals",
  "/rest/v1/tasks",
  "/rest/v1/user_stats",
  "/rest/v1/achievements",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing");
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log("Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating");
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== API_CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME
            ) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      clients.claim(),
    ])
  );
});

// Fetch event - handle requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (
    url.origin === self.location.origin &&
    API_ENDPOINTS.some((endpoint) => url.pathname.includes(endpoint))
  ) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Default network-first strategy for other requests
  event.respondWith(
    fetch(request).catch(() => {
      // If network fails, try cache
      return caches.match(request);
    })
  );
});

// Handle API requests with cache-first strategy for GET, network-first for others
async function handleApiRequest(request) {
  // For GET requests, try cache first
  if (request.method === "GET") {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Return cached response and update in background
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
          }
        })
        .catch(() => {
          // Network failed, keep cached version
        });
      return cachedResponse;
    }
  }

  // Try network request
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && request.method === "GET") {
      // Cache successful GET responses
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Network failed
    if (request.method === "GET") {
      // For GET requests, return cached version if available
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Return offline response
    return new Response(
      JSON.stringify({
        error: "Offline",
        message:
          "You are currently offline. Please check your connection and try again.",
        offline: true,
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return a basic fallback for images
    if (request.destination === "image") {
      return new Response("", { status: 404 });
    }
    return fetch(request);
  }
}

// Push notification event
self.addEventListener("push", (event) => {
  console.log("Push notification received:", event);

  let data = {
    title: "CrushGoals",
    body: "Time to crush your goals!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag: "crushgoals-notification",
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icons/icon-192x192.png",
    badge: data.badge || "/icons/icon-192x192.png",
    tag: data.tag || "crushgoals-notification",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/dashboard",
      dateOfArrival: Date.now(),
    },
    actions: data.actions || [
      { action: "open", title: "Open App" },
      { action: "dismiss", title: "Dismiss" },
    ],
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/dashboard";

  if (event.action === "dismiss") {
    return;
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already an open window
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            if ("navigate" in client) {
              client.navigate(urlToOpen);
            }
            return;
          }
        }
        // If no window, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag);

  if (event.tag === "sync-goals") {
    event.waitUntil(syncGoals());
  } else if (event.tag === "sync-tasks") {
    event.waitUntil(syncTasks());
  } else if (event.tag === "sync-notifications") {
    console.log("Background sync for notifications");
  }
});

// Sync goals when back online
async function syncGoals() {
  try {
    // Get pending goals from IndexedDB or similar storage
    const pendingGoals = await getPendingGoals();

    for (const goal of pendingGoals) {
      try {
        const response = await fetch("/rest/v1/goals", {
          method: goal.method || "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getAuthToken()}`,
          },
          body: JSON.stringify(goal.data),
        });

        if (response.ok) {
          // Remove from pending storage
          await removePendingGoal(goal.id);
        }
      } catch (error) {
        console.error("Failed to sync goal:", goal.id, error);
      }
    }
  } catch (error) {
    console.error("Goal sync failed:", error);
  }
}

// Sync tasks when back online
async function syncTasks() {
  try {
    const pendingTasks = await getPendingTasks();

    for (const task of pendingTasks) {
      try {
        const response = await fetch("/rest/v1/tasks", {
          method: task.method || "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getAuthToken()}`,
          },
          body: JSON.stringify(task.data),
        });

        if (response.ok) {
          await removePendingTask(task.id);
        }
      } catch (error) {
        console.error("Failed to sync task:", task.id, error);
      }
    }
  } catch (error) {
    console.error("Task sync failed:", error);
  }
}

// Placeholder functions for offline storage (would be implemented with IndexedDB)
async function getPendingGoals() {
  return [];
}
async function removePendingGoal(id) {}
async function getPendingTasks() {
  return [];
}
async function removePendingTask(id) {}
async function getAuthToken() {
  return localStorage.getItem("auth_token");
}
