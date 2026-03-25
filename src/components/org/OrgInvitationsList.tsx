import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InviteMemberModal } from "@/components/invite-member-modal";
import { Copy, Trash2, Clock, Mail, Plus } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

interface OrgInvitationsListProps {
    filteredInvites: any[];
    orgId: string;
    isMemberOnly: boolean;
}

export function OrgInvitationsList({ filteredInvites, orgId, isMemberOnly }: OrgInvitationsListProps) {
    const cancelInvitation = useStore((state) => state.cancelInvitation);

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
        } catch {
            toast.error("Failed to cancel invitation");
        }
    };

    if (filteredInvites.length === 0) {
        return (
            <div className="glass-card p-12 text-center border-dashed">
                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">The Team</h1>
                <p className="text-[13px] text-muted-foreground mt-1">Manage your team and pending invitations</p>
                <h3 className="text-sm font-bold text-foreground mb-1">No pending invitations</h3>
                <p className="text-xs text-muted-foreground mb-6">
                    Invite members to start collaborating on goals.
                </p>
                {!isMemberOnly && (
                    <InviteMemberModal orgId={orgId}>
                        <Button className="gradient-primary text-white border-0 gap-2 h-9 text-[13px] font-semibold">
                            <Plus className="w-4 h-4" /> Invite Member
                        </Button>
                    </InviteMemberModal>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {filteredInvites.map((invite) => (
                <div
                    key={invite.id}
                    className="glass-card p-4 border-dashed border-border/60 flex items-center justify-between group bg-accent/5 hover:border-primary/30 transition-all animate-in slide-in-from-left-4 duration-300"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-dashed border-border/60">
                            <Clock className="w-5 h-5 text-muted-foreground animate-pulse" />
                        </div>
                        <div>
                            <p className="font-bold text-sm leading-none mb-1">{invite.email}</p>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="text-[10px] h-4 uppercase tracking-widest font-black py-0 px-1.5 border-primary/20 bg-primary/5 text-primary"
                                >
                                    {invite.role}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground italic">
                                    Expires in {Math.max(1, Math.ceil((new Date(invite.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000)))} days
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
    );
}
