"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, Building2, ArrowRight, CheckCircle2 } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";

export default function InvitationsPage() {
    const [mounted, setMounted] = useState(false);
    const fetchInitialData = useStore((state) => state.fetchInitialData);
    const isLoading = useStore((state) => state.isLoading);
    const pendingInvites = useStore(useShallow((state) => state.pendingInvitations));

    useEffect(() => {
        setMounted(true);
        fetchInitialData();
    }, [fetchInitialData]);

    if (!mounted || isLoading) return <LoadingState message="Loading invitations..." />;

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-6 pt-16 bg-background relative overflow-hidden">
            {/* Ambient blobs */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[oklch(0.70_0.18_155)]/5 blur-[120px] rounded-full -ml-32 -mb-32 pointer-events-none" />

            <div className="max-w-xl w-full relative z-10">
                <header className="mb-8 animate-fade-in text-center">
                    <div className="inline-flex w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/25 items-center justify-center mb-4">
                        <Mail className="w-6 h-6 text-amber-500" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Pending Invitations</h1>
                    <p className="text-[13px] text-muted-foreground mt-1">
                        You have {pendingInvites.length} pending {pendingInvites.length === 1 ? "invitation" : "invitations"} to review.
                    </p>
                </header>

                {pendingInvites.length === 0 ? (
                    <div className="glass-card p-10 text-center animate-fade-in-up">
                        <CheckCircle2 className="w-10 h-10 text-[oklch(0.70_0.18_155)] mx-auto mb-4" />
                        <p className="font-bold text-base mb-1">All caught up!</p>
                        <p className="text-[13px] text-muted-foreground">You have no pending invitations.</p>
                    </div>
                ) : (
                    <div className="space-y-3 animate-fade-in-up">
                        {pendingInvites.map((invite) => (
                            <Link
                                key={invite.id}
                                href={`/invite/${invite.token}`}
                                className="group flex items-center justify-between p-5 rounded-2xl glass-card border-border/40 hover:border-amber-500/40 hover:bg-amber-500/[0.03] transition-all duration-300"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-accent/40 flex items-center justify-center border border-border/40">
                                        <Building2 className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold group-hover:text-amber-500 transition-colors">
                                            Invitation to join
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            Role: <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">{invite.role}</span>
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    className="gradient-primary text-white border-0 text-xs font-bold gap-1.5 h-9 px-4 shrink-0"
                                >
                                    Review
                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </Button>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
