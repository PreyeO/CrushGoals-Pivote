import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Loader2 } from "lucide-react";
import { useSharedGoals } from "@/hooks/useSharedGoals";

interface Goal {
  id: string;
  name: string;
  emoji: string;
}

interface CreateSharedGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onSuccess?: (sharedGoalId: string) => void;
}

export function CreateSharedGoalModal({ 
  open, 
  onOpenChange, 
  goal,
  onSuccess
}: CreateSharedGoalModalProps) {
  const { createSharedGoal } = useSharedGoals();
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!goal || !groupName.trim()) return;
    
    setIsCreating(true);
    const sharedGoal = await createSharedGoal(goal.id, groupName);
    setIsCreating(false);
    
    if (sharedGoal) {
      setGroupName("");
      onOpenChange(false);
      onSuccess?.(sharedGoal.id);
    }
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] w-[95vw] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Create Shared Goal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{goal.emoji}</span>
              <div>
                <p className="font-medium">{goal.name}</p>
                <p className="text-xs text-muted-foreground">This goal will be shared</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              placeholder="e.g., Fitness Squad, Study Buddies"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="bg-secondary border-border"
            />
            <p className="text-xs text-muted-foreground">
              This is what your friends will see when they join
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={isCreating || !groupName.trim()}
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Users className="w-4 h-4 mr-2" />
            )}
            Create & Invite Friends
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
