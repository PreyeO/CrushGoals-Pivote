import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { OrgMember } from "@/types";
import { roleStyles } from "@/lib/constants";

interface MemberProfileHeaderProps {
  member: OrgMember;
}

export function MemberProfileHeader({ member }: MemberProfileHeaderProps) {
  const r = roleStyles[member.role];
  
  return (
    <div className="glass-card p-6 mb-6 animate-fade-in">
      <div className="flex items-center gap-5">
        <Avatar className="w-16 h-16 border-2 border-primary/20">
          <AvatarFallback className="bg-primary/15 text-primary font-bold text-xl">
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
      </div>
    </div>
  );
}
