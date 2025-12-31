import { useState, useEffect } from 'react';
import { X, Clock, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { useSubscription } from '@/hooks/useSubscription';

interface TrialBannerProps {
  onUpgradeClick: () => void;
}

export function TrialBanner({ onUpgradeClick }: TrialBannerProps) {
  const { isTrialActive, isTrialExpired, hoursLeft, daysLeft } = useTrialStatus();
  const { isPremium } = useSubscription();
  const [isDismissed, setIsDismissed] = useState(false);

  // Reset dismissal on new session
  useEffect(() => {
    const lastDismissed = sessionStorage.getItem('trial_banner_dismissed');
    if (!lastDismissed) {
      setIsDismissed(false);
    }
  }, []);

  // Don't show if premium user
  if (isPremium()) return null;

  // Don't show if dismissed this session (but still show if less than 6 hours)
  if (isDismissed && hoursLeft > 6) return null;

  // Don't show if no trial active and not expired
  if (!isTrialActive && !isTrialExpired) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('trial_banner_dismissed', 'true');
    setIsDismissed(true);
  };

  // Determine urgency level
  const getUrgencyLevel = (): 'relaxed' | 'warning' | 'critical' | 'expired' => {
    if (isTrialExpired) return 'expired';
    if (hoursLeft <= 6) return 'critical';
    if (hoursLeft <= 24) return 'warning';
    return 'relaxed';
  };

  const urgency = getUrgencyLevel();

  const urgencyStyles = {
    relaxed: {
      bg: 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent',
      border: 'border-primary/20',
      text: 'text-primary',
      icon: Sparkles,
    },
    warning: {
      bg: 'bg-gradient-to-r from-warning/15 via-warning/5 to-transparent',
      border: 'border-warning/30',
      text: 'text-warning',
      icon: Clock,
    },
    critical: {
      bg: 'bg-gradient-to-r from-destructive/15 via-destructive/5 to-transparent',
      border: 'border-destructive/30',
      text: 'text-destructive',
      icon: Zap,
    },
    expired: {
      bg: 'bg-gradient-to-r from-destructive/20 via-destructive/10 to-destructive/5',
      border: 'border-destructive/40',
      text: 'text-destructive',
      icon: Zap,
    },
  };

  const style = urgencyStyles[urgency];
  const Icon = style.icon;

  const getMessage = () => {
    if (isTrialExpired) {
      return {
        title: "Trial Expired",
        subtitle: "Subscribe now to continue crushing your goals!",
      };
    }
    
    if (hoursLeft <= 1) {
      return {
        title: "⚠️ Less than 1 hour left!",
        subtitle: "Don't lose your progress - upgrade now!",
      };
    }
    
    if (hoursLeft <= 6) {
      return {
        title: `🔥 Only ${hoursLeft} hours left!`,
        subtitle: "Your streak is at risk. Upgrade to keep it!",
      };
    }
    
    if (hoursLeft <= 24) {
      return {
        title: `⏰ ${hoursLeft} hours of free trial left`,
        subtitle: "Upgrade to unlock unlimited goal crushing!",
      };
    }
    
    if (daysLeft > 1) {
      return {
        title: `🎉 ${daysLeft} days left in your free trial`,
        subtitle: "Explore all premium features!",
      };
    }
    
    return {
      title: "🎯 Last day of your free trial!",
      subtitle: "Make it count - upgrade for unlimited access!",
    };
  };

  const message = getMessage();

  return (
    <div
      className={cn(
        "relative rounded-xl border p-3 sm:p-4 mb-4 animate-fade-in",
        style.bg,
        style.border,
        urgency === 'critical' && "animate-pulse-slow",
        urgency === 'expired' && "animate-pulse"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
          urgency === 'expired' ? "bg-destructive/20" : 
          urgency === 'critical' ? "bg-destructive/20" :
          urgency === 'warning' ? "bg-warning/20" : "bg-primary/20"
        )}>
          <Icon className={cn("w-5 h-5", style.text)} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn("font-semibold text-sm sm:text-base", style.text)}>
            {message.title}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {message.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant={urgency === 'expired' || urgency === 'critical' ? 'destructive' : 'hero'}
            onClick={onUpgradeClick}
            className="text-xs sm:text-sm"
          >
            {isTrialExpired ? 'Subscribe Now' : 'Upgrade'}
          </Button>

          {!isTrialExpired && hoursLeft > 6 && (
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar for trial time */}
      {isTrialActive && (
        <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              urgency === 'critical' ? "bg-destructive" :
              urgency === 'warning' ? "bg-warning" : "bg-primary"
            )}
            style={{ width: `${Math.max(0, Math.min(100, (hoursLeft / 48) * 100))}%` }}
          />
        </div>
      )}
    </div>
  );
}
