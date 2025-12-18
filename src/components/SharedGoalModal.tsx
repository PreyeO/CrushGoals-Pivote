import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Mail, Trophy, Target, CheckCircle, Loader2, Plus, X } from "lucide-react";
import { useSharedGoals, SharedGoalMember } from "@/hooks/useSharedGoals";
import { cn } from "@/lib/utils";

interface SharedGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sharedGoalId: string;
  sharedGoalName: string;
  isOwner: boolean;
}

export function SharedGoalModal({ 
  open, 
  onOpenChange, 
  sharedGoalId, 
  sharedGoalName,
  isOwner 
}: SharedGoalModalProps) {
  const { inviteToSharedGoal, getSharedGoalProgress } = useSharedGoals();
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [members, setMembers] = useState<SharedGoalMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  useEffect(() => {
    if (open && sharedGoalId) {
      loadMembers();
    }
  }, [open, sharedGoalId]);

  const loadMembers = async () => {
    setIsLoadingMembers(true);
    const data = await getSharedGoalProgress(sharedGoalId);
    setMembers(data);
    setIsLoadingMembers(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    const success = await inviteToSharedGoal(sharedGoalId, inviteEmail);
    if (success) {
      setInviteEmail("");
    }
    setIsInviting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[85vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {sharedGoalName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Section - Only for owners */}
          {isOwner && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 space-y-3">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Invite Friends
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="friend@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-secondary border-border"
                />
                <Button 
                  onClick={handleInvite} 
                  disabled={isInviting || !inviteEmail.trim()}
                  size="icon"
                >
                  {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                They'll get the same goal added to their dashboard automatically!
              </p>
            </div>
          )}

          {/* Group Leaderboard */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-premium" />
              Group Progress
            </h3>

            {isLoadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No members yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member, index) => (
                  <div 
                    key={member.user_id}
                    className={cn(
                      "p-4 rounded-xl border transition-all",
                      index === 0 
                        ? "bg-premium/10 border-premium/30" 
                        : "bg-white/5 border-white/10"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                          index === 0 
                            ? "bg-gradient-to-br from-amber-400 to-amber-600 text-amber-900" 
                            : "bg-gradient-primary"
                        )}>
                          {member.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium">{member.username || 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground">
                            🔥 {member.current_streak} day streak
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{member.goal_progress}%</p>
                        <p className="text-xs text-muted-foreground">
                          {member.tasks_completed_today > 0 && (
                            <span className="text-success flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Done today
                            </span>
                          )}
                          {member.tasks_completed_today === 0 && "Not done today"}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-primary transition-all"
                        style={{ width: `${member.goal_progress}%` }}
                      />
                    </div>

                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>{member.tasks_completed_week} tasks this week</span>
                      <span>{member.goal_progress}% complete</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
