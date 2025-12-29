import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { logError, logDebug } from '@/lib/logger';

interface PushNotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  weeklyReminder: boolean;
  reminderTime: string;
  weeklyReminderDay: number;
}

const DEFAULT_SETTINGS: PushNotificationSettings = {
  enabled: false,
  dailyReminder: true,
  weeklyReminder: true,
  reminderTime: '06:00',
  weeklyReminderDay: 1,
};

export function usePushNotifications() {
  const [settings, setSettings] = useState<PushNotificationSettings>(() => {
    const saved = localStorage.getItem('pushNotificationSettings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Check browser support and register service worker
  useEffect(() => {
    const checkSupport = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
        setIsSupported(true);
        setPermission(Notification.permission);

        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          setSwRegistration(registration);
          logDebug('Service Worker registered', registration);
        } catch (error) {
          logError('Service Worker registration failed', error);
        }
      }
    };

    checkSupport();
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('pushNotificationSettings', JSON.stringify(settings));
  }, [settings]);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast.success('Push notifications enabled!');
        setSettings(prev => ({ ...prev, enabled: true }));
        return true;
      } else if (result === 'denied') {
        toast.error('Notifications blocked. Enable in browser settings.');
        return false;
      }
      return false;
    } catch (error) {
      logError('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  // Send immediate notification
  const sendNotification = useCallback((title: string, body: string, options?: NotificationOptions) => {
    if (permission !== 'granted' || !settings.enabled) return;

    if (swRegistration) {
      swRegistration.showNotification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: 'crushgoals-notification',
        ...options,
      });
    } else {
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        ...options,
      });
    }
  }, [permission, settings.enabled, swRegistration]);

  // Schedule notification at specific time
  const scheduleNotification = useCallback((title: string, body: string, delay: number, tag?: string) => {
    if (permission !== 'granted' || !settings.enabled) return null;

    const timeoutId = setTimeout(() => {
      sendNotification(title, body, { tag });
    }, delay);

    return timeoutId;
  }, [permission, settings.enabled, sendNotification]);

  // Calculate delay until next reminder
  const getDelayUntilTime = useCallback((time: string, dayOfWeek?: number): number => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    if (dayOfWeek !== undefined) {
      const currentDay = now.getDay();
      let daysUntil = dayOfWeek - currentDay;
      if (daysUntil < 0 || (daysUntil === 0 && now >= target)) {
        daysUntil += 7;
      }
      target.setDate(target.getDate() + daysUntil);
    } else {
      if (now >= target) {
        target.setDate(target.getDate() + 1);
      }
    }

    return target.getTime() - now.getTime();
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<PushNotificationSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      
      if (updates.enabled && !prev.enabled && permission !== 'granted') {
        requestPermission();
      }
      
      return newSettings;
    });
  }, [permission, requestPermission]);

  // Task reminders
  const sendTaskReminder = useCallback((pendingCount: number) => {
    if (pendingCount === 0) return;
    sendNotification(
      'Time to crush your goals!',
      `You have ${pendingCount} task${pendingCount > 1 ? 's' : ''} to complete today.`,
      { tag: 'daily-task-reminder' }
    );
  }, [sendNotification]);

  const sendStreakReminder = useCallback(() => {
    sendNotification(
      "Don't break your streak!",
      'Complete your daily tasks to keep your streak going.',
      { tag: 'streak-reminder' }
    );
  }, [sendNotification]);

  const sendAchievementNotification = useCallback((achievementName: string) => {
    sendNotification(
      'Achievement Unlocked!',
      `You earned: ${achievementName}`,
      { tag: 'achievement-notification' }
    );
  }, [sendNotification]);

  return {
    isSupported,
    permission,
    settings,
    updateSettings,
    requestPermission,
    sendNotification,
    scheduleNotification,
    sendTaskReminder,
    sendStreakReminder,
    sendAchievementNotification,
    getDelayUntilTime,
  };
}
