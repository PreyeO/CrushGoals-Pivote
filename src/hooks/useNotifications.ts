import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NotificationSettings {
  dailyReminder: boolean;
  weeklyReview: boolean;
  milestoneAlerts: boolean;
  streakReminders: boolean;
  achievements: boolean;
  email: boolean;
  push: boolean;
  reminderTime: string; // HH:mm format
}

const DEFAULT_SETTINGS: NotificationSettings = {
  dailyReminder: true,
  weeklyReview: true,
  milestoneAlerts: true,
  streakReminders: true,
  achievements: true,
  email: true,
  push: false,
  reminderTime: '09:00',
};

export function useNotifications() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  }, [settings]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
        return true;
      } else if (permission === 'denied') {
        toast.error('Notifications blocked. Please enable in browser settings.');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  const scheduleReminder = useCallback((title: string, body: string, delay: number = 0) => {
    if (permissionStatus !== 'granted' || !settings.push) return;

    setTimeout(() => {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'goal-crusher-reminder',
        requireInteraction: true,
      });
    }, delay);
  }, [permissionStatus, settings.push]);

  const sendStreakReminder = useCallback(() => {
    if (!settings.streakReminders) return;
    
    scheduleReminder(
      '🔥 Don\'t break your streak!',
      'Complete your daily tasks to maintain your streak.',
      0
    );
  }, [settings.streakReminders, scheduleReminder]);

  const sendTaskReminder = useCallback((pendingCount: number) => {
    if (!settings.dailyReminder || pendingCount === 0) return;
    
    scheduleReminder(
      '📋 Tasks waiting for you!',
      `You have ${pendingCount} pending task${pendingCount > 1 ? 's' : ''} for today.`,
      0
    );
  }, [settings.dailyReminder, scheduleReminder]);

  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      
      // If enabling push notifications, request permission
      if (updates.push && !prev.push && permissionStatus !== 'granted') {
        requestPermission();
      }
      
      return newSettings;
    });
  }, [permissionStatus, requestPermission]);

  // Schedule daily reminder check
  useEffect(() => {
    if (!settings.dailyReminder || permissionStatus !== 'granted') return;

    const checkAndNotify = () => {
      const now = new Date();
      const [hours, minutes] = settings.reminderTime.split(':').map(Number);
      
      if (now.getHours() === hours && now.getMinutes() === minutes) {
        scheduleReminder(
          '⏰ Daily Reminder',
          'Time to check your goals and complete today\'s tasks!',
          0
        );
      }
    };

    // Check every minute
    const interval = setInterval(checkAndNotify, 60000);
    return () => clearInterval(interval);
  }, [settings.dailyReminder, settings.reminderTime, permissionStatus, scheduleReminder]);

  return {
    settings,
    updateSettings,
    permissionStatus,
    requestPermission,
    sendStreakReminder,
    sendTaskReminder,
  };
}
