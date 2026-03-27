import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { OrgMember } from "@/types";
import { roleStyles } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

interface MemberProfileHeaderProps {
  member: OrgMember;
}

export function MemberProfileHeader({ member }: MemberProfileHeaderProps) {
  const r = roleStyles[member.role] || {
    label: member.role,
    class: "",
    icon: UserMinus,
  };

  return (
    <div className="glass-card p-6 mb-6 animate-fade-in shadow-xl border-border/40">
      <div className="flex items-center gap-5">
        <Avatar className="w-16 h-16 border-2 border-primary/20 shadow-inner">
          <AvatarImage src={member.avatarUrl || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl uppercase">
            {member.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold truncate">{member.name}</h1>
            <Badge className={`${r.class} text-[9px] gap-1`}>
              <r.icon className="w-2.5 h-2.5" /> {r.label}
            </Badge>
          </div>
          <p className="text-[12px] text-muted-foreground">
            {member.email || "No email"}
          </p>
          <p className="text-[10px] text-muted-foreground/50 mt-1">
            Joined{" "}
            {new Date(member.joinedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {member.role !== "owner" && (
            <Button
              variant="destructive"
              size="sm"
              className="h-9 px-4 text-xs font-bold gap-2 animate-in slide-in-from-right-4 duration-500 shadow-lg shadow-destructive/20 border-destructive/20"
              onClick={async () => {
                if (
                  confirm(
                    `Are you sure you want to remove ${member.name} from the organization? This action cannot be undone.`,
                  )
                ) {
                  try {
                    await useStore.getState().removeOrgMember(member.id);
                    toast.success(`${member.name} has been removed.`);
                    window.history.back(); // Take them back to the list
                  } catch (err) {
                    toast.error("Failed to remove member. Please try again.");
                  }
                }
              }}
            >
              <UserMinus className="w-4 h-4" />
              Remove Member
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
