"use client";

import { use, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardContent 
} from "@/components/ui/card";
import { 
    LayoutGrid, 
    Search, 
    Settings2, 
    ExternalLink, 
    AlertCircle, 
    Save, 
    Hash, 
    Send,
    ArrowRight,
    X,
    Bell,
    Puzzle,
    Bot,
    Copy,
    Zap,
    MessageSquare
} from "lucide-react";
import { notFound } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { SlackLogo, TelegramLogo, WhatsAppLogo } from "@/components/org/IntegrationLogos";
import { SlackConfigModal } from "@/components/org/SlackConfigModal";
import { TelegramConfigModal } from "@/components/org/TelegramConfigModal";

export default function IntegrationsPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    const org = useStore(useShallow((state) => state.organizations.find((o) => o.id === orgId)));

    const [isSlackConfigOpen, setIsSlackConfigOpen] = useState(false);
    const [isTelegramConfigOpen, setIsTelegramConfigOpen] = useState(false);

    if (!mounted) return null;
    if (!org) return notFound();

    const isSlackConnected = !!org.slackWebhookUrl;
    const isTelegramConnected = !!org.telegramChatId;

    return (
        <div className="max-w-6xl mx-auto px-5 md:px-8 space-y-10 py-4 lg:py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
                        System Powerups
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Puzzle className="w-6 h-6 text-primary" />
                        Integrations
                    </h1>
                    <p className="text-[13px] text-muted-foreground font-medium max-w-lg">
                        Connect CrushGoals to your team's existing workflow to automate accountability and celebrate wins together.
                    </p>
                </div>

                <div className="relative group w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                        placeholder="Search integrations..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-accent/30 border-border/40 focus-visible:ring-primary/20 h-10 text-sm"
                    />
                </div>
            </div>

            <Separator className="opacity-10" />

            {/* Integrations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Slack Integration Card */}
                <div 
                    onClick={() => setIsSlackConfigOpen(true)}
                    className={cn(
                        "group relative glass-card p-8 flex flex-col items-center text-center gap-6 transition-all duration-500 cursor-pointer overflow-hidden",
                        isSlackConfigOpen ? "ring-2 ring-primary border-primary/20 shadow-2xl scale-[1.02]" : "hover:shadow-2xl hover:translate-y-[-8px] hover:border-primary/30",
                        isSlackConnected && "border-emerald-500/20 bg-emerald-500/[0.02]"
                    )}
                >
                    <div className={cn(
                        "absolute top-4 right-4 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5",
                        isSlackConnected ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-muted text-muted-foreground"
                    )}>
                        {isSlackConnected ? "Connected" : "Available"}
                    </div>

                    <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform border border-border/10">
                        <SlackLogo />
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold tracking-tight">Slack</h2>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">Win celebrations and blocker alerts for your team channel.</p>
                    </div>

                    <div className="pt-2 w-full">
                        <Button variant={isSlackConnected ? "secondary" : "default"} className="w-full h-11 text-[11px] font-black uppercase tracking-widest gap-2">
                            {isSlackConnected ? "Configure" : "Connect"}
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>

                {/* Telegram Card */}
                <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-sky-500/50 transition-all duration-300">
                    <div className="absolute top-0 left-0 w-1 h-full bg-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform border border-border/10 overflow-hidden">
                            <TelegramLogo className="w-full h-full" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-xl font-bold tracking-tight">Telegram Bot</CardTitle>
                                {isTelegramConnected && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Active</span>
                                    </div>
                                )}
                            </div>
                            <CardDescription className="text-xs">Interactive goal management via groups</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Get nudges, mark goals as crushed, or flag blockers directly from your Telegram groups.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <Button 
                                onClick={() => setIsTelegramConfigOpen(true)}
                                className={cn(
                                    "flex-1 h-10 font-bold text-xs gap-2 transition-all",
                                    isTelegramConnected 
                                        ? "bg-muted hover:bg-muted/80 text-foreground" 
                                        : "gradient-primary text-white border-0 shadow-lg shadow-primary/20"
                                )}
                            >
                                {isTelegramConnected ? "Manage Bot" : "Connect Bot"}
                                <Bot className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* WhatsApp Placeholder */}
                <div className="group relative glass-card p-8 flex flex-col items-center text-center gap-6 opacity-60 border-dashed grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                    <div className="w-20 h-20 rounded-3xl bg-green-500/5 border border-green-500/10 flex items-center justify-center">
                        <WhatsAppLogo className="w-12 h-12 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold tracking-tight text-muted-foreground">WhatsApp</h2>
                        <p className="text-xs text-muted-foreground/60 font-medium leading-relaxed">Personal accountability nudges via WhatsApp Business.</p>
                    </div>
                    <div className="pt-2 w-full">
                        <Button variant="ghost" disabled className="w-full text-[9px] font-black uppercase tracking-widest opacity-40">Coming Soon</Button>
                    </div>
                </div>
            </div>

            {/* Focused Slack Configuration Overlay */}
            <SlackConfigModal 
                isOpen={isSlackConfigOpen} 
                onClose={() => setIsSlackConfigOpen(false)} 
                org={org} 
                orgId={orgId} 
            />

            {/* Telegram Config Modal */}
            <TelegramConfigModal 
                isOpen={isTelegramConfigOpen} 
                onClose={() => setIsTelegramConfigOpen(false)} 
                org={org} 
                orgId={orgId} 
            />
        </div>
    );
}
