"use client";

import { useStore } from "@/lib/store";
import { OrgMember, OrgInvite } from "@/types";
import {
  Users,
  Mail,
  MoreVertical,
  Trash2,
  Copy,
  Shield,
  ShieldAlert,
  Clock,
  UserMinus,
  Search,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

interface MembersInvitesListProps {
  orgId: string;
}

export function MembersInvitesList({ orgId }: MembersInvitesListProps) {
  const { members, invitations, cancelInvitation } = useStore();
  const [search, setSearch] = useState("");

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredInvites = invitations.filter((i) =>
    i.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCopyInviteLink = (invite: any) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/invite/${invite.token}`;
    navigator.clipboard.writeText(link);
    toast.success("Invitation link copied!");
  };

  const handleCancelInvite = async (id: string) => {
    try {
      await cancelInvitation(id);
      toast.success("Invitation canceled");
    } catch (err: any) {
      toast.error("Failed to cancel invitation");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search members or emails..."
          className="pl-10 bg-accent/20 border-border/40"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Members Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-bold tracking-tight">
            The Team ({filteredMembers.length})
          </h3>
        </div>

        <div className="grid gap-3">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="glass-card p-4 flex items-center justify-between group hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <Avatar className="w-10 h-10 border border-border/50">
                  <AvatarImage src={member.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {member.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-sm leading-none mb-1">
                    {member.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] h-4 uppercase tracking-widest font-black py-0 px-1.5 border-primary/20 bg-primary/5 text-primary"
                    >
                      {member.role === "owner" ? (
                        <ShieldAlert className="w-2 h-2 mr-1" />
                      ) : (
                        <Shield className="w-2 h-2 mr-1" />
                      )}
                      {member.role}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden md:flex flex-col items-end">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                    Impact
                  </p>
                  <p className="text-xs font-medium">
                    {member.goalsCompleted} Goals Crushed
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="glass-card border-border/40"
                  >
                    <DropdownMenuItem className="text-xs font-medium gap-2">
                      <ExternalLink className="w-3.5 h-3.5" /> View Profile
                    </DropdownMenuItem>
                    {member.role !== "owner" && (
                      <DropdownMenuItem className="text-xs font-medium gap-2 text-destructive focus:text-destructive">
                        <UserMinus className="w-3.5 h-3.5" /> Remove Member
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invitations Section */}
      {filteredInvites.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border/40">
          <div className="flex items-center gap-2 px-1">
            <Mail className="w-5 h-5 text-[oklch(0.70_0.18_155)]" />
            <h3 className="font-bold tracking-tight">
              Pending Invitations ({filteredInvites.length})
            </h3>
          </div>

          <div className="grid gap-3">
            {filteredInvites.map((invite) => (
              <div
                key={invite.id}
                className="glass-card p-4 border-dashed border-border/60 flex items-center justify-between group bg-accent/5 hover:border-[oklch(0.70_0.18_155)]/30 transition-all animate-in slide-in-from-left-4 duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-dashed border-border/60">
                    <Clock className="w-5 h-5 text-muted-foreground animate-pulse" />
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-none mb-1">
                      {invite.email}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 uppercase tracking-widest font-black py-0 px-1.5 border-[oklch(0.70_0.18_155)]/20 bg-[oklch(0.70_0.18_155)]/5 text-[oklch(0.70_0.18_155)]"
                      >
                        {invite.role}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground italic">
                        Awaiting acceptance...
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyInviteLink(invite)}
                    className="h-8 text-[11px] font-bold gap-2 border-border/60 hover:bg-accent/60"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Link
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleCancelInvite(invite.id)}
                    className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
