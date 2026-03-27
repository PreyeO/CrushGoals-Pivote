import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users, UserPlus, Check } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { OrgMember } from "@/types";
import { InviteMemberModal } from "@/components/invite-member-modal";

interface CreateGoalAssigneesProps {
    members: OrgMember[];
    selectedAssignees: string[];
    isMemberOnly: boolean;
    myMemberId: string;
    toggleAssignee: (id: string) => void;
    toggleEveryone: () => void;
}

export function CreateGoalAssignees({
    members,
    selectedAssignees,
    isMemberOnly,
    myMemberId,
    toggleAssignee,
    toggleEveryone,
}: CreateGoalAssigneesProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider">
                    {isMemberOnly ? "Assigned To" : "Assign To"}
                </Label>
                {!isMemberOnly && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={toggleEveryone}
                        className={cn(
                            "h-7 text-[10px] px-2 gap-1.5 border border-border/20",
                            selectedAssignees.length === members.length && "bg-primary/10 text-primary border-primary/20"
                        )}
                    >
                        <Users className="w-3 h-3" />
                        Everyone
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center">
                    {selectedAssignees.slice(0, 6).map((id, i) => {
                        const m = members.find(m => m.id === id);
                        if (!m) return null;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => !isMemberOnly && toggleAssignee(id)}
                                title={m.name}
                                className={cn(
                                    "relative w-8 h-8 rounded-full border-2 border-background transition-transform hover:scale-110 hover:z-10",
                                    i > 0 && "-ml-2"
                                )}
                                style={{ zIndex: i }}
                            >
                                <Avatar className="w-full h-full">
                                    <AvatarFallback className="text-[9px] bg-primary/20 text-primary font-bold uppercase">
                                        {m.name.split(" ").map(n => n[0]).join("")}
                                    </AvatarFallback>
                                </Avatar>
                                {!isMemberOnly && (
                                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-destructive/80 text-white text-[7px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</span>
                                )}
                            </button>
                        );
                    })}
                    {selectedAssignees.length > 6 && (
                        <div className="relative -ml-2 w-8 h-8 rounded-full bg-accent border-2 border-background flex items-center justify-center text-[9px] font-bold text-muted-foreground z-10">
                            +{selectedAssignees.length - 6}
                        </div>
                    )}
                    {selectedAssignees.length === 0 && (
                        <span className="text-xs text-muted-foreground/60 italic">No one assigned yet</span>
                    )}
                </div>

                {!isMemberOnly && (
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 text-[11px] border-dashed border-border/40 text-muted-foreground hover:text-foreground"
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    Add Assignee
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-52 glass-card border-border/40">
                                <ScrollArea className="max-h-52">
                                    {members.map((member) => {
                                        const isSelf = member.id === myMemberId;
                                        const isSelected = selectedAssignees.includes(member.id);
                                        return (
                                            <DropdownMenuItem
                                                key={member.id}
                                                onSelect={(e) => { e.preventDefault(); toggleAssignee(member.id); }}
                                                className="flex items-center gap-2 cursor-pointer"
                                            >
                                                <Avatar className="w-6 h-6 shrink-0">
                                                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary uppercase">
                                                        {member.name.split(" ").map(n => n[0]).join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="flex-1 text-xs truncate">{isSelf ? `${member.name} (You)` : member.name}</span>
                                                {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </ScrollArea>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {members.length === 1 && (
                            <InviteMemberModal orgId={members[0].orgId}>
                                <button type="button" className="text-[10px] text-primary hover:underline flex items-center gap-1 animate-pulse">
                                    <UserPlus className="w-3 h-3" /> Invite teammates
                                </button>
                            </InviteMemberModal>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
