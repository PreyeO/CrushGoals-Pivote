import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

  // Memoize these values to prevent infinite loops
  const trialDaysLeft = useMemo(() => getTrialDaysLeft(), [getTrialDaysLeft]);
  const isPremiumUser = useMemo(() => isPremium(), [isPremium]);
  const isOnTrial = subscription?.status === 'trial';
  const trialEndTime = useMemo(() => 
    subscription?.trial_ends_at ? new Date(subscription.trial_ends_at).getTime() : null,
    [subscription?.trial_ends_at]
  );

  // Use ref to track if we've already run the initial effect
  const hasInitialized = useRef(false);

  // Calculate hours left in trial
  const getHoursLeft = useCallback(() => {
    if (!trialEndTime) return 0;
    const now = Date.now();
    const diff = trialEndTime - now;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  }, [trialEndTime]);

  // Memoize hours left
  const hoursLeft = useMemo(() => getHoursLeft(), [getHoursLeft]);

  // Determine notification level based on time remaining
  const notificationLevel = useMemo((): 'none' | 'gentle' | 'urgent' | 'critical' => {
    if (!isOnTrial || isPremiumUser) return 'none';
    
    if (hoursLeft <= 1) return 'critical';
    if (hoursLeft <= 6) return 'urgent';
    if (trialDaysLeft <= 1) return 'urgent';
    if (trialDaysLeft <= 2) return 'gentle';
    return 'none';
  }, [isOnTrial, isPremiumUser, hoursLeft, trialDaysLeft]);

  // Check if we should show the expiry modal
  const shouldShowExpiryModal = useMemo(() => {
    if (!isOnTrial || isPremiumUser) return false;
    
    const hasAcked = localStorage.getItem('trial_expiry_acknowledged');
    if ((hoursLeft <= 2 || trialDaysLeft <= 0) && !hasAcked) {
      return true;
    }
    return false;
  }, [isOnTrial, isPremiumUser, hoursLeft, trialDaysLeft]);

  // Show appropriate in-app notification based on timeline
  const showTrialNotification = useCallback(() => {
    if (!isOnTrial || isPremiumUser) return;

    const shownKey = `trial_notif_${trialDaysLeft}_${hoursLeft}`;
    
    if (sessionStorage.getItem(shownKey)) return;
    sessionStorage.setItem(shownKey, 'true');

    const currentHour = new Date().getHours();

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
  }, [isOnTrial, isPremiumUser, hoursLeft, trialDaysLeft]);

  // Acknowledge the expiry modal
  const acknowledgeExpiry = useCallback(() => {
    localStorage.setItem('trial_expiry_acknowledged', 'true');
    setState(prev => ({ ...prev, showExpiryModal: false, hasAcknowledged: true }));
  }, []);

  // Initial check and periodic updates - only run when subscription changes
  useEffect(() => {
    if (!subscription) return;

    // Update state with calculated values
    setState(prev => {
      // Only update if values actually changed
      if (prev.notificationLevel === notificationLevel && prev.showExpiryModal === shouldShowExpiryModal) {
        return prev;
      }
      return {
        ...prev,
        notificationLevel,
        showExpiryModal: shouldShowExpiryModal,
      };
    });

    // Show notification only once on initial load
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      showTrialNotification();
    }

    // Check periodically for updates (every 30 minutes)
    const interval = setInterval(() => {
      showTrialNotification();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [subscription, notificationLevel, shouldShowExpiryModal, showTrialNotification]);

  return {
    trialDaysLeft,
    hoursLeft,
    isOnTrial,
    notificationLevel: state.notificationLevel,
    showExpiryModal: state.showExpiryModal,
    acknowledgeExpiry,
    getTrialMessage: useCallback(() => {
      if (!isOnTrial) return null;
      if (trialDaysLeft > 2) return `${trialDaysLeft} days left in trial`;
      if (trialDaysLeft === 2) return "2 days left in trial";
      if (trialDaysLeft === 1) return "Last day of trial!";
      if (hoursLeft > 0) return `${hoursLeft} hours left in trial!`;
      return "Trial expired";
    }, [isOnTrial, trialDaysLeft, hoursLeft]),
  };
}
