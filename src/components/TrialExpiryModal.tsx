import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Zap, Target, Crown, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';

interface TrialExpiryModalProps {
  open: boolean;
  onAcknowledge: () => void;
}

interface UserAchievementStats {
  tasksCompleted: number;
  xpEarned: number;
  achievementsCount: number;
  currentStreak: number;
  goalsCreated: number;
}

export function TrialExpiryModal({ open, onAcknowledge }: TrialExpiryModalProps) {
  const { user, stats } = useAuth();
  const { getPricing, currentCurrency } = useCurrency();
  const { subscription, getTrialDaysLeft } = useSubscription();
  const [userStats, setUserStats] = useState<UserAchievementStats>({
    tasksCompleted: 0,
    xpEarned: 0,
    achievementsCount: 0,
    currentStreak: 0,
    goalsCreated: 0,
  });

  const pricing = getPricing();
  const trialDaysLeft = getTrialDaysLeft();
  const hoursLeft = trialDaysLeft <= 1 ? Math.max(0, Math.round(trialDaysLeft * 24)) : 0;

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        // Fetch achievements count
        const { data: achievements } = await supabase
          .from('achievements')
          .select('id')
          .eq('user_id', user.id);

        // Fetch goals count
        const { data: goals } = await supabase
          .from('goals')
          .select('id')
          .eq('user_id', user.id);

        setUserStats({
          tasksCompleted: stats?.tasks_completed || 0,
          xpEarned: stats?.total_xp || 0,
          achievementsCount: achievements?.length || 0,
          currentStreak: stats?.current_streak || 0,
          goalsCreated: goals?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (open) {
      fetchStats();
    }
  }, [open, user?.id, stats]);

  const handleUpgrade = (plan: 'basic' | 'premium' | 'premium-annual') => {
    // This will be connected to payment gateway
    console.log('Upgrading to:', plan);
    // For now, acknowledge and close
    onAcknowledge();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-lg p-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header with fire effect */}
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-3 text-2xl">
              <Flame className="w-8 h-8 animate-pulse" />
              Your 3-Day Streak is About to Die
              <Flame className="w-8 h-8 animate-pulse" />
            </DialogTitle>
          </DialogHeader>
          
          {hoursLeft > 0 && (
            <p className="text-center mt-2 text-orange-100">
              In <span className="font-bold text-white">{hoursLeft} hours</span>, everything resets unless you upgrade.
            </p>
          )}
        </div>

        {/* Stats Summary */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="p-3 text-center bg-muted/50">
              <Target className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold">{userStats.tasksCompleted}</p>
              <p className="text-xs text-muted-foreground">Tasks Completed</p>
            </Card>
            <Card className="p-3 text-center bg-muted/50">
              <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
              <p className="text-xl font-bold">{userStats.xpEarned.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">XP Earned</p>
            </Card>
            <Card className="p-3 text-center bg-muted/50">
              <Trophy className="w-5 h-5 mx-auto mb-1 text-amber-500" />
              <p className="text-xl font-bold">{userStats.achievementsCount}</p>
              <p className="text-xs text-muted-foreground">Achievements</p>
            </Card>
            <Card className="p-3 text-center bg-muted/50">
              <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
              <p className="text-xl font-bold">{userStats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </Card>
          </div>

          {/* Plan Options */}
          <div className="space-y-3 mb-4">
            {/* Basic Plan */}
            <Card 
              className="p-4 cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleUpgrade('basic')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Basic - Solo Crusher</h3>
                  <p className="text-sm text-muted-foreground">5 goals, solo crushing</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{pricing.basic.monthly.formatted}</p>
                  <p className="text-xs text-muted-foreground">/month</p>
                </div>
              </div>
            </Card>

            {/* Premium Plan */}
            <Card 
              className="p-4 cursor-pointer border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors relative"
              onClick={() => handleUpgrade('premium')}
            >
              <Badge className="absolute -top-2 left-4 bg-primary">
                <Crown className="w-3 h-3 mr-1" />
                MOST POPULAR
              </Badge>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <h3 className="font-semibold">Premium - Social Crusher</h3>
                  <p className="text-sm text-muted-foreground">Unlimited + social features</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{pricing.premium.monthly.formatted}</p>
                  <p className="text-xs text-muted-foreground">/month</p>
                </div>
              </div>
            </Card>

            {/* Premium Annual */}
            <Card 
              className="p-4 cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleUpgrade('premium-annual')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    Premium Annual
                    <Badge variant="secondary" className="text-xs">Save {pricing.premium.annual.savings}</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">Best value for crushers</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{pricing.premium.annual.formatted}</p>
                  <p className="text-xs text-muted-foreground">/year</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <Button 
            variant="hero" 
            className="w-full mb-3"
            onClick={() => handleUpgrade('premium')}
          >
            <Crown className="w-4 h-4 mr-2" />
            Pay Now and Keep Your Streak
          </Button>

          <button
            onClick={onAcknowledge}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Not ready? Your progress will be saved, but your streak resets to 0.
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
