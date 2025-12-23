import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, MessageCircle, Activity, Send, Loader2, 
  Flame, CheckCircle, Crown, Medal, Heart, Trash2,
  Sparkles, Clock
} from "lucide-react";
import { useSharedGoalActivities, SharedGoalComment, SharedGoalActivity } from "@/hooks/useSharedGoalActivities";
import { useSharedGoals, SharedGoalMember } from "@/hooks/useSharedGoals";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface SharedGoalDetailModalProps {
  sharedGoal: {
    id: string;
    name: string;
    isOwner: boolean;
  } | null;
  onOpenChange: (open: boolean) => void;
}

const ENCOURAGEMENTS = [
  "You've got this! 💪",
  "Keep crushing it! 🔥",
  "Amazing progress! ⭐",
  "Don't give up! 🌟",
  "You're doing great! 🎯",
];

export function SharedGoalDetailModal({ sharedGoal, onOpenChange }: SharedGoalDetailModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [commentText, setCommentText] = useState("");
  const [members, setMembers] = useState<SharedGoalMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  
  const { 
    comments, 
    activities, 
    isLoading, 
    addComment, 
    deleteComment 
  } = useSharedGoalActivities(sharedGoal?.id || null);
  
  const { getSharedGoalProgress } = useSharedGoals();

  useEffect(() => {
    const fetchMembers = async () => {
      if (!sharedGoal?.id) return;
      setLoadingMembers(true);
      const progress = await getSharedGoalProgress(sharedGoal.id);
      setMembers(progress);
      setLoadingMembers(false);
    };
    
    fetchMembers();
  }, [sharedGoal?.id]);

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    const success = await addComment(commentText, 'comment');
    if (success) setCommentText("");
  };

  const handleSendEncouragement = async (message: string) => {
    await addComment(message, 'encouragement');
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-amber-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-slate-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'goal_joined':
        return <Sparkles className="w-4 h-4 text-primary" />;
      case 'streak_milestone':
        return <Flame className="w-4 h-4 text-orange-400" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCommentIcon = (type: string) => {
    switch (type) {
      case 'encouragement':
        return <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />;
      case 'celebration':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      default:
        return <MessageCircle className="w-4 h-4 text-primary" />;
    }
  };

  if (!sharedGoal) return null;

  return (
    <Dialog open={!!sharedGoal} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            {sharedGoal.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leaderboard" className="gap-1.5 text-xs">
              <Trophy className="w-3.5 h-3.5" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5 text-xs">
              <Activity className="w-3.5 h-3.5" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-1.5 text-xs">
              <MessageCircle className="w-3.5 h-3.5" />
              Chat
            </TabsTrigger>
          </TabsList>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="flex-1 overflow-auto mt-4">
            {loadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No members yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members
                  .sort((a, b) => b.goal_progress - a.goal_progress)
                  .map((member, index) => (
                    <div 
                      key={member.user_id}
                      className={`p-3 rounded-xl border transition-all ${
                        index === 0 
                          ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30' 
                          : 'bg-white/5 border-white/10'
                      } ${member.user_id === user?.id ? 'ring-2 ring-primary/50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 flex justify-center">
                          {getRankIcon(index)}
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 
                            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-amber-900' 
                            : 'bg-gradient-to-br from-primary/50 to-primary text-primary-foreground'
                        }`}>
                          {member.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                              {member.username || 'Anonymous'}
                              {member.user_id === user?.id && (
                                <span className="text-xs text-primary ml-1">(you)</span>
                              )}
                            </p>
                            {member.tasks_completed_today > 0 && (
                              <span className="flex items-center gap-0.5 text-xs text-success">
                                <CheckCircle className="w-3 h-3" />
                                Today
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3 text-orange-400" />
                              {member.current_streak} streak
                            </span>
                            <span>{member.tasks_completed_week} this week</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${index === 0 ? 'text-amber-400' : 'text-primary'}`}>
                            {member.goal_progress}%
                          </p>
                          <p className="text-xs text-muted-foreground">progress</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="flex-1 overflow-auto mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No activity yet</p>
                <p className="text-sm">Complete tasks to see activity here!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="mt-0.5">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.username}</span>
                        {activity.activity_type === 'task_completed' && ' completed: '}
                        {activity.activity_type === 'goal_joined' && ' joined the goal '}
                        {activity.activity_type === 'streak_milestone' && ' hit a streak milestone! '}
                        <span className="text-muted-foreground">{activity.message}</span>
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden mt-4">
            {/* Quick encouragements */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {ENCOURAGEMENTS.map((msg, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap text-xs flex-shrink-0"
                  onClick={() => handleSendEncouragement(msg)}
                >
                  <Heart className="w-3 h-3 mr-1 text-pink-400" />
                  {msg}
                </Button>
              ))}
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-auto space-y-3 min-h-[200px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm">Send some encouragement to your friends!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div 
                    key={comment.id}
                    className={`p-3 rounded-xl ${
                      comment.comment_type === 'encouragement' 
                        ? 'bg-pink-500/10 border border-pink-500/20' 
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {getCommentIcon(comment.comment_type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{comment.username}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm mt-0.5">{comment.content}</p>
                      </div>
                      {comment.user_id === user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteComment(comment.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment input */}
            <div className="flex gap-2 pt-3 border-t border-border mt-3">
              <Input
                placeholder="Write a message..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                className="flex-1"
              />
              <Button 
                size="icon" 
                onClick={handleSendComment}
                disabled={!commentText.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
