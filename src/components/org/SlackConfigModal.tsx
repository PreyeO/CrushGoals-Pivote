import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Hash, Bell } from "lucide-react";
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

export function SlackConfigModal({
  isOpen,
  onClose,
  org,
  orgId,
}: SlackConfigModalProps) {
  const updateOrganization = useStore((state) => state.updateOrganization);

  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingSlack, setIsTestingSlack] = useState(false);

  useEffect(() => {
    if (org && isOpen) {
      setSlackWebhookUrl(org.slackWebhookUrl || "");
    }
  }, [org, isOpen]);

  if (!isOpen) return null;

  const handleSaveSlack = async () => {
    setIsSaving(true);
    try {
      await updateOrganization(orgId, {
        slackWebhookUrl,
        slackSettings: {
            notify_on_completion: true,
            notify_on_blocked: true,
            notify_on_stale: true,
            notify_on_streaks: true,
            notify_on_creation: true,
            notify_on_checkin: true,
            stale_threshold_days: 5,
        },
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
      <div className="relative w-full h-[95vh] sm:h-auto max-w-2xl glass-card overflow-hidden shadow-2xl border-primary/20 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 rounded-t-3xl sm:rounded-3xl">
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

        <div className="p-6 md:p-12 h-[calc(95vh-80px)] sm:max-h-[75vh] overflow-y-auto scrollbar-thin">
          <div className="max-w-2xl mx-auto space-y-10">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Connection Guide
                </h3>
                <div className="bg-accent/40 border border-border/20 rounded-2xl p-6 md:p-8 space-y-4 shadow-inner">
                  {[
                    "Go to api.slack.com/apps and sign in to your Slack workspace.",
                    "Once signed in, go back to api.slack.com/apps",
                    "Click 'Create New App', choose 'From scratch', name it CrushGoals, and pick your workspace.",
                    "Click 'Incoming Webhooks' on the left menu and toggle it On.",
                    "Scroll down, click 'Add New Webhook to Workspace', and pick a channel.",
                    "Copy the Webhook URL Slack generates for you.",
                    "Paste the URL below, click Test, and then hit Save Configuration!",
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4 items-start border-b border-border/5 pb-3 last:border-0 last:pb-0">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-[11px] font-black flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-[13px] font-medium leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Webhook URL
                  </Label>
                  <span className="text-[10px] text-muted-foreground/60 italic">Connections are encrypted & secure</span>
                </div>
                <div className="flex gap-3">
                  <Input
                    type="password"
                    placeholder="https://hooks.slack.com/services/..."
                    value={slackWebhookUrl}
                    onChange={(e) => setSlackWebhookUrl(e.target.value)}
                    className="h-12 border-border/40 bg-background/50 focus:ring-primary/20"
                  />
                  <Button
                    variant="secondary"
                    onClick={handleTestSlack}
                    disabled={isTestingSlack}
                    className="px-8 h-12 font-bold"
                  >
                    {isTestingSlack ? "Testing..." : "Test"}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground text-center">
                  Not seeing messages? Ensure the Webhook URL is copied correctly from your Slack App dashboard.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-border/10">
              <Button
                onClick={handleSaveSlack}
                disabled={isSaving}
                className="w-full h-14 gradient-primary text-white glow-primary border-0 font-black tracking-widest uppercase text-[12px] rounded-2xl"
              >
                {isSaving ? "Saving Configuration..." : "Complete Slack Integration"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
