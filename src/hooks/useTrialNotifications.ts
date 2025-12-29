import { useState, useEffect, useCallback } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

interface TrialNotificationState {
  showExpiryModal: boolean;
  hasAcknowledged: boolean;
  notificationLevel: 'none' | 'gentle' | 'urgent' | 'critical';
}

export function useTrialNotifications() {
  const { subscription, getTrialDaysLeft, isPremium } = useSubscription();
  const [state, setState] = useState<TrialNotificationState>({
    showExpiryModal: false,
    hasAcknowledged: false,
    notificationLevel: 'none',
  });

  const trialDaysLeft = getTrialDaysLeft();
  const isOnTrial = subscription?.status === 'trial';
  const trialEndDate = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null;

  // Calculate hours left in trial
  const getHoursLeft = useCallback(() => {
    if (!trialEndDate) return 0;
    const now = new Date();
    const diff = trialEndDate.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  }, [trialEndDate]);

  // Determine notification level based on time remaining
  const getNotificationLevel = useCallback((): 'none' | 'gentle' | 'urgent' | 'critical' => {
    if (!isOnTrial || isPremium()) return 'none';
    
    const hoursLeft = getHoursLeft();
    
    if (hoursLeft <= 1) return 'critical'; // Last hour
    if (hoursLeft <= 6) return 'urgent';   // Last 6 hours
    if (trialDaysLeft <= 1) return 'urgent'; // Last day
    if (trialDaysLeft <= 2) return 'gentle'; // Day 2
    return 'none';
  }, [isOnTrial, isPremium, getHoursLeft, trialDaysLeft]);

  // Show appropriate in-app notification based on timeline
  const showTrialNotification = useCallback(() => {
    if (!isOnTrial || isPremium()) return;

    const hoursLeft = getHoursLeft();
    const shownKey = `trial_notif_${trialDaysLeft}_${hoursLeft}`;
    
    // Don't show same notification twice
    if (sessionStorage.getItem(shownKey)) return;
    sessionStorage.setItem(shownKey, 'true');

    const currentHour = new Date().getHours();

    // Day 1 - Signup day
    if (trialDaysLeft === 3) {
      if (currentHour < 12) {
        toast.info("🎉 You have 3 days to try everything free!", {
          description: "Explore all features and crush your goals!",
          duration: 6000,
        });
      } else if (currentHour >= 18) {
        toast.info("✨ Great start! 2 days of trial left", {
          description: "Keep crushing those goals!",
          duration: 5000,
        });
      }
      return;
    }

    // Day 2
    if (trialDaysLeft === 2) {
      if (currentHour < 12) {
        toast("⚡ Keep your streak alive!", {
          description: "2 trial days left - you're doing great!",
          duration: 5000,
        });
      } else if (currentHour >= 18) {
        toast.warning("📅 Last full day tomorrow!", {
          description: "Your streak is at risk. Keep going!",
          duration: 5000,
        });
      }
      return;
    }

    // Day 3 - Final day (more urgent messaging)
    if (trialDaysLeft <= 1) {
      if (hoursLeft > 6) {
        toast.error("🚨 FINAL DAY!", {
          description: "Your trial ends tonight at midnight",
          duration: 8000,
        });
      } else if (hoursLeft > 4) {
        toast.error("⏰ 6 hours left on your trial!", {
          description: "Upgrade now to keep your progress",
          duration: 8000,
        });
      } else if (hoursLeft > 1) {
        toast.error("🔥 4 hours left!", {
          description: "Your streak will reset unless you upgrade",
          duration: 10000,
        });
      } else if (hoursLeft <= 1) {
        toast.error("⚠️ 1 HOUR LEFT!", {
          description: "Don't lose your progress!",
          duration: 15000,
        });
      }
    }
  }, [isOnTrial, isPremium, getHoursLeft, trialDaysLeft]);

  // Check if we should show the expiry modal (trial ended or about to end)
  const checkShowExpiryModal = useCallback(() => {
    if (!isOnTrial || isPremium()) return false;
    
    const hoursLeft = getHoursLeft();
    const hasAcked = localStorage.getItem('trial_expiry_acknowledged');
    
    // Show modal if trial expired or less than 2 hours left and not acknowledged
    if ((hoursLeft <= 2 || trialDaysLeft <= 0) && !hasAcked) {
      return true;
    }
    return false;
  }, [isOnTrial, isPremium, getHoursLeft, trialDaysLeft]);

  // Acknowledge the expiry modal
  const acknowledgeExpiry = useCallback(() => {
    localStorage.setItem('trial_expiry_acknowledged', 'true');
    setState(prev => ({ ...prev, showExpiryModal: false, hasAcknowledged: true }));
  }, []);

  // Initial check and periodic updates
  useEffect(() => {
    if (!subscription) return;

    const level = getNotificationLevel();
    const shouldShowModal = checkShowExpiryModal();
    
    setState(prev => ({
      ...prev,
      notificationLevel: level,
      showExpiryModal: shouldShowModal,
    }));

    // Show notification on load
    showTrialNotification();

    // Check periodically for updates (every 30 minutes)
    const interval = setInterval(() => {
      const newLevel = getNotificationLevel();
      const newShowModal = checkShowExpiryModal();
      
      setState(prev => ({
        ...prev,
        notificationLevel: newLevel,
        showExpiryModal: newShowModal,
      }));
      
      showTrialNotification();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [subscription, getNotificationLevel, checkShowExpiryModal, showTrialNotification]);

  return {
    trialDaysLeft,
    hoursLeft: getHoursLeft(),
    isOnTrial,
    notificationLevel: state.notificationLevel,
    showExpiryModal: state.showExpiryModal,
    acknowledgeExpiry,
    getTrialMessage: () => {
      if (!isOnTrial) return null;
      if (trialDaysLeft > 2) return `${trialDaysLeft} days left in trial`;
      if (trialDaysLeft === 2) return "2 days left in trial";
      if (trialDaysLeft === 1) return "Last day of trial!";
      const hours = getHoursLeft();
      if (hours > 0) return `${hours} hours left in trial!`;
      return "Trial expired";
    },
  };
}
