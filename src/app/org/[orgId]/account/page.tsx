"use client";

import { use, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCircle, LogOut, Mail, User, Send, Smartphone, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateTelegramLinkCode, unlinkTelegram } from "@/app/actions/telegram";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AccountPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const fetchInitialData = useStore((state) => state.fetchInitialData);
    const user = useStore(useShallow((state) => state.user));
    const signOut = useStore((state) => state.signOut);
    const members = useStore(useShallow((state) => state.members));
    const organization = useStore(useShallow((state) => state.organizations.find(o => o.id === orgId)));

    const [isGenerating, setIsGenerating] = useState(false);
    const [isUnlinking, setIsUnlinking] = useState(false);
    const [linkCode, setLinkCode] = useState<string | null>(null);

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

    const handleGenerateCode = async () => {
        if (!user?.id) return;
        setIsGenerating(true);
        const result = await generateTelegramLinkCode(user.id);
        if (result.success) {
            setLinkCode(result.code!);
            toast.success("Link code generated!");
        } else {
            toast.error(result.error || "Failed to generate code");
        }
        setIsGenerating(false);
    };

    const handleUnlink = async () => {
        if (!user?.id) return;
        if (!confirm("Are you sure you want to unlink your Telegram account?")) return;
        setIsUnlinking(true);
        const result = await unlinkTelegram(user.id);
        if (result.success) {
            toast.success("Telegram unlinked successfully!");
        } else {
            toast.error(result.error || "Failed to unlink");
        }
        setIsUnlinking(false);
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

                {/* Telegram Integration */}
                <section className="glass-card p-6 space-y-5 border-sky-500/20 bg-sky-500/[0.02]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-sky-500 flex items-center gap-2">
                            <Send className="w-3.5 h-3.5" /> Telegram Integration
                        </h2>
                        {user?.profile?.telegram_user_id ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> Linked
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted px-2 py-0.5 rounded-full">
                                <XCircle className="w-3 h-3" /> Not Linked
                            </span>
                        )}
                    </div>

                    <div className="space-y-4">
                        <p className="text-[13px] text-muted-foreground leading-relaxed">
                            Link your Telegram account to get personal status summaries and manage your goals directly from the bot.
                        </p>

                        {!user?.profile?.telegram_user_id ? (
                            <div className="space-y-4">
                                {linkCode || user?.profile?.telegram_link_code ? (
                                    <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-3 text-center">
                                        <p className="text-xs font-medium text-sky-600 dark:text-sky-400">Your Link Code:</p>
                                        <div className="text-2xl font-mono font-black tracking-[0.3em] text-sky-500">
                                            {linkCode || user?.profile?.telegram_link_code}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            Send <code className="bg-sky-500/10 px-1 py-0.5 rounded text-sky-500">/link {linkCode || user?.profile?.telegram_link_code}</code> to <span className="font-bold">@CrushGoals_Bot</span>
                                        </p>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={handleGenerateCode} 
                                            disabled={isGenerating}
                                            className="text-[10px] font-bold uppercase tracking-widest gap-2 h-7"
                                        >
                                            <RefreshCw className={cn("w-3 h-3", isGenerating && "animate-spin")} /> Regenerate
                                        </Button>
                                    </div>
                                ) : (
                                        <Button 
                                        onClick={handleGenerateCode} 
                                        disabled={isGenerating}
                                        className="w-full h-11 bg-sky-500 hover:bg-sky-600 text-white font-black uppercase tracking-widest text-[11px] gap-2 shadow-lg shadow-sky-500/20 transition-all border-0"
                                    >
                                        {isGenerating ? "Generating..." : "Generate Link Code"}
                                        <Smartphone className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                    <Smartphone className="w-4 h-4 text-emerald-500" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Telegram User ID</p>
                                        <p className="text-sm font-mono font-bold">{user.profile.telegram_user_id}</p>
                                    </div>
                                </div>
                                <Button 
                                    variant="outline" 
                                    onClick={handleUnlink} 
                                    disabled={isUnlinking}
                                    className="h-10 text-xs font-bold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
                                >
                                    {isUnlinking ? "Unlinking..." : "Unlink Telegram Account"}
                                </Button>
                            </div>
                        )}
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
