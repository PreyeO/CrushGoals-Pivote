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
import { slackService } from "@/lib/services/slack";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";

const SlackLogo = ({ className }: { className?: string }) => (
    <svg width="40" height="40" viewBox="0 0 122.8 122.8" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.4 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#e01e5a"/>
        <path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.4c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58 0 52.2 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#36c5f0"/>
        <path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.4 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C67.7 5.8 73.5 0 80.6 0s12.9 5.8 12.9 12.9v32.3z" fill="#2eb67d"/>
        <path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.4c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8-12.9-12.9 12.9H77.6z" fill="#ecb22e"/>
    </svg>
);

const TelegramLogo = ({ className }: { className?: string }) => (
    <svg width="40" height="40" viewBox="0 0 240 240" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="120" cy="120" r="120" fill="#24A1DE"/>
        <path d="M54 116.5l45 19 17 54 28-26 44 33 16-90L54 116.5z" fill="#FFF"/>
        <path d="M99 135.5l14 38 7-30-21-8z" fill="#D2D2D2"/>
        <path d="M120 143.5l54 39-15-88-78 49 39 0z" fill="#B0B0B0" opacity="0.3"/>
    </svg>
);

const WhatsAppLogo = ({ className }: { className?: string }) => (
    <svg width="40" height="40" viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.431 5.63 1.432h.006c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" fill="#25D366"/>
    </svg>
);

