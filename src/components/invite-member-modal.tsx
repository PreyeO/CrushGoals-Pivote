"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import { OrgRole } from "@/types";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { InviteMemberForm, InviteFormValues } from "./org/InviteMemberForm";
import { InviteMemberSuccess } from "./org/InviteMemberSuccess";

interface InviteMemberModalProps {
    orgId: string;
    children?: React.ReactNode;
}

export function InviteMemberModal({ orgId, children }: InviteMemberModalProps) {
    const [open, setOpen] = useState(false);
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);
    
    const organizations = useStore((state) => state.organizations);
    const currentOrg = organizations.find(o => o.id === orgId);
    const sendInvitation = useStore((state) => state.sendInvitation);

    const plan = currentOrg?.plan || "free";
    const memberLimit = plan === "free" ? 10 : plan === "pro" ? 25 : Infinity;
    const isLimitReached = (currentOrg?.memberCount || 0) >= memberLimit;



    const onSubmit = async (data: InviteFormValues) => {
        try {
            const emails = data.email.split(',').map(e => e.trim()).filter(e => e);
            
            if (emails.length === 1) {
                const { link, emailError } = await sendInvitation(orgId, emails[0], data.role as OrgRole);
                setInviteLink(link);
                setInvitedEmails(emails);

                if (emailError) {
                    toast.warning("Member added, but invitation email failed: " + emailError);
                } else {
                    toast.success("Invitation created and email sent!");
                }
            } else {
                const promises = emails.map(email => sendInvitation(orgId, email, data.role as OrgRole));
                const results = await Promise.allSettled(promises);
                
                const successfulEmails: string[] = [];
                let hasErrors = false;

                results.forEach((result, idx) => {
                    if (result.status === 'fulfilled') {
                        successfulEmails.push(emails[idx]);
                        if (result.value.emailError) {
                            hasErrors = true;
                        }
                    } else {
                        hasErrors = true;
                    }
                });

                if (successfulEmails.length > 0) {
                    setInvitedEmails(successfulEmails);
                    setInviteLink("batch_success"); 
                    if (hasErrors) {
                        toast.warning(`Sent to ${successfulEmails.length} out of ${emails.length} teammates.`);
                    } else {
                        toast.success(`Invitations sent to ${successfulEmails.length} teammates!`);
                    }
                } else {
                    throw new Error("Failed to send any invitations");
                }
            }
        } catch (error: any) {
            console.error("Failed to invite members:", error);
            toast.error(error.message || "Failed to send invitations");
        }
    };

    const copyToClipboard = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            // Reset state when closing
            setTimeout(() => {
                setInviteLink(null);
                setInvitedEmails([]);
                setCopied(false);
            }, 200);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild disabled={isLimitReached}>
                {children || (
                    <Button 
                        disabled={isLimitReached}
                        className="gradient-primary text-white border-0 hover:opacity-90 gap-2 h-9 text-[13px] font-semibold disabled:opacity-50"
                    >
                        <UserPlus className="w-4 h-4" /> 
                        {isLimitReached ? "Limit Reached" : "Invite Teammate"}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] glass-card border-border/40 backdrop-blur-2xl">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mb-4 glow-primary-sm">
                        <Mail className="w-6 h-6 text-white" />
                    </div>
                    <DialogTitle className="text-xl font-bold">Invite Teammate</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {inviteLink ? "Invitation created! Share the link below with them." : "Send an invitation to join your team."}
                    </DialogDescription>
                </DialogHeader>

                {inviteLink ? (
                    <InviteMemberSuccess
                        inviteLink={inviteLink}
                        invitedEmails={invitedEmails}
                        copied={copied}
                        copyToClipboard={copyToClipboard}
                        handleOpenChange={handleOpenChange}
                    />
                ) : (
                    <InviteMemberForm onSubmit={onSubmit} />
                )}
            </DialogContent>
        </Dialog>
    );
}
