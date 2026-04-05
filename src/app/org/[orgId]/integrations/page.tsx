"use client";

import { use, useState } from "react";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search, Puzzle, Bot } from "lucide-react";

import { useShallow } from "zustand/react/shallow";
import {
  SlackLogo,
  TelegramLogo,
  WhatsAppLogo,
} from "@/components/org/IntegrationLogos";
import { SlackConfigModal } from "@/components/org/SlackConfigModal";
import { TelegramConfigModal } from "@/components/org/TelegramConfigModal";
import { IntegrationCard } from "@/components/org/IntegrationCard";

export default function IntegrationsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = use(params);
  const [searchQuery, setSearchQuery] = useState("");

  const org = useStore(
    useShallow((state) => state.organizations.find((o) => o.id === orgId)),
  );

  const [isSlackConfigOpen, setIsSlackConfigOpen] = useState(false);
  const [isTelegramConfigOpen, setIsTelegramConfigOpen] = useState(false);

  if (!org) return <div className="p-8 flex items-center justify-center min-h-[50vh] animate-pulse text-muted-foreground">Loading Integrations...</div>;

  const isSlackConnected = !!org.slackWebhookUrl;
  const isTelegramConnected = !!org.telegramChatId;

  const integrations = [
    {
      id: "slack",
      name: "Slack",
      description: "Win celebrations and blocker alerts for your team channel.",
      icon: <SlackLogo />,
      isConnected: isSlackConnected,
      onClick: () => setIsSlackConfigOpen(true),
    },
    {
      id: "telegram",
      name: "Telegram",
      description: "Interactive goal management via groups and direct messages.",
      icon: <TelegramLogo className="w-full h-full" />,
      isConnected: isTelegramConnected,
      statusLabel: "Active",
      actionLabel: "Manage Bot",
      ActionIcon: Bot,
      onClick: () => setIsTelegramConfigOpen(true),
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      description: "Personal accountability nudges via WhatsApp Business.",
      icon: <WhatsAppLogo className="w-12 h-12 opacity-40 group-hover:opacity-100 transition-opacity" />,
      isConnected: false,
      comingSoon: true,
      disabled: true,
      onClick: () => {},
    },
  ];

  const filteredIntegrations = integrations.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const globalFeatures = [
    { icon: "🚀", title: "New Goal Announcements", desc: "Instantly notify the team when new objectives are set." },
    { icon: "🔥", title: "Daily Progress Check-ins", desc: "Summarize what was achieved and what's next." },
    { icon: "🏆", title: "Mission Accomplished Wins", desc: "Celebrations for the whole team when goals reach 100%." },
    { icon: "🚨", title: "Blocker Alerts & Mentions", desc: "Instant visibility when someone is stuck or tagged." },
    { icon: "📊", title: "Weekly Victory Summaries", desc: "A high-level report of the team's wins every Monday 7:30am." },
    { icon: "⏰", title: "5-Day Momentum Nudges", desc: "Automatic reminders for goals that haven't moved." },
  ];

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
            {`Connect CrushGoals to your team's existing workflow to automate
            accountability and celebrate wins together.`}
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
        {filteredIntegrations.map((integration) => (
          <IntegrationCard key={integration.id} {...integration} />
        ))}
      </div>

      <div className="pt-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                  <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" /> Automated Team Suite
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                      These automation services are activated instantly once you connect a channel.
                  </p>
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {globalFeatures.map((f, i) => (
                  <div key={i} className="glass-card p-4 flex gap-4 transition-all hover:border-primary/30">
                      <span className="text-2xl shrink-0">{f.icon}</span>
                      <div className="space-y-1">
                          <h4 className="text-[13px] font-bold">{f.title}</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                              {f.desc}
                          </p>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* Slack Configuration Overlay */}
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
