import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Mail, Loader2, Target, Send, CheckCircle2, Copy, Link, Plus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGoals } from "@/hooks/useGoals";
import { useResendEmail } from "@/hooks/useResendEmail";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { logError } from "@/lib/logger";
interface InviteFriendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InviteFriendModal({ open, onOpenChange, onSuccess }: InviteFriendModalProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { goals } = useGoals();
  const { sendFriendInviteEmail } = useResendEmail();
  const [email, setEmail] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  // Filter active goals
  const activeGoals = goals.filter(g => !g.is_paused && g.progress !== 100);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setEmail("");
      setSelectedGoalId("");
      setInviteSent(false);
      setInviteLink("");
      setLinkCopied(false);
    }
  }, [open]);

  const generateInviteLink = async () => {
    if (!user || !selectedGoalId) return "";
    
    try {
      const selectedGoal = goals.find(g => g.id === selectedGoalId);
      
      // Ensure shared goal exists for this goal before generating link
      let sharedGoalId: string;
      const { data: existingSharedGoal } = await supabase
        .from('shared_goals')
        .select('id')
        .eq('goal_id', selectedGoalId)
        .eq('owner_id', user.id)
        .maybeSingle();

      if (existingSharedGoal) {
        sharedGoalId = existingSharedGoal.id;
      } else if (selectedGoal) {
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

      // Create an invite record and get the token
      const { data: inviteData, error } = await supabase
        .from('friend_invites')
        .insert({
          inviter_id: user.id,
          invitee_email: 'link-invite@placeholder.com', // Placeholder for link invites
          goal_id: selectedGoalId,
        })
        .select('invite_token')
        .single();

      if (error) throw error;
      
      const baseUrl = window.location.origin;
      return `${baseUrl}/?invite=${inviteData.invite_token}`;
    } catch (error) {
      logError("Error generating invite link", error);
      return "";
    }
  };

  const handleCopyLink = async () => {
    if (!selectedGoalId) {
      toast.error("Please select a goal first");
      return;
    }

    let link = inviteLink;
    if (!link) {
      link = await generateInviteLink();
      setInviteLink(link);
    }

    if (link) {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setLinkCopied(false), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !user) return;

    if (!selectedGoalId) {
      toast.error("Please select a goal to invite your friend to");
      return;
    }

    setIsLoading(true);
    try {
      // Check if user exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (existingProfile) {
        // User exists - create friendship request (using separate queries to avoid string interpolation)
        const { data: sentFriendship } = await supabase
          .from('friendships')
          .select('id, status')
          .eq('user_id', user.id)
          .eq('friend_id', existingProfile.user_id)
          .maybeSingle();

        const { data: receivedFriendship } = await supabase
          .from('friendships')
          .select('id, status')
          .eq('user_id', existingProfile.user_id)
          .eq('friend_id', user.id)
          .maybeSingle();

        const existingFriendship = sentFriendship || receivedFriendship;

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

        // Create shared goal invite
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

        toast.success(`Friend request sent to ${existingProfile.full_name}!`);
      } else {
        // User doesn't exist - create invite in friend_invites table
        const { data: inviteData, error: inviteError } = await supabase
          .from('friend_invites')
          .insert({
            inviter_id: user.id,
            invitee_email: email.trim().toLowerCase(),
            goal_id: selectedGoalId,
          })
          .select('invite_token')
          .single();

        if (inviteError) throw inviteError;

        // Send invitation email
        const inviterName = profile?.full_name || profile?.username || 'Your friend';
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
      logError("Invite error", error);
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = () => {
    onOpenChange(false);
    navigate('/goals');
    toast.info("Create a goal first, then come back to invite friends!");
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
              Your friend will receive an email invitation to join you on CrushGoals.
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
            Invite a Friend to Grow Together
          </DialogTitle>
        </DialogHeader>

        {activeGoals.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Create a Goal First</h3>
            <p className="text-muted-foreground text-sm mb-4">
              To invite friends, you need to have at least one active goal to share with them.
            </p>
            <Button onClick={handleCreateGoal} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Goal
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal" className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                Select a Goal to Share <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={selectedGoalId} 
                onValueChange={setSelectedGoalId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a goal to grow together">
                    {selectedGoalId ? (
                      <div className="flex items-center gap-2">
                        <span>{goals.find(g => g.id === selectedGoalId)?.emoji}</span>
                        <span>{goals.find(g => g.id === selectedGoalId)?.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Select a goal</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {activeGoals.map((goal) => (
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
                Your friend will get their own copy of this goal to work on together
              </p>
            </div>

            {selectedGoalId && (
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 text-sm text-success">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Growing Together Mode</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  When your friend joins, you'll both work toward this goal and can see each other's progress!
                </p>
              </div>
            )}

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
                  disabled={isLoading || !selectedGoalId}
                />
              </div>
            </div>

            {/* Copy Link Section */}
            {selectedGoalId && (
              <div className="p-3 rounded-lg bg-secondary border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Link className="w-4 h-4 text-muted-foreground" />
                    <span>Or share via link</span>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyLink}
                    className="gap-2"
                  >
                    {linkCopied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
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
                disabled={isLoading || !email.trim() || !selectedGoalId} 
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
        )}
      </DialogContent>
    </Dialog>
  );
}
