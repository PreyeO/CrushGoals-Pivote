import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { X, Hash, AlertCircle, Bell } from "lucide-react";
import { slackService } from "@/lib/services/slack";
import { toast } from "sonner";
import { SlackLogo } from "@/components/org/IntegrationLogos";
import type { Organization } from "@/types";

interface SlackConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  org: Organization;
  orgId: string;
}

const SLACK_EVENTS = [
  { id: "notify_on_creation", label: "New Goals" },
  { id: "notify_on_checkin", label: "Daily Check-ins" },
  { id: "notify_on_completion", label: "Goal Wins" },
  { id: "notify_on_blocked", label: "Blockers" },
  { id: "notify_on_stale", label: "Stale Nudges" },
  { id: "notify_on_streaks", label: "Streaks" },
] as const;

export function SlackConfigModal({
  isOpen,
  onClose,
  org,
  orgId,
}: SlackConfigModalProps) {
  const updateOrganization = useStore((state) => state.updateOrganization);

  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [slackSettings, setSlackSettings] = useState({
    notify_on_completion: true,
    notify_on_blocked: true,
    notify_on_stale: true,
    notify_on_streaks: true,
    notify_on_creation: true,
    notify_on_checkin: true,
    stale_threshold_days: 5,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isTestingSlack, setIsTestingSlack] = useState(false);

  useEffect(() => {
    if (org && isOpen) {
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
    }
  }, [org, isOpen]);

  if (!isOpen) return null;

  const handleSaveSlack = async () => {
    setIsSaving(true);
    try {
      await updateOrganization(orgId, {
        slackWebhookUrl,
        slackSettings,
      });
      toast.success("Slack integration updated");
      onClose();
    } catch (_error: unknown) {
      toast.error("Failed to save Slack settings");
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
    } catch (_error: unknown) {
      toast.error("Slack connection failed");
    } finally {
      setIsTestingSlack(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-8 animate-in fade-in duration-300">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative w-full h-[95vh] sm:h-auto max-w-5xl glass-card overflow-hidden shadow-2xl border-primary/20 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 rounded-t-3xl sm:rounded-3xl">
        <div className="p-5 md:px-10 md:py-8 border-b border-border/40 flex items-center justify-between bg-accent/30">
          <div className="flex items-center gap-4">
            <SlackLogo className="w-10 h-10 md:w-12 md:h-12" />
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Configure Slack
            </h2>
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

        <div className="p-5 md:p-10 h-[calc(95vh-80px)] sm:max-h-[70vh] overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Connection
                </h3>
                <div className="bg-accent/40 border border-border/20 rounded-2xl p-6 space-y-4 shadow-inner">
                  {[
                    "Go to api.slack.com/apps and sign in to your Slack workspace.",
                    "Once signed in, go back to api.slack.com/apps",
                    "Click 'Create New App', choose 'From scratch', name it CrushGoals, and pick your workspace.",
                    "Click 'Incoming Webhooks' on the left menu and toggle it On.",
                    "Scroll down, click 'Add New Webhook to Workspace', and pick a channel.",
                    "Copy the Webhook URL Slack generates for you.",
                    "Paste the URL below, click Test, and then hit Save Configuration!",
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-xs font-medium">{step}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 pt-2">
                  <Label className="text-[10px] font-bold uppercase">
                    Webhook URL
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={slackWebhookUrl}
                      onChange={(e) => setSlackWebhookUrl(e.target.value)}
                      className="h-11 border-border/40"
                    />
                    <Button
                      variant="secondary"
                      onClick={handleTestSlack}
                      disabled={isTestingSlack}
                      className="px-6 h-11 font-bold"
                    >
                      {isTestingSlack ? "..." : "Test"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Stale Threshold
                </h3>
                <div className="bg-background/40 p-5 rounded-2xl border border-border/20 space-y-4">
                  <Slider
                    min={1}
                    max={14}
                    step={1}
                    value={[slackSettings.stale_threshold_days]}
                    onValueChange={([v]) =>
                      setSlackSettings({
                        ...slackSettings,
                        stale_threshold_days: v,
                      })
                    }
                  />
                  <p className="text-[10px] text-center text-muted-foreground italic">
                    Nudge after {slackSettings.stale_threshold_days} days.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Bell className="w-4 h-4" /> Events
              </h3>
              <div className="space-y-3">
                {SLACK_EVENTS.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-2xl border bg-white/50 border-border/40 flex items-center gap-4 cursor-pointer"
                    onClick={() =>
                      setSlackSettings((prev) => ({
                        ...prev,
                        [event.id]: !prev[event.id],
                      }))
                    }
                  >
                    <Checkbox
                      checked={slackSettings[event.id]}
                      className="h-5 w-5"
                    />
                    <Label className="text-xs font-bold whitespace-nowrap cursor-pointer">
                      {event.label}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="pt-4">
                <Button
                  onClick={handleSaveSlack}
                  disabled={isSaving}
                  className="w-full h-12 gradient-primary text-white glow-primary border-0 font-black tracking-widest uppercase text-[11px]"
                >
                  Save Slack Configuration
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
