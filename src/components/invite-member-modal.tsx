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
import { Mail, UserPlus, Sparkles } from "lucide-react";
import { OrgRole } from "@/types";

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
            // In a real app, this would call an API
            console.log("Inviting member to org:", orgId, data);

            // Artificial delay
            await new Promise(resolve => setTimeout(resolve, 800));

            reset();
            setOpen(false);
        } catch (error) {
            console.error("Failed to invite member:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
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
                        Send an invitation to join your organization.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                            {isSubmitting ? "Sending..." : "Send Invitation"}
                            <Sparkles className="w-4 h-4 ml-2" />
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