export default function IntegrationsPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    const org = useStore(useShallow((state) => state.organizations.find((o) => o.id === orgId)));
    const updateOrganization = useStore((state) => state.updateOrganization);

    const [slackWebhookUrl, setSlackWebhookUrl] = useState(org?.slackWebhookUrl || "");
    const [slackSettings, setSlackSettings] = useState(org?.slackSettings || {
        notify_on_completion: true,
        notify_on_blocked: true,
        notify_on_stale: true,
        notify_on_streaks: true,
        notify_on_creation: true,
        notify_on_checkin: true,
        stale_threshold_days: 5
    });

    const [telegramChatId, setTelegramChatId] = useState(org?.telegramChatId || "");
    const [telegramSettings, setTelegramSettings] = useState(org?.telegramSettings || {
        notify_on_completion: true,
        notify_on_blocked: true,
        notify_on_stale: true,
        notify_on_streaks: true,
        notify_on_creation: true,
        notify_on_checkin: true,
        stale_threshold_days: 5,
        allow_commands: true
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const [isTestingSlack, setIsTestingSlack] = useState(false);
    const [isTestingTelegram, setIsTestingTelegram] = useState(false);
    const [isSlackConfigOpen, setIsSlackConfigOpen] = useState(false);
    const [isTelegramConfigOpen, setIsTelegramConfigOpen] = useState(false);

    useEffect(() => {
        if (org) {
            setSlackWebhookUrl(org.slackWebhookUrl || "");
            if (org.slackSettings) {
                setSlackSettings({
                    notify_on_completion: org.slackSettings.notify_on_completion ?? true,
                    notify_on_blocked: org.slackSettings.notify_on_blocked ?? true,
                    notify_on_stale: org.slackSettings.notify_on_stale ?? true,
                    notify_on_streaks: org.slackSettings.notify_on_streaks ?? true,
                    notify_on_creation: org.slackSettings.notify_on_creation ?? true,
                    notify_on_checkin: org.slackSettings.notify_on_checkin ?? true,
                    stale_threshold_days: org.slackSettings.stale_threshold_days || 5,
                });
            }
            
            if (org.telegramSettings) {
                setTelegramSettings({
                    notify_on_completion: org.telegramSettings.notify_on_completion ?? true,
                    notify_on_blocked: org.telegramSettings.notify_on_blocked ?? true,
                    notify_on_stale: org.telegramSettings.notify_on_stale ?? true,
                    notify_on_streaks: org.telegramSettings.notify_on_streaks ?? true,
                    notify_on_creation: org.telegramSettings.notify_on_creation ?? true,
                    notify_on_checkin: org.telegramSettings.notify_on_checkin ?? true,
                    stale_threshold_days: org.telegramSettings.stale_threshold_days || 5,
                    allow_commands: org.telegramSettings.allow_commands ?? true,
                });
            }
            setTelegramChatId(org.telegramChatId || "");
        }
    }, [org]);

    if (!mounted) return null;
    if (!org) return notFound();

    const isSlackConnected = !!org.slackWebhookUrl;
    const isTelegramConnected = !!org.telegramChatId;

    const handleSaveSlack = async () => {
        setIsSaving(true);
        try {
            await updateOrganization(orgId, {
                slackWebhookUrl,
                slackSettings
            });
            toast.success("Slack integration updated");
        } catch (error) {
            toast.error("Failed to save Slack settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveTelegram = async () => {
        setIsSaving(true);
        try {
            await updateOrganization(orgId, {
                telegramChatId,
                telegramSettings
            });
            toast.success("Telegram settings saved");
        } catch (error) {
            toast.error("Failed to save Telegram settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestSlack = async () => {
        if (!slackWebhookUrl) {
            toast.error("Please enter a webhook URL");
            return;
        }
        setIsTestingSlack(true);
        try {
            await slackService.sendWelcome(slackWebhookUrl);
            toast.success("Slack test message sent!");
        } catch (error) {
            toast.error("Slack connection failed");
        } finally {
            setIsTestingSlack(false);
        }
    };

    const handleTestTelegram = async () => {
        if (!telegramChatId) {
            toast.error("Group not connected yet. Link via /connect first!");
            return;
        }
        setIsTestingTelegram(true);
        try {
            await fetch('/api/telegram/notify', {
                method: 'POST',
                body: JSON.stringify({ 
                    chatId: telegramChatId, 
                    method: 'sendWelcome', 
                    args: [] 
                })
            });
            toast.success("Test notification sent to your group!");
        } catch (error) {
            toast.error("Telegram connection failed");
        } finally {
            setIsTestingTelegram(false);
        }
    };

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
            {isSlackConfigOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-8 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setIsSlackConfigOpen(false)} />
                    <div className="relative w-full h-[95vh] sm:h-auto max-w-5xl glass-card overflow-hidden shadow-2xl border-primary/20 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 rounded-t-3xl sm:rounded-3xl">
                        <div className="p-5 md:px-10 md:py-8 border-b border-border/40 flex items-center justify-between bg-accent/30">
                            <div className="flex items-center gap-4">
                                <SlackLogo className="w-10 h-10 md:w-12 md:h-12" />
                                <h2 className="text-xl md:text-2xl font-bold tracking-tight">Configure Slack</h2>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setIsSlackConfigOpen(false)} className="rounded-full h-10 w-10 p-0"><X className="w-5 h-5" /></Button>
                        </div>

                        <div className="p-5 md:p-10 h-[calc(95vh-80px)] sm:max-h-[70vh] overflow-y-auto scrollbar-thin">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Hash className="w-4 h-4" /> Connection</h3>
                                        <div className="bg-accent/40 border border-border/20 rounded-2xl p-6 space-y-4 shadow-inner">
                                            {[1,2,3,4,5].map(i => (
                                                <div key={i} className="flex gap-3 items-start">
                                                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                                                    <p className="text-xs font-medium">Step {i} details...</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-3 pt-2">
                                            <Label className="text-[10px] font-bold uppercase">Webhook URL</Label>
                                            <div className="flex gap-2">
                                                <Input type="password" value={slackWebhookUrl} onChange={(e) => setSlackWebhookUrl(e.target.value)} className="h-11 border-border/40" />
                                                <Button variant="secondary" onClick={handleTestSlack} disabled={isTestingSlack} className="px-6 h-11 font-bold">{isTestingSlack ? "..." : "Test"}</Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Stale Threshold</h3>
                                        <div className="bg-background/40 p-5 rounded-2xl border border-border/20 space-y-4">
                                            <Slider min={1} max={14} step={1} value={[slackSettings.stale_threshold_days]} onValueChange={([v]) => setSlackSettings({...slackSettings, stale_threshold_days: v})} />
                                            <p className="text-[10px] text-center text-muted-foreground italic">Nudge after {slackSettings.stale_threshold_days} days.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Bell className="w-4 h-4" /> Events</h3>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'notify_on_creation', label: 'New Goals' },
                                            { id: 'notify_on_checkin', label: 'Daily Check-ins' },
                                            { id: 'notify_on_completion', label: 'Goal Wins' },
                                            { id: 'notify_on_blocked', label: 'Blockers' },
                                            { id: 'notify_on_stale', label: 'Stale Nudges' },
                                            { id: 'notify_on_streaks', label: 'Streaks' },
                                        ].map((event) => (
                                            <div key={event.id} className="p-4 rounded-2xl border bg-white/50 border-border/40 flex items-center gap-4 cursor-pointer" onClick={() => setSlackSettings({...slackSettings, [event.id]: !(slackSettings as any)[event.id]} as any)}>
                                                <Checkbox checked={(slackSettings as any)[event.id]} className="h-5 w-5" />
                                                <Label className="text-xs font-bold">{event.label}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4">
                                        <Button onClick={handleSaveSlack} disabled={isSaving} className="w-full h-12 gradient-primary text-white glow-primary border-0 font-black tracking-widest uppercase text-[11px]">Save Slack Configuration</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Telegram Config Modal */}
            {isTelegramConfigOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-8 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setIsTelegramConfigOpen(false)} />
                    <div className="relative w-full h-[95vh] sm:h-auto max-w-5xl glass-card overflow-hidden shadow-2xl border-sky-500/20 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 rounded-t-3xl sm:rounded-3xl">
                        <div className="p-5 md:px-10 md:py-8 border-b border-border/40 flex items-center justify-between bg-sky-500/5">
                            <div className="flex items-center gap-4">
                                <TelegramLogo className="w-10 h-10 md:w-12 md:h-12" />
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">Telegram Notifications</h2>
                                    <p className="text-[12px] text-muted-foreground mt-1 hidden sm:block">Get goal updates delivered straight to your Telegram group.</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setIsTelegramConfigOpen(false)} className="rounded-full h-10 w-10 p-0"><X className="w-5 h-5" /></Button>
                        </div>

                        <div className="p-5 md:p-10 h-[calc(95vh-80px)] sm:max-h-[70vh] overflow-y-auto scrollbar-thin">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Left Column: Connection Steps */}
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-sky-500 flex items-center gap-2"><Hash className="w-4 h-4" /> Connection Steps</h3>
                                        
                                        <div className="bg-accent/40 border border-border/20 rounded-2xl p-6 space-y-6 shadow-inner">
                                            <div className="flex gap-4 items-start">
                                                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-500 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-bold tracking-tight">Add the bot to your group</h4>
                                                            <p className="text-sm">Open Telegram, search for <span className="font-bold text-sky-500">@CrushGoals_Bot</span> and add it to your team's group chat. It takes 30 seconds.</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 items-start">
                                                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-500 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                                                <div className="space-y-2 w-full">
                                                    <h4 className="text-sm font-bold tracking-tight">Connect your organization</h4>
                                                    <p className="text-[12px] text-muted-foreground leading-relaxed">Send this code in your Telegram group — the bot will link it to CrushGoals automatically.</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="px-4 py-2.5 bg-background rounded-xl border border-sky-500/30 text-sky-500 font-mono font-bold tracking-[0.2em] text-lg lg:text-xl shadow-inner select-all">
                                                            {org.connectCode || "ABC123"}
                                                        </div>
                                                        <Button 
                                                            variant="secondary" 
                                                            className="h-12 px-4 font-bold gap-2 whitespace-nowrap hidden sm:flex"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(`/connect ${org.connectCode}`);
                                                                toast.success("Code copied!");
                                                            }}
                                                        >
                                                            <Copy className="w-4 h-4" /> Copy Code
                                                        </Button>
                                                        <Button 
                                                            variant="secondary" 
                                                            size="icon"
                                                            className="h-12 w-12 sm:hidden"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(`/connect ${org.connectCode}`);
                                                                toast.success("Code copied!");
                                                            }}
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 items-start">
                                                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-500 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-bold tracking-tight">You're done</h4>
                                                    <p className="text-[12px] text-muted-foreground leading-relaxed">The bot will confirm when your group is connected. Start crushing goals and your team gets notified instantly.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            {isTelegramConnected ? (
                                                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                            Connected — {org.telegramChatTitle || `@Group_${org.telegramChatId?.substring(0, 4) || ""}`}
                                                        </p>
                                                    </div>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-8 text-[11px] hover:text-red-500 hover:bg-red-500/10 font-bold"
                                                        onClick={() => {
                                                            setTelegramChatId("");
                                                            updateOrganization(orgId, { telegramChatId: "", telegramChatTitle: "" });
                                                        }}
                                                    >
                                                        Disconnect
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border border-border rounded-2xl">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        Not connected yet — complete steps above
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Preferences */}
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-sky-500 flex items-center gap-2"><Settings2 className="w-4 h-4" /> Notification Preferences</h3>
                                        <p className="text-sm font-medium mb-4">What should we notify your team about?</p>
                                        
                                        <div className="space-y-3">
                                            {[
                                                { id: 'notify_on_creation', label: 'New goals', desc: 'When a new goal is created' },
                                                { id: 'notify_on_checkin', label: 'Daily check-ins', desc: 'When someone updates progress' },
                                                { id: 'notify_on_completion', label: 'Goal crushed', desc: 'When someone completes a goal' },
                                                { id: 'notify_on_blocked', label: 'Goal blocked', desc: "When someone flags they're stuck" },
                                                { id: 'notify_on_stale', label: 'Stale goals', desc: 'Goals with no update after 5 days' },
                                                { id: 'notify_on_streaks', label: 'Weekly digest', desc: 'Monday morning summary of all goals' },
                                            ].map((event) => (
                                                <div 
                                                    key={event.id} 
                                                    className="p-4 rounded-2xl border bg-white/50 border-border/40 flex flex-col justify-center cursor-pointer transition-colors hover:bg-muted/50" 
                                                    onClick={() => setTelegramSettings({...telegramSettings, [event.id]: !(telegramSettings as any)[event.id]} as any)}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <Checkbox 
                                                            checked={(telegramSettings as any)[event.id]} 
                                                            className="h-5 w-5 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500" 
                                                        />
                                                        <div>
                                                            <Label className="text-sm font-bold cursor-pointer">{event.label}</Label>
                                                            <p className="text-[12px] text-muted-foreground mt-0.5">{event.desc}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-border/40">
                                        <div className="flex flex-col gap-2">
                                            <Button 
                                                variant="outline" 
                                                className="w-full h-11 font-bold gap-2"
                                                onClick={handleTestTelegram}
                                                disabled={!isTelegramConnected || isTestingTelegram}
                                            >
                                                {isTestingTelegram ? "Sending..." : "Send Test Message"}
                                                <Zap className="w-4 h-4" />
                                            </Button>
                                            <p className="text-[11px] text-center text-muted-foreground">
                                                Sends a sample notification to confirm everything is working.
                                            </p>
                                        </div>
                                        
                                        <Button 
                                            onClick={handleSaveTelegram} 
                                            disabled={isSaving} 
                                            className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white border-0 font-black tracking-widest uppercase text-[11px] shadow-lg shadow-sky-500/20"
                                        >
                                            {isSaving ? "Saving..." : "Save Configuration"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
