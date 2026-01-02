// Offline storage utilities for CrushGoals

export interface OfflineAction {
  id: string;
  type:
    | "create_goal"
    | "update_goal"
    | "delete_goal"
    | "create_task"
    | "update_task"
    | "delete_task";
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineStorage {
  private dbName = "crushgoals-offline";
  private version = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains("actions")) {
          const actionsStore = db.createObjectStore("actions", {
            keyPath: "id",
          });
          actionsStore.createIndex("type", "type", { unique: false });
          actionsStore.createIndex("timestamp", "timestamp", { unique: false });
        }

        if (!db.objectStoreNames.contains("cache")) {
          db.createObjectStore("cache", { keyPath: "key" });
        }
      };
    });
  }

  async addAction(action: OfflineAction): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction(["actions"], "readwrite");
    const store = transaction.objectStore("actions");
    await this.promisifyRequest(store.add(action));
  }

  async getPendingActions(): Promise<OfflineAction[]> {
    const db = await this.openDB();
    const transaction = db.transaction(["actions"], "readonly");
    const store = transaction.objectStore("actions");
    const index = store.index("timestamp");
    const request = index.openCursor(null, "next");
    return new Promise((resolve) => {
      const actions: OfflineAction[] = [];
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          actions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(actions);
        }
      };
    });
  }

  async removeAction(actionId: string): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction(["actions"], "readwrite");
    const store = transaction.objectStore("actions");
    await this.promisifyRequest(store.delete(actionId));
  }

  async updateActionRetryCount(
    actionId: string,
    retryCount: number
  ): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction(["actions"], "readwrite");
    const store = transaction.objectStore("actions");

    const getRequest = store.get(actionId);
    const action = await this.promisifyRequest(getRequest);

    if (action) {
      action.retryCount = retryCount;
      await this.promisifyRequest(store.put(action));
    }
  }

  async cacheData(
    key: string,
    data: any,
    ttl: number = 24 * 60 * 60 * 1000
  ): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction(["cache"], "readwrite");
    const store = transaction.objectStore("cache");

    await this.promisifyRequest(
      store.put({
        key,
        data,
        timestamp: Date.now(),
        ttl,
      })
    );
  }

  async getCachedData(key: string): Promise<any | null> {
    const db = await this.openDB();
    const transaction = db.transaction(["cache"], "readonly");
    const store = transaction.objectStore("cache");

    try {
      const result = await this.promisifyRequest(store.get(key));
      if (result && Date.now() - result.timestamp < result.ttl) {
        return result.data;
      } else if (result) {
        // Remove expired data
        await this.promisifyRequest(store.delete(key));
      }
    } catch (error) {
      console.warn("Failed to get cached data:", error);
    }

    return null;
  }

  async clearExpiredCache(): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction(["cache"], "readwrite");
    const store = transaction.objectStore("cache");
    const request = store.openCursor();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const { timestamp, ttl } = cursor.value;
          if (Date.now() - timestamp >= ttl) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineStorage = new OfflineStorage();

// Initialize offline storage
export const initOfflineStorage = async (): Promise<void> => {
  try {
    await offlineStorage.init();
    // Clear expired cache on initialization
    await offlineStorage.clearExpiredCache();
  } catch (error) {
    console.error("Failed to initialize offline storage:", error);
  }
};

// Network status utilities
export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const addNetworkStatusListener = (
  callback: (online: boolean) => void
): (() => void) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
};

// Sync utilities
export const syncPendingActions = async (): Promise<void> => {
  if (!isOnline()) return;

  try {
    const actions = await offlineStorage.getPendingActions();

    for (const action of actions) {
      try {
        // Attempt to sync the action
        const success = await syncAction(action);

        if (success) {
          await offlineStorage.removeAction(action.id);
        } else {
          // Increment retry count
          await offlineStorage.updateActionRetryCount(
            action.id,
            action.retryCount + 1
          );

          // Remove if too many retries
          if (action.retryCount >= 3) {
            await offlineStorage.removeAction(action.id);
          }
        }
      } catch (error) {
        console.error("Failed to sync action:", action.id, error);
      }
    }
  } catch (error) {
    console.error("Failed to sync pending actions:", error);
  }
};

async function syncAction(action: OfflineAction): Promise<boolean> {
  // This would be implemented based on the action type
  // For now, return true to simulate success
  console.log("Syncing action:", action);
  return true;
}
