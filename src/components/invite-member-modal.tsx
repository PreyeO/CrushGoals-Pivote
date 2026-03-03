"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Mail, UserPlus, Sparkles, Copy, Check, Link as LinkIcon } from "lucide-react";
import { OrgRole } from "@/types";
import { useStore } from "@/lib/store";
import { toast } from "sonner"; // Assuming sonner is used for toasts based on typical shadcn setup

const formSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    role: z.enum(["admin", "member"]),
});

type FormValues = z.infer<typeof formSchema>;

interface InviteMemberModalProps {
    orgId: string;
    children?: React.ReactNode;
}

export function InviteMemberModal({ orgId, children }: InviteMemberModalProps) {
    const [open, setOpen] = useState(false);
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const sendInvitation = useStore((state) => state.sendInvitation);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            role: "member",
        },
    });

    const onSubmit = async (data: FormValues) => {
        try {
            const { link, emailError } = await sendInvitation(orgId, data.email, data.role as OrgRole);
            setInviteLink(link);

            if (emailError) {
                toast.warning("Member added, but invitation email failed: " + emailError);
            } else {
                toast.success("Invitation created and email sent!");
            }
        } catch (error: any) {
            console.error("Failed to invite member:", error);
            toast.error(error.message || "Failed to send invitation");
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
                setCopied(false);
                reset();
            }, 200);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="gradient-primary text-white border-0 hover:opacity-90 gap-2 h-9 text-[13px] font-semibold">
                        <UserPlus className="w-4 h-4" /> Invite Member
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] glass-card border-border/40 backdrop-blur-2xl">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mb-4 glow-primary-sm">
                        <Mail className="w-6 h-6 text-white" />
                    </div>
                    <DialogTitle className="text-xl font-bold">Invite Team Member</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {inviteLink ? "Invitation created! Share the link below with your teammate." : "Send an invitation to join your organization."}
                    </DialogDescription>
                </DialogHeader>

                {inviteLink ? (
                    <div className="py-6 space-y-4 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Invitation Link</Label>
                            <div className="flex gap-2 items-center">
                                <div className="flex-1 bg-accent/30 border border-border/40 rounded-xl px-3 py-2.5 text-[11px] font-mono text-muted-foreground flex items-center gap-2 overflow-hidden">
                                    <LinkIcon className="w-3.5 h-3.5 shrink-0 text-primary/60" />
                                    <span className="break-all line-clamp-2 select-all cursor-text">{inviteLink}</span>
                                </div>
                                <Button size="icon" onClick={copyToClipboard} className="gradient-primary text-white border-0 rounded-xl h-10 w-10 glow-primary-sm shrink-0">
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground italic text-center px-4">
                            The recipient can use this link to join the organization directly.
                        </p>
                        <DialogFooter className="pt-4">
                            <Button variant="outline" onClick={() => handleOpenChange(false)} className="w-full border-border/60 hover:bg-accent/60">
                                Done
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 animate-in fade-in duration-300">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="teammate@example.com"
                                className="bg-accent/30 border-border/40 focus:border-primary/50 transition-colors"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-[10px] text-destructive font-medium">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider">Role</Label>
                            <Select defaultValue="member" onValueChange={(v) => setValue("role", v as any)}>
                                <SelectTrigger className="bg-accent/30 border-border/40">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent className="glass-card border-border/40">
                                    <SelectItem value="member">Member (Can track goals)</SelectItem>
                                    <SelectItem value="admin">Admin (Can manage team)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full gradient-primary text-white border-0 glow-primary-sm"
                            >
                                {isSubmitting ? "Generating..." : "Generate Invitation"}
                                <Sparkles className="w-4 h-4 ml-2" />
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
