// import { useState, useEffect, useCallback } from "react";
// import {
//   offlineStorage,
//   isOnline,
//   addNetworkStatusListener,
//   syncPendingActions,
//   initOfflineStorage,
// } from "./storage";

// export const useOfflineStorage = () => {
//   const [isInitialized, setIsInitialized] = useState(false);

//   useEffect(() => {
//     initOfflineStorage().then(() => {
//       setIsInitialized(true);
//     });
//   }, []);

//   return { isInitialized };
// };

// export const useNetworkStatus = () => {
//   const [online, setOnline] = useState(isOnline());

//   useEffect(() => {
//     const unsubscribe = addNetworkStatusListener(setOnline);
//     return unsubscribe;
//   }, []);

//   return { online };
// };

// export const useOfflineSync = () => {
//   const [isSyncing, setIsSyncing] = useState(false);
//   const { online } = useNetworkStatus();

//   const sync = useCallback(async () => {
//     if (!online || isSyncing) return;

//     setIsSyncing(true);
//     try {
//       await syncPendingActions();
//     } catch (error) {
//       console.error("Sync failed:", error);
//     } finally {
//       setIsSyncing(false);
//     }
//   }, [online, isSyncing]);

//   // Auto-sync when coming back online
//   useEffect(() => {
//     if (online) {
//       sync();
//     }
//   }, [online, sync]);

//   return { sync, isSyncing };
// };

// export const useOfflineGoals = () => {
//   const [offlineGoals, setOfflineGoals] = useState<any[]>([]);
//   const { online } = useNetworkStatus();

//   const addOfflineGoal = useCallback(async (goalData: any) => {
//     const offlineAction = {
//       id: `goal_${Date.now()}_${Math.random()}`,
//       type: "create_goal" as const,
//       data: goalData,
//       timestamp: Date.now(),
//       retryCount: 0,
//     };

//     await offlineStorage.addAction(offlineAction);

//     // Add to local state for immediate UI feedback
//     setOfflineGoals((prev) => [
//       ...prev,
//       { ...goalData, id: offlineAction.id, offline: true },
//     ]);
//   }, []);

//   const updateOfflineGoal = useCallback(
//     async (goalId: string, updates: any) => {
//       const offlineAction = {
//         id: `goal_update_${Date.now()}_${Math.random()}`,
//         type: "update_goal" as const,
//         data: { id: goalId, ...updates },
//         timestamp: Date.now(),
//         retryCount: 0,
//       };

//       await offlineStorage.addAction(offlineAction);

//       // Update local state
//       setOfflineGoals((prev) =>
//         prev.map((goal) =>
//           goal.id === goalId ? { ...goal, ...updates } : goal
//         )
//       );
//     },
//     []
//   );

//   const removeOfflineGoal = useCallback(async (goalId: string) => {
//     const offlineAction = {
//       id: `goal_delete_${Date.now()}_${Math.random()}`,
//       type: "delete_goal" as const,
//       data: { id: goalId },
//       timestamp: Date.now(),
//       retryCount: 0,
//     };

//     await offlineStorage.addAction(offlineAction);

//     // Remove from local state
//     setOfflineGoals((prev) => prev.filter((goal) => goal.id !== goalId));
//   }, []);

//   return {
//     offlineGoals,
//     addOfflineGoal,
//     updateOfflineGoal,
//     removeOfflineGoal,
//   };
// };

// export const useOfflineTasks = () => {
//   const [offlineTasks, setOfflineTasks] = useState<any[]>([]);

//   const addOfflineTask = useCallback(async (taskData: any) => {
//     const offlineAction = {
//       id: `task_${Date.now()}_${Math.random()}`,
//       type: "create_task" as const,
//       data: taskData,
//       timestamp: Date.now(),
//       retryCount: 0,
//     };

//     await offlineStorage.addAction(offlineAction);

//     // Add to local state for immediate UI feedback
//     setOfflineTasks((prev) => [
//       ...prev,
//       { ...taskData, id: offlineAction.id, offline: true },
//     ]);
//   }, []);

//   const updateOfflineTask = useCallback(
//     async (taskId: string, updates: any) => {
//       const offlineAction = {
//         id: `task_update_${Date.now()}_${Math.random()}`,
//         type: "update_task" as const,
//         data: { id: taskId, ...updates },
//         timestamp: Date.now(),
//         retryCount: 0,
//       };

//       await offlineStorage.addAction(offlineAction);

//       // Update local state
//       setOfflineTasks((prev) =>
//         prev.map((task) =>
//           task.id === taskId ? { ...task, ...updates } : task
//         )
//       );
//     },
//     []
//   );

//   const removeOfflineTask = useCallback(async (taskId: string) => {
//     const offlineAction = {
//       id: `task_delete_${Date.now()}_${Math.random()}`,
//       type: "delete_task" as const,
//       data: { id: taskId },
//       timestamp: Date.now(),
//       retryCount: 0,
//     };

//     await offlineStorage.addAction(offlineAction);

//     // Remove from local state
//     setOfflineTasks((prev) => prev.filter((task) => task.id !== taskId));
//   }, []);

//   return {
//     offlineTasks,
//     addOfflineTask,
//     updateOfflineTask,
//     removeOfflineTask,
//   };
// };

// export const useOfflineCache = () => {
//   const cacheData = useCallback(
//     async (key: string, data: any, ttl?: number) => {
//       await offlineStorage.cacheData(key, data, ttl);
//     },
//     []
//   );

//   const getCachedData = useCallback(async (key: string) => {
//     return await offlineStorage.getCachedData(key);
//   }, []);

//   return { cacheData, getCachedData };
// };
