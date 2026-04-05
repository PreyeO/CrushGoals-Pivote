import { OrgGoal, OrgMember } from "@/types";
import { WeeklySummary } from "./reportService";

export const slackService = {
  async sendMessage(webhookUrl: string, blocks: Record<string, any>[]) {
    try {
      const isServer = typeof window === 'undefined';
      
      const targetUrl = isServer ? webhookUrl : '/api/slack';
      const body = isServer ? JSON.stringify({ blocks }) : JSON.stringify({ webhookUrl, blocks });

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Slack API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send Slack message:', error);
      throw error;
    }
  },

  async sendWelcome(webhookUrl: string) {
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "👋 CrushGoals is connected!"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "You'll now get notified when goals are crushed 🎯, blocked 🚨, or need a momentum boost ⚡."
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "Powered by <https://crushgoals.app|CrushGoals>"
          }
        ]
      }
    ];
    return this.sendMessage(webhookUrl, blocks);
  },

  async sendGoalCompletion(webhookUrl: string, memberName: string, goal: OrgGoal, streakCount?: number) {
    const streakText = streakCount && streakCount >= 3 
      ? `\n\n🔥 ${memberName} is on a ${streakCount}-goal streak!` 
      : "";

    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🏆 MISSION ACCOMPLISHED!\n\n${memberName} just crushed "${goal.title}". This is how we win! 🔥${streakText}`
        }
      },
      {
        type: "divider"
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "Powered by <https://crushgoals.app|CrushGoals>"
          }
        ]
      }
    ];
    return this.sendMessage(webhookUrl, blocks);
  },

  async sendGoalBlocked(webhookUrl: string, memberName: string, goal: OrgGoal, reason: string, taggedNames?: string[]) {
    const attentionText = taggedNames && taggedNames.length > 0 
      ? `\n\n📌 *Attention ${taggedNames.map(name => `@${name}`).join(', ')}*: Can you jump in and help resolve this? 🤝`
      : "\n\nSomeone jump in and help resolve this! 🤝";

    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🚨 Goal Blocked",
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `⚠️ ATTENTION TEAM\n\n${memberName} is facing a challenge with "${goal.title}". Let's help out! 🔥`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `> Reason: ${reason}`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: attentionText
          }
        ]
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "Powered by <https://crushgoals.app|CrushGoals>"
          }
        ]
      }
    ];
    return this.sendMessage(webhookUrl, blocks);
  },

  async sendNewGoalNotification(webhookUrl: string, goal: OrgGoal, memberNames: string[]) {
    const names = memberNames.length > 0 ? memberNames.join(", ") : "Team";
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🎯 NEW OBJECTIVE\n\n"${goal.title}" has been set for ${names}. Let's get after it! 🚀`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "Powered by <https://crushgoals.app|CrushGoals>"
          }
        ]
      }
    ];
    return this.sendMessage(webhookUrl, blocks);
  },

  async sendCheckInNotification(webhookUrl: string, memberName: string, goalTitle: string, note?: string, taggedNames?: string[]) {
    const noteText = note ? `\n\nNote: ${note}` : "";
    const shoutOutText = taggedNames && taggedNames.length > 0
      ? `\n\n🙌 Shout out to ${taggedNames.map(name => `@${name}`).join(', ')} for the support! 🚀`
      : "";

    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🚀 ${memberName} is making moves!\n\nProgress updated for "${goalTitle}". Keep the momentum going! 🔥${noteText}${shoutOutText}`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "Powered by <https://crushgoals.app|CrushGoals>"
          }
        ]
      }
    ];
    return this.sendMessage(webhookUrl, blocks);
  },

  async sendStaleNudge(webhookUrl: string, staleGoals: { title: string, memberName: string, days: number }[]) {
    if (staleGoals.length === 0) return;

    const blocks: Record<string, any>[] = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "⏰ Momentum Check",
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "The following goals haven't had an update in a while. A quick check-in keeps the momentum alive!"
        }
      },
      {
        type: "divider"
      }
    ];

    staleGoals.forEach(g => {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🎯 ${g.title}\n  Assigned to ${g.memberName} — ${g.days} days since last update`
        }
      });
    });

    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "Powered by <https://crushgoals.app|CrushGoals>"
        }
      ]
    });

    return this.sendMessage(webhookUrl, blocks);
  },

  async sendWeeklySummary(webhookUrl: string, summary: WeeklySummary) {
    const blocks: Record<string, any>[] = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🚀 Time to Crush the Week!",
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Good morning! ☀️ Last week was massive, and we're ready to win again. Here's your performance overview:`
        }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*✅ Crushed:* ${summary.crushedCount}` },
          { type: "mrkdwn", text: `*🏗️ Active:* ${summary.activeCount}` },
          { type: "mrkdwn", text: `*🚨 Blocked:* ${summary.blockedCount}` },
          { type: "mrkdwn", text: `*📈 Avg. Progress:* ${summary.avgProgress}%` }
        ]
      }
    ];

    if (summary.topPerformers.length > 0) {
      blocks.push({ type: "divider" });
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*🔥 Top Performers*\n" + summary.topPerformers.map(p => `• *${p.name}* crushed ${p.completed} ${p.completed === 1 ? 'goal' : 'goals'}!`).join("\n")
        }
      });
    }

    if (summary.blockedCount > 0) {
      blocks.push({ type: "divider" });
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*🚨 Top Blockers*\n${summary.blockedReasons.map(r => `• ${r}`).join("\n")}\n_Someone jump in and help resolve these!_ 🤝`
        }
      });
    }

    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "Powered by <https://crushgoals.app|CrushGoals>"
        }
      ]
    });

    return this.sendMessage(webhookUrl, blocks);
  },

  async sendDailyGingering(webhookUrl: string) {
    const messages = [
      "Rise and shine! ☀️ Another day to crush your goals and move the needle. Let's get after it! 🚀",
      "Focus determines reality. 🎯 What's the one thing you're crushing today?",
      "Consistency is the secret sauce. 🔥 Keep that momentum high, team!",
      "New day, new opportunities to win. Let's make every move count! ⚡",
      "Small wins lead to massive victories. 🏆 Brick by brick, goal by goal."
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `⚡ *DAILY GINGERING*\n\n${randomMessage}`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "Ready for another day of crushing it? Check your dashboard at <https://crushgoals.app|crushgoals.app>"
          }
        ]
      }
    ];
    return this.sendMessage(webhookUrl, blocks);
  }
};
