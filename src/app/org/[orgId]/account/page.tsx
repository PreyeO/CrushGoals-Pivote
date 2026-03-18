"use client";

import { use, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCircle, LogOut, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AccountPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const fetchInitialData = useStore((state) => state.fetchInitialData);
    const user = useStore(useShallow((state) => state.user));
    const signOut = useStore((state) => state.signOut);
    const members = useStore(useShallow((state) => state.members));

    useEffect(() => {
        setMounted(true);
        fetchInitialData(orgId);
    }, [orgId, fetchInitialData]);

    if (!mounted) return null;

    const myMember = members.find((m) => m.userId === user?.id && m.orgId === orgId);

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
        : "?";

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    return (
        <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-2xl mx-auto">
            <header className="mb-8 animate-fade-in">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-primary" />
                    My Account
                </h1>
                <p className="text-[13px] text-muted-foreground mt-1">
                    Your personal profile and session settings.
                </p>
            </header>

            <div className="space-y-6 animate-fade-in-up">
                {/* Profile Card */}
                <section className="glass-card p-6 space-y-5">
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> Profile
                    </h2>
                    <div className="flex items-center gap-5">
                        <Avatar className="w-16 h-16 border-2 border-border/40">
                            <AvatarFallback className="bg-primary/15 text-primary text-xl font-black">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-lg font-bold tracking-tight">{user?.name || "—"}</p>
                            {myMember && (
                                <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                    {myMember.role}
                                </span>
                            )}
                        </div>
                    </div>

                    <Separator className="opacity-10" />

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/30">
                        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</p>
                            <p className="text-sm font-medium">{user?.email || "—"}</p>
                        </div>
                    </div>
                </section>

                {/* Session */}
                <section className="glass-card p-6 space-y-4">
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <LogOut className="w-3.5 h-3.5" /> Session
                    </h2>
                    <Separator className="opacity-10" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-[13px] font-semibold">Sign Out</p>
                            <p className="text-[11px] text-muted-foreground">
                                Sign out of your current session. You'll need to log in again to access your organizations.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleSignOut}
                            className="h-10 px-6 text-sm font-bold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all gap-2 shrink-0"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    );
}
