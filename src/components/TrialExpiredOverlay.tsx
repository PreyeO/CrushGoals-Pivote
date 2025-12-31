import { Lock, Flame, Trophy, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/hooks/useCurrency';
import { usePaystack } from '@/hooks/usePaystack';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';

interface TrialExpiredOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType?: 'goal' | 'task' | 'edit' | 'complete';
}

export function TrialExpiredOverlay({ 
  open, 
  onOpenChange,
  actionType = 'goal'
}: TrialExpiredOverlayProps) {
  const { stats } = useAuth();
  const { getPricing } = useCurrency();
  const { initializePayment, isLoading: paystackLoading } = usePaystack();
  const { refreshSubscription } = useSubscription();

  const pricing = getPricing();
  const monthlyPrice = pricing.monthly.formatted;
  const yearlyPrice = pricing.annual.formatted;
  const yearlyPerMonth = pricing.annual.perMonth;

  const actionMessages = {
    goal: "create new goals",
    task: "add new tasks",
    edit: "edit your goals and tasks",
    complete: "complete tasks and earn XP",
  };

  const handleUpgrade = async (plan: 'monthly' | 'annual') => {
    const result = await initializePayment(plan);
    if (result) {
      // Payment redirect happens in the hook
      await refreshSubscription();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border p-0 overflow-hidden">
        {/* Header with Lock Animation */}
        <div className="relative bg-gradient-to-br from-destructive/20 via-destructive/10 to-transparent p-6 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.15),transparent_70%)]" />
          
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/20 border border-destructive/30 flex items-center justify-center animate-pulse">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">
                Trial Expired
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                Subscribe to {actionMessages[actionType]} and keep crushing it!
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* User Stats - Loss Aversion */}
        <div className="p-4 border-b border-border">
          <p className="text-xs text-muted-foreground text-center mb-3">
            Don't lose your progress!
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Card variant="glass" className="p-3 text-center">
              <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-lg font-bold">{stats?.current_streak || 0}</p>
              <p className="text-[10px] text-muted-foreground">Day Streak</p>
            </Card>
            
            <Card variant="glass" className="p-3 text-center">
              <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-primary/20 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-primary" />
              </div>
              <p className="text-lg font-bold">{stats?.tasks_completed || 0}</p>
              <p className="text-[10px] text-muted-foreground">Tasks Done</p>
            </Card>
            
            <Card variant="glass" className="p-3 text-center">
              <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-premium/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-premium" />
              </div>
              <p className="text-lg font-bold">{stats?.total_xp || 0}</p>
              <p className="text-[10px] text-muted-foreground">XP Earned</p>
            </Card>
          </div>
          
          {(stats?.current_streak || 0) > 0 && (
            <p className="text-xs text-destructive text-center mt-3 font-medium animate-pulse">
              ⚠️ Your {stats?.current_streak}-day streak will reset if you don't subscribe!
            </p>
          )}
        </div>

        {/* Pricing Options */}
        <div className="p-4 space-y-3">
          {/* Yearly - Best Value */}
          <button
            onClick={() => handleUpgrade('annual')}
            disabled={paystackLoading}
            className={cn(
              "w-full p-4 rounded-xl border-2 border-primary bg-primary/5 text-left transition-all",
              "hover:bg-primary/10 hover:border-primary",
              "relative overflow-hidden group"
            )}
          >
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-success text-[10px] font-bold text-success-foreground">
              1 MONTH FREE
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">Yearly Plan</p>
                <p className="text-xs text-muted-foreground">Best value</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">
                  {yearlyPerMonth}<span className="text-xs font-normal">/mo</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {yearlyPrice}/year
                </p>
              </div>
            </div>
          </button>

          {/* Monthly */}
          <button
            onClick={() => handleUpgrade('monthly')}
            disabled={paystackLoading}
            className={cn(
              "w-full p-4 rounded-xl border border-border bg-secondary/50 text-left transition-all",
              "hover:bg-secondary hover:border-primary/50"
            )}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">Monthly Plan</p>
                <p className="text-xs text-muted-foreground">Flexible billing</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  {monthlyPrice}<span className="text-xs font-normal">/mo</span>
                </p>
              </div>
            </div>
          </button>

          {/* Loading state */}
          {paystackLoading && (
            <div className="text-center py-2">
              <p className="text-xs text-muted-foreground">Processing...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 pt-0 text-center">
          <button
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
