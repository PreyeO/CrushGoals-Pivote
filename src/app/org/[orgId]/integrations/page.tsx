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
    Puzzle
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
        <path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.4c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ecb22e"/>
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
        stale_threshold_days: 5
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    useEffect(() => {
        if (org) {
            setSlackWebhookUrl(org.slackWebhookUrl || "");
            if (org.slackSettings) {
                setSlackSettings(org.slackSettings);
            }
        }
    }, [org]);

    if (!mounted) return null;
    if (!org) return notFound();

    const isSlackConnected = !!org.slackWebhookUrl;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateOrganization(orgId, {
                slackWebhookUrl,
                slackSettings
            });
            toast.success("Slack integration updated");
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestConnection = async () => {
        if (!slackWebhookUrl) {
            toast.error("Please enter a webhook URL");
            return;
        }
        setIsTesting(true);
        try {
            await slackService.sendWelcome(slackWebhookUrl);
            toast.success("Test message sent!");
        } catch (error) {
            toast.error("Connection failed");
        } finally {
            setIsTesting(false);
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
                    onClick={() => !isConfigOpen && setIsConfigOpen(true)}
                    className={cn(
                        "group relative glass-card p-8 flex flex-col items-center text-center gap-6 transition-all duration-500 cursor-pointer overflow-hidden",
                        isConfigOpen ? "ring-2 ring-primary border-primary/20 shadow-2xl scale-[1.02]" : "hover:shadow-2xl hover:translate-y-[-8px] hover:border-primary/30",
                        isSlackConnected && "border-emerald-500/20 bg-emerald-500/[0.02]"
                    )}
                >
                    {/* Status Badge Overlay */}
                    <div className={cn(
                        "absolute top-4 right-4 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all duration-300 flex items-center gap-1.5",
                        isSlackConnected 
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                            : "bg-muted text-muted-foreground border border-border/40"
                    )}>
                        {isSlackConnected ? (
                            <>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Connected
                            </>
                        ) : "Available"}
                    </div>

                    <div className="w-20 h-20 rounded-3xl bg-white shadow-xl shadow-black/5 flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-500 border border-border/10">
                        <SlackLogo />
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold tracking-tight">Slack</h2>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed px-2">
                            Streamline team momentum with automated win celebrations and blocker alerts.
                        </p>
                    </div>

                    <div className="pt-2 w-full">
                        <Button 
                            variant={isSlackConnected ? "secondary" : "default"}
                            className={cn(
                                "w-full h-11 text-[11px] font-black uppercase tracking-widest gap-2 shadow-sm transition-all",
                                !isSlackConnected && "gradient-primary text-white border-0 glow-primary"
                            )}
                        >
                            {isSlackConnected ? "Configure" : "Connect"}
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>

                    {/* Background Detail */}
                    <div className="absolute -bottom-6 -right-6 text-primary/5 group-hover:text-primary/10 transition-colors">
                        <SlackLogo />
                    </div>
                </div>

                {/* Teams Placeholder */}
                <div className="group relative glass-card p-8 flex flex-col items-center text-center gap-6 opacity-60 border-dashed transition-all hover:opacity-100">
                    <div className="w-20 h-20 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all text-blue-600/40">
                        <svg className="w-10 h-10" viewBox="0 0 100 100">
                            <rect fill="currentColor" width="100" height="100" rx="30" opacity="0.2"/>
                            <path fill="currentColor" d="M30 40h40v20H30zM40 30h20v40H40z"/>
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold tracking-tight text-muted-foreground">MS Teams</h2>
                        <p className="text-xs text-muted-foreground/60 font-medium leading-relaxed">
                            Bring CrushGoals accountability to the heart of your Microsoft ecosystem.
                        </p>
                    </div>
                    <div className="pt-2 w-full">
                        <Button variant="ghost" disabled className="w-full text-[9px] font-black uppercase tracking-widest opacity-40">Coming Soon</Button>
                    </div>
                </div>

                {/* Discord Placeholder */}
                <div className="group relative glass-card p-8 flex flex-col items-center text-center gap-6 opacity-60 border-dashed transition-all hover:opacity-100">
                    <div className="w-20 h-20 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all text-amber-600/40">
                        <Send className="w-10 h-10 text-amber-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold tracking-tight text-muted-foreground">Discord</h2>
                        <p className="text-xs text-muted-foreground/60 font-medium leading-relaxed">
                            High-energy notifications and weekly recaps for your Discord communities.
                        </p>
                    </div>
                    <div className="pt-2 w-full">
                        <Button variant="ghost" disabled className="w-full text-[9px] font-black uppercase tracking-widest opacity-40">Coming Soon</Button>
                    </div>
                </div>
            </div>

            {/* Focused Configuration Overlay */}
            {isConfigOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-8 animate-in fade-in duration-300">
                    <div 
                        className="absolute inset-0 bg-background/80 backdrop-blur-md" 
                        onClick={() => setIsConfigOpen(false)} 
                    />
                    <div className="relative w-full h-[95vh] sm:h-auto max-w-5xl glass-card overflow-hidden shadow-2xl border-primary/20 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 rounded-t-3xl sm:rounded-3xl">
                        {/* Modal Header */}
                        <div className="p-5 md:px-10 md:py-8 border-b border-border/40 flex items-center justify-between bg-accent/30">
                            <div className="flex items-center gap-4 md:gap-5">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white p-2 md:p-2.5 shadow-lg border border-border/10 shrink-0">
                                    <SlackLogo className="w-full h-full" />
                                </div>
                                <div className="space-y-0.5 md:space-y-1">
                                    <h2 className="text-xl md:text-2xl font-bold tracking-tight leading-none">Configure Slack</h2>
                                    <p className="text-[10px] md:text-xs font-medium text-muted-foreground line-clamp-1">Control how CrushGoals communicates with your team.</p>
                                </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setIsConfigOpen(false)}
                                className="rounded-full h-8 w-8 md:h-10 md:w-10 p-0 hover:bg-white/10 shrink-0"
                            >
                                <X className="w-4 h-4 md:w-5 md:h-5" />
                            </Button>
                        </div>

                        {/* Configuration Content */}
                        <div className="p-5 md:p-10 h-[calc(95vh-80px)] sm:max-h-[70vh] overflow-y-auto scrollbar-thin">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                                {/* Left Side: Connection & Nudges */}
                                <div className="space-y-8 md:space-y-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-primary">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Hash className="w-4 h-4" />
                                                </div>
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-[11px] md:text-sm">Connection Setup</h3>
                                            </div>
                                            
                                            {/* Dynamic Status Indicator */}
                                            <div className={cn(
                                                "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all duration-300",
                                                !slackWebhookUrl 
                                                    ? "bg-muted text-muted-foreground border-border/40" 
                                                    : isSlackConnected 
                                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                            )}>
                                                {!slackWebhookUrl ? (
                                                    <><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" /> Not connected</>
                                                ) : isSlackConnected ? (
                                                    <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected</>
                                                ) : (
                                                    <><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Invalid URL</>
                                                )}
                                            </div>
                                        </div>

                                        {/* Onboarding Steps */}
                                        <div className="bg-accent/40 border border-border/20 rounded-2xl p-5 md:p-6 space-y-4 shadow-inner">
                                            <h4 className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">How to connect:</h4>
                                            <div className="space-y-3">
                                                {[
                                                    { step: 1, text: "Go to slack.com/apps → Create New App → From Scratch" },
                                                    { step: 2, text: 'Name it "CrushGoals" → Select workspace' },
                                                    { step: 3, text: "In Sidebar → Features → Incoming Webhooks → Toggle ON" },
                                                    { step: 4, text: '"Add New Webhook" → Pick channel → Allow' },
                                                    { step: 5, text: "Copy the Webhook URL and paste it below." }
                                                ].map((s) => (
                                                    <div key={s.step} className="flex gap-3 items-start">
                                                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{s.step}</span>
                                                        <p className="text-[11px] md:text-xs font-medium leading-tight">{s.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pt-2">
                                                <Button 
                                                    variant="link" 
                                                    className="h-auto p-0 text-[11px] md:text-xs font-bold text-primary gap-2 hover:no-underline group"
                                                    onClick={() => window.open('https://api.slack.com/apps', '_blank')}
                                                >
                                                    Go to API Dashboard <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <Label htmlFor="webhook" className="text-[10px] md:text-[11px] font-bold text-muted-foreground/60 uppercase">Incoming Webhook URL</Label>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Input 
                                                    id="webhook"
                                                    type="password"
                                                    value={slackWebhookUrl}
                                                    onChange={(e) => setSlackWebhookUrl(e.target.value)}
                                                    placeholder="https://hooks.slack.com/services/..."
                                                    className={cn(
                                                        "bg-background/80 border-border/40 h-10 md:h-11 focus-visible:ring-primary/20 text-xs md:text-sm transition-all",
                                                        slackWebhookUrl && !slackWebhookUrl.startsWith('https://hooks.slack.com') && "border-amber-500/50"
                                                    )}
                                                />
                                                <Button 
                                                    variant="secondary"
                                                    disabled={isTesting || !slackWebhookUrl}
                                                    onClick={handleTestConnection}
                                                    className="h-10 md:h-11 px-6 text-[10px] md:text-xs font-bold gap-2 whitespace-nowrap"
                                                >
                                                    {isTesting ? "Checking..." : "Send Test"}
                                                    <Send className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-primary">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <AlertCircle className="w-4 h-4" />
                                                </div>
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-[11px] md:text-sm">Stale Heartbeat</h3>
                                            </div>
                                            <span className="text-[9px] md:text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                                                {slackSettings.stale_threshold_days} DAYS
                                            </span>
                                        </div>

                                        <div className="space-y-5 bg-background/40 p-4 md:p-5 rounded-xl md:rounded-2xl border border-border/20">
                                            <Slider 
                                                min={1} 
                                                max={14} 
                                                step={1}
                                                value={[slackSettings.stale_threshold_days]}
                                                onValueChange={([val]) => setSlackSettings({...slackSettings, stale_threshold_days: val})}
                                            />
                                            <div className="flex justify-between text-[7px] md:text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">
                                                <span>Aggressive</span>
                                                <span>Weekly</span>
                                                <span>Patient</span>
                                            </div>
                                            <p className="text-[9px] md:text-[10px] text-muted-foreground italic text-center leading-relaxed">
                                                Nudges will trigger if a goal is inactive for more than {slackSettings.stale_threshold_days} days.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Events */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 text-primary">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Bell className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-[11px] md:text-sm">Active Events</h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 md:gap-3">
                                        {[
                                            { id: 'notify_on_completion', label: 'Goal Wins', desc: 'Broadcast when a goal is crushed.', checked: slackSettings.notify_on_completion },
                                            { id: 'notify_on_blocked', label: 'Blockers', desc: 'Immediate alert when flagged.', checked: slackSettings.notify_on_blocked },
                                            { id: 'notify_on_stale', label: 'Stale Nudges', desc: 'Summary of goals needing attention.', checked: slackSettings.notify_on_stale },
                                            { id: 'notify_on_streaks', label: 'Streaks', desc: 'Celebrate consistency milestones.', checked: slackSettings.notify_on_streaks },
                                        ].map((event) => (
                                            <div 
                                                key={event.id}
                                                className={cn(
                                                    "p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all cursor-pointer flex items-center gap-3 md:gap-4",
                                                    event.checked 
                                                        ? "bg-primary/5 border-primary/20 shadow-sm" 
                                                        : "bg-white/50 border-border/40 opacity-70 hover:opacity-100"
                                                )}
                                                onClick={() => setSlackSettings({...slackSettings, [event.id]: !event.checked} as any)}
                                            >
                                                <Checkbox 
                                                    id={event.id}
                                                    checked={event.checked}
                                                    className="rounded-md h-4 w-4 md:h-5 md:w-5 border-2"
                                                />
                                                <div className="space-y-0.5">
                                                    <Label className="text-[11px] md:text-xs font-bold cursor-pointer leading-tight">{event.label}</Label>
                                                    <p className="text-[9px] md:text-[10px] text-muted-foreground leading-none">{event.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-2 md:pt-4">
                                        <Button 
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="w-full h-11 md:h-12 gradient-primary text-white glow-primary border-0 font-black tracking-widest uppercase text-[10px] md:text-[11px] gap-3"
                                        >
                                            {isSaving ? "Updating Sync..." : "Save Configuration"}
                                            <Save className="w-4 h-4" />
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
