import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FriendRequestCardProps {
  id: string;
  name: string;
  email: string;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function FriendRequestCard({ id, name, email, onAccept, onReject }: FriendRequestCardProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center font-bold">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0 text-success hover:bg-success/20"
          onClick={() => onAccept(id)}
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0 text-danger hover:bg-danger/20"
          onClick={() => onReject(id)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
