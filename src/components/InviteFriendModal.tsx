import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Mail, Loader2, Target, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGoals } from "@/hooks/useGoals";
import { useResendEmail } from "@/hooks/useResendEmail";
import { toast } from "sonner";

interface InviteFriendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InviteFriendModal({ open, onOpenChange, onSuccess }: InviteFriendModalProps) {
  const { user, profile } = useAuth();
  const { goals } = useGoals();
  const { sendFriendInviteEmail } = useResendEmail();
  const [email, setEmail] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setEmail("");
      setSelectedGoalId("");
      setInviteSent(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !user) return;

    setIsLoading(true);
    try {
      // Check if user exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (existingProfile) {
        // User exists - create friendship request
        const { data: existingFriendship } = await supabase
          .from('friendships')
          .select('id, status')
          .or(`and(user_id.eq.${user.id},friend_id.eq.${existingProfile.user_id}),and(user_id.eq.${existingProfile.user_id},friend_id.eq.${user.id})`)
          .maybeSingle();

        if (existingFriendship) {
          if (existingFriendship.status === 'pending') {
            toast.info("Friend request already pending");
          } else {
            toast.info("You're already friends!");
          }
          setIsLoading(false);
          return;
        }

        // Create friendship request
        const { error: friendshipError } = await supabase
          .from('friendships')
          .insert({
            user_id: user.id,
            friend_id: existingProfile.user_id,
            status: 'pending',
          });

        if (friendshipError) throw friendshipError;

        // If a goal was selected, create shared goal invite
        if (selectedGoalId) {
          const selectedGoal = goals.find(g => g.id === selectedGoalId);
          if (selectedGoal) {
            // Check if shared goal already exists for this goal
            let sharedGoalId: string;
            const { data: existingSharedGoal } = await supabase
              .from('shared_goals')
              .select('id')
              .eq('goal_id', selectedGoalId)
              .eq('owner_id', user.id)
              .maybeSingle();

            if (existingSharedGoal) {
              sharedGoalId = existingSharedGoal.id;
            } else {
              // Create shared goal
              const { data: newSharedGoal, error: sgError } = await supabase
                .from('shared_goals')
                .insert({
                  goal_id: selectedGoalId,
                  owner_id: user.id,
                  name: `${selectedGoal.name} Challenge`,
                })
                .select('id')
                .single();

              if (sgError) throw sgError;
              sharedGoalId = newSharedGoal.id;

              // Add owner as member
              await supabase.from('shared_goal_members').insert({
                shared_goal_id: sharedGoalId,
                user_id: user.id,
                goal_id: selectedGoalId,
              });
            }

            // Create shared goal invite
            await supabase.from('shared_goal_invites').insert({
              shared_goal_id: sharedGoalId,
              inviter_id: user.id,
              invitee_email: email.trim().toLowerCase(),
              invitee_user_id: existingProfile.user_id,
            });
          }
        }

        toast.success(`Friend request sent to ${existingProfile.full_name}!`);
      } else {
        // User doesn't exist - create invite in friend_invites table
        const { data: inviteData, error: inviteError } = await supabase
          .from('friend_invites')
          .insert({
            inviter_id: user.id,
            invitee_email: email.trim().toLowerCase(),
            goal_id: selectedGoalId || null,
          })
          .select('invite_token')
          .single();

        if (inviteError) throw inviteError;

        // Send invitation email
        const inviterName = profile?.full_name || profile?.username || 'A friend';
        const selectedGoal = goals.find(g => g.id === selectedGoalId);
        
        await sendFriendInviteEmail(
          email.trim(),
          inviterName,
          selectedGoal?.name,
          selectedGoal?.emoji
        );

        toast.success("Invitation email sent!");
      }

      setInviteSent(true);
      onSuccess?.();
      
      // Close after showing success
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (error: any) {
      console.error("Invite error:", error);
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  if (inviteSent) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center animate-scale-in">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-xl font-bold mb-2">Invitation Sent! 🎉</h3>
            <p className="text-muted-foreground">
              Your friend will receive an email invitation to join CrushGoals.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Invite a Friend
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Friend's Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              We'll send them an invitation to join CrushGoals
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Challenge them on a goal (optional)</Label>
            <Select 
              value={selectedGoalId || "none"} 
              onValueChange={(value) => setSelectedGoalId(value === "none" ? "" : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a goal to share">
                  {selectedGoalId && selectedGoalId !== "none" ? (
                    <div className="flex items-center gap-2">
                      <span>{goals.find(g => g.id === selectedGoalId)?.emoji}</span>
                      <span>{goals.find(g => g.id === selectedGoalId)?.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No goal selected</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">No goal - just add as friend</span>
                </SelectItem>
                {goals.filter(g => !g.is_paused && g.progress !== 100).map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    <div className="flex items-center gap-2">
                      <span>{goal.emoji}</span>
                      <span>{goal.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {selectedGoalId 
                ? "Your friend will get a copy of this goal to compete with you!"
                : "You can challenge them to a goal later"
              }
            </p>
          </div>

          {selectedGoalId && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 text-sm text-primary">
                <Target className="w-4 h-4" />
                <span className="font-medium">Challenge Mode</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                When your friend accepts, they'll get this goal and you can compete on the leaderboard!
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !email.trim()} 
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
