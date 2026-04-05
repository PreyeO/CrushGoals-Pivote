import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Hash, Copy, Zap } from "lucide-react";
import { toast } from "sonner";
import { TelegramLogo } from "@/components/org/IntegrationLogos";
import { Organization } from "@/types";

interface TelegramConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  org: Organization;
  orgId: string;
}

export function TelegramConfigModal({
  isOpen,
  onClose,
  org,
  orgId,
}: TelegramConfigModalProps) {
  const updateOrganization = useStore((state) => state.updateOrganization);

  const [telegramChatId, setTelegramChatId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);

  useEffect(() => {
    if (org && isOpen) {
      setTelegramChatId(org.telegramChatId || "");
    }
  }, [org, isOpen]);

  if (!isOpen) return null;

  const isTelegramConnected = !!telegramChatId;

  const handleSaveTelegram = async () => {
    setIsSaving(true);
    try {
      await updateOrganization(orgId, {
        telegramSettings: {
            notify_on_completion: true,
            notify_on_blocked: true,
            notify_on_stale: true,
            notify_on_streaks: true,
            notify_on_creation: true,
            notify_on_checkin: true,
            stale_threshold_days: 5,
            allow_commands: true,
        },
      });
      toast.success("Telegram settings saved");
      onClose();
    } catch (_error: unknown) {
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
      await fetch("/api/telegram/notify", {
        method: "POST",
        body: JSON.stringify({
          chatId: telegramChatId,
          method: "sendWelcome",
          args: [],
        }),
      });
      toast.success("Test notification sent to your group!");
    } catch (_error: unknown) {
      toast.error("Telegram connection failed");
    } finally {
      setIsTestingTelegram(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-8 animate-in fade-in duration-300">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative w-full h-[95vh] sm:h-auto max-w-2xl glass-card overflow-hidden shadow-2xl border-sky-500/20 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 rounded-t-3xl sm:rounded-3xl">
        <div className="p-5 md:px-10 md:py-8 border-b border-border/40 flex items-center justify-between bg-sky-500/5">
          <div className="flex items-center gap-4">
            <TelegramLogo className="w-10 h-10 md:w-12 md:h-12" />
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                Telegram Configuration
              </h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full h-10 w-10 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 md:p-12 h-[calc(95vh-80px)] sm:max-h-[75vh] overflow-y-auto scrollbar-thin">
          <div className="max-w-2xl mx-auto space-y-10">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-sky-500 flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Connection Steps
                </h3>

                <div className="bg-accent/40 border border-border/20 rounded-2xl p-6 md:p-8 space-y-4 shadow-inner">
                  {[
                    "Search for @CrushGoals_Bot in Telegram. Go to Bot Settings, click Add to Group, and select your group. Add bot as an Admin.",
                    "Copy the unique connection command shown below.",
                    "Paste and send the command in your Telegram group chat.",
                    "Once the bot replies \"Group Connected!\", you're ready.",
                    "Click Complete Integration at the bottom to finish!",
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4 items-start border-b border-border/5 pb-3 last:border-0 last:pb-0">
                      <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-500 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-[13px] font-medium leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}

                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Copy className="w-3 h-3" /> Connection Command
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-center">
                       <div className="flex-1 px-4 py-3 bg-background rounded-xl border border-sky-500/30 text-sky-500 font-mono font-bold tracking-tight text-sm shadow-inner select-all truncate">
                          /connect {org.connectCode || "ABC123"}
                        </div>
                        <Button
                          variant="secondary"
                          className="h-11 px-4 font-bold gap-2 whitespace-nowrap"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `/connect ${org.connectCode || "ABC123"}`,
                            );
                            toast.success("Command copied!");
                          }}
                        >
                          <Copy className="w-4 h-4" /> Copy
                        </Button>
                    </div>
                  </div>
                </div>


              </div>

              <div className="space-y-4 pt-4 border-t border-border/10">
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full h-12 font-bold gap-2 rounded-xl"
                    onClick={handleTestTelegram}
                    disabled={!telegramChatId || isTestingTelegram}
                  >
                    {isTestingTelegram ? "Sending..." : "Send Test Message"}
                    <Zap className="w-4 h-4" />
                  </Button>
                  <p className="text-[11px] text-center text-muted-foreground italic">
                    Ensures your Telegram group is receiving alerts correctly.
                  </p>
                </div>

                <Button
                  onClick={handleSaveTelegram}
                  disabled={isSaving}
                  className="w-full h-14 bg-sky-500 hover:bg-sky-600 text-white border-0 font-black tracking-widest uppercase text-[12px] shadow-lg shadow-sky-500/20 rounded-2xl"
                >
                  {isSaving ? "Saving Configuration..." : "Complete Telegram Integration"}
                </Button>
                {isTelegramConnected && (
                    <button 
                        onClick={() => {
                            if (confirm("Are you sure you want to disconnect Telegram?")) {
                                setTelegramChatId("");
                                updateOrganization(orgId, { telegramChatId: "", telegramChatTitle: "" });
                            }
                        }}
                        className="w-full text-center text-[10px] text-muted-foreground/40 hover:text-red-500/60 font-bold uppercase tracking-widest transition-colors mt-2"
                    >
                        Disconnect Connection
                    </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
