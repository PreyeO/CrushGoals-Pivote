import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { X, Hash, AlertCircle, Bell, Copy, Zap } from "lucide-react";
import { toast } from "sonner";
import { TelegramLogo } from "@/components/org/IntegrationLogos";

interface TelegramConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    org: any;
    orgId: string;
}

export function TelegramConfigModal({ isOpen, onClose, org, orgId }: TelegramConfigModalProps) {
    const updateOrganization = useStore((state) => state.updateOrganization);
    
    const [telegramChatId, setTelegramChatId] = useState("");
    const [telegramSettings, setTelegramSettings] = useState({
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
    const [isTestingTelegram, setIsTestingTelegram] = useState(false);

    useEffect(() => {
        if (org && isOpen) {
            setTelegramChatId(org.telegramChatId || "");
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
        }
    }, [org, isOpen]);

    if (!isOpen) return null;

    const isTelegramConnected = !!telegramChatId;

    const handleSaveTelegram = async () => {
        setIsSaving(true);
        try {
            await updateOrganization(orgId, {
                telegramChatId,
                telegramSettings
            });
            toast.success("Telegram settings saved");
            onClose();
        } catch (error) {
            toast.error("Failed to save Telegram settings");
        } finally {
            setIsSaving(false);
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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-8 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full h-[95vh] sm:h-auto max-w-5xl glass-card overflow-hidden shadow-2xl border-sky-500/20 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 rounded-t-3xl sm:rounded-3xl">
                <div className="p-5 md:px-10 md:py-8 border-b border-border/40 flex items-center justify-between bg-sky-500/5">
                    <div className="flex items-center gap-4">
                        <TelegramLogo className="w-10 h-10 md:w-12 md:h-12" />
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Telegram Notifications</h2>
                            <p className="text-[12px] text-muted-foreground mt-1 hidden sm:block">Get goal updates delivered straight to your Telegram group.</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-10 w-10 p-0"><X className="w-5 h-5" /></Button>
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
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-sky-500 flex items-center gap-2"><Bell className="w-4 h-4" /> Events</h3>
                                <p className="text-[11px] font-medium text-muted-foreground">What should we notify your Telegram group about?</p>
                                
                                <div className="space-y-3">
                                    {[
                                        { id: 'notify_on_creation', label: 'New Goals' },
                                        { id: 'notify_on_checkin', label: 'Daily Check-ins' },
                                        { id: 'notify_on_completion', label: 'Goal Wins' },
                                        { id: 'notify_on_blocked', label: 'Blockers' },
                                        { id: 'notify_on_stale', label: 'Stale Nudges' },
                                        { id: 'notify_on_streaks', label: 'Streaks' },
                                    ].map((event) => (
                                        <div 
                                            key={event.id} 
                                            className="p-4 rounded-2xl border bg-white/50 border-border/40 flex items-center gap-4 cursor-pointer transition-colors hover:bg-muted/50" 
                                            onClick={() => setTelegramSettings({...telegramSettings, [event.id]: !(telegramSettings as any)[event.id]} as any)}
                                        >
                                            <Checkbox 
                                                checked={(telegramSettings as any)[event.id]} 
                                                className="h-5 w-5 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500" 
                                            />
                                            <Label className="text-xs font-bold whitespace-nowrap cursor-pointer">{event.label}</Label>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-4 border-t border-border/40">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-sky-500 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Stale Threshold</h3>
                                    <div className="bg-background/40 p-5 rounded-2xl border border-border/20 space-y-4">
                                        <Slider min={1} max={14} step={1} value={[telegramSettings.stale_threshold_days]} onValueChange={([v]) => setTelegramSettings({...telegramSettings, stale_threshold_days: v})} />
                                        <p className="text-[10px] text-center text-muted-foreground italic">Nudge after {telegramSettings.stale_threshold_days} days.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border/40">
                                <div className="flex flex-col gap-2">
                                    <Button 
                                        variant="outline" 
                                        className="w-full h-11 font-bold gap-2"
                                        onClick={handleTestTelegram}
                                        disabled={!telegramChatId || isTestingTelegram}
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
    );
}
