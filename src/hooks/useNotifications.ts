import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';

interface NotificationSettings {
  dailyReminder: boolean;
  weeklyReview: boolean;
  milestoneAlerts: boolean;
  streakReminders: boolean;
  achievements: boolean;
  email: boolean;
  push: boolean;
  reminderTime: string; // HH:mm format
  weeklyReminderDay: number; // 0-6 (Sunday-Saturday)
}

const DEFAULT_SETTINGS: NotificationSettings = {
  dailyReminder: true,
  weeklyReview: true,
  milestoneAlerts: true,
  streakReminders: true,
  achievements: true,
  email: true,
  push: false,
  reminderTime: '06:00',
  weeklyReminderDay: 1, // Monday
};

export function useNotifications() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const scheduledTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

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
      logError('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  const sendNotification = useCallback((title: string, body: string, tag?: string) => {
    if (permissionStatus !== 'granted' || !settings.push) return;

    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: tag || 'goal-crusher-notification',
        requireInteraction: false,
      });
    } catch (error) {
      logError('Error sending notification:', error);
    }
  }, [permissionStatus, settings.push]);

  const scheduleReminder = useCallback((title: string, body: string, delay: number = 0) => {
    if (permissionStatus !== 'granted' || !settings.push) return;

    const timeout = setTimeout(() => {
      sendNotification(title, body, 'goal-crusher-reminder');
    }, delay);
    
    scheduledTimeoutsRef.current.push(timeout);
  }, [permissionStatus, settings.push, sendNotification]);

  const sendStreakReminder = useCallback(() => {
    if (!settings.streakReminders) return;
    sendNotification(
      '🔥 Don\'t break your streak!',
      'Complete your daily tasks to maintain your streak.',
      'streak-reminder'
    );
  }, [settings.streakReminders, sendNotification]);

  const sendTaskReminder = useCallback((pendingCount: number, frequency: 'daily' | 'weekly' = 'daily') => {
    if (frequency === 'daily' && !settings.dailyReminder) return;
    if (frequency === 'weekly' && !settings.weeklyReview) return;
    if (pendingCount === 0) return;
    
    const title = frequency === 'daily' ? '📋 Daily Tasks' : '📅 Weekly Tasks';
    const body = `You have ${pendingCount} pending task${pendingCount > 1 ? 's' : ''} to complete!`;
    
    sendNotification(title, body, `${frequency}-task-reminder`);
  }, [settings.dailyReminder, settings.weeklyReview, sendNotification]);

  const sendMilestoneAlert = useCallback((milestone: string) => {
    if (!settings.milestoneAlerts) return;
    sendNotification(
      '🎯 Milestone Reached!',
      milestone,
      'milestone-alert'
    );
  }, [settings.milestoneAlerts, sendNotification]);

  const sendAchievementNotification = useCallback((achievementName: string) => {
    if (!settings.achievements) return;
    sendNotification(
      '🏆 Achievement Unlocked!',
      `You earned: ${achievementName}`,
      'achievement-notification'
    );
  }, [settings.achievements, sendNotification]);

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

  // Calculate time until next reminder
  const getTimeUntilReminder = useCallback((reminderTime: string, frequency: 'daily' | 'weekly' = 'daily'): number => {
    const now = new Date();
    const [hours, minutes] = reminderTime.split(':').map(Number);
    
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);
    
    // If weekly, adjust to the correct day
    if (frequency === 'weekly') {
      const currentDay = now.getDay();
      const targetDay = settings.weeklyReminderDay;
      let daysUntil = targetDay - currentDay;
      if (daysUntil <= 0 || (daysUntil === 0 && now >= reminderDate)) {
        daysUntil += 7;
      }
      reminderDate.setDate(reminderDate.getDate() + daysUntil);
    } else {
      // If daily reminder time has passed, schedule for tomorrow
      if (now >= reminderDate) {
        reminderDate.setDate(reminderDate.getDate() + 1);
      }
    }
    
    return reminderDate.getTime() - now.getTime();
  }, [settings.weeklyReminderDay]);

  // Schedule daily and weekly reminders
  useEffect(() => {
    if (permissionStatus !== 'granted' || !settings.push) return;

    // Clear any existing scheduled timeouts
    scheduledTimeoutsRef.current.forEach(clearTimeout);
    scheduledTimeoutsRef.current = [];

    // Schedule daily reminder
    if (settings.dailyReminder) {
      const dailyDelay = getTimeUntilReminder(settings.reminderTime, 'daily');
      const dailyTimeout = setTimeout(() => {
        sendNotification(
          '⏰ Time to crush your goals!',
          'Check your tasks for today and keep the streak going!',
          'daily-reminder'
        );
      }, dailyDelay);
      scheduledTimeoutsRef.current.push(dailyTimeout);
    }

    // Schedule weekly reminder
    if (settings.weeklyReview) {
      const weeklyDelay = getTimeUntilReminder(settings.reminderTime, 'weekly');
      const weeklyTimeout = setTimeout(() => {
        sendNotification(
          '📊 Weekly Review Time',
          'Check your progress and plan for the week ahead!',
          'weekly-reminder'
        );
      }, weeklyDelay);
      scheduledTimeoutsRef.current.push(weeklyTimeout);
    }

    return () => {
      scheduledTimeoutsRef.current.forEach(clearTimeout);
      scheduledTimeoutsRef.current = [];
    };
  }, [settings.dailyReminder, settings.weeklyReview, settings.reminderTime, settings.push, permissionStatus, getTimeUntilReminder, sendNotification]);

  return {
    settings,
    updateSettings,
    permissionStatus,
    requestPermission,
    sendStreakReminder,
    sendTaskReminder,
    sendMilestoneAlert,
    sendAchievementNotification,
    scheduleReminder,
  };
}
