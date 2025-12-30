import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Zap, Target, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useSubscription } from '@/hooks/useSubscription';
import { usePaystack } from '@/hooks/usePaystack';
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
  const { getPricing } = useCurrency();
  const { getTrialDaysLeft } = useSubscription();
  const { initializePayment, isLoading: paystackLoading } = usePaystack();
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

  const handleUpgrade = async (plan: 'monthly' | 'annual') => {
    // Use Paystack for NGN payments
    if (pricing.isNigeria) {
      await initializePayment(plan);
    } else {
      // For international payments, will integrate Stripe later
      console.log('International payment for:', plan);
      onAcknowledge();
    }
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
              Your Streak is About to Die
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
            {/* Monthly Plan */}
            <Card 
              className="p-4 cursor-pointer hover:border-primary transition-colors"
              onClick={() => !paystackLoading && handleUpgrade('monthly')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Monthly</h3>
                  <p className="text-sm text-muted-foreground">Pay as you go</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{pricing.monthly.formatted}</p>
                  <p className="text-xs text-muted-foreground">/month</p>
                </div>
              </div>
            </Card>

            {/* Annual Plan */}
            <Card 
              className="p-4 cursor-pointer border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors relative"
              onClick={() => !paystackLoading && handleUpgrade('annual')}
            >
              <Badge className="absolute -top-2 left-4 bg-primary">
                <Crown className="w-3 h-3 mr-1" />
                BEST VALUE
              </Badge>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <h3 className="font-semibold">Annual</h3>
                  <p className="text-sm text-muted-foreground">Save {pricing.annual.savings}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{pricing.annual.formatted}</p>
                  <p className="text-xs text-muted-foreground">/year</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <Button 
            variant="hero" 
            className="w-full mb-3"
            onClick={() => handleUpgrade('annual')}
            disabled={paystackLoading}
          >
            {paystackLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Pay Now and Keep Your Streak
              </>
            )}
          </Button>

          <button
            onClick={onAcknowledge}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled={paystackLoading}
          >
            Not ready? Your progress will be saved, but your streak resets to 0.
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}