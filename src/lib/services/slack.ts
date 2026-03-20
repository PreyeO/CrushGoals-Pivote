import { OrgGoal, OrgMember } from "@/types";

export const slackService = {
  async sendMessage(webhookUrl: string, blocks: any[]) {
    try {
      const response = await fetch('/api/slack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookUrl, blocks }),
      });

      if (!response.ok) {
        const errorData = await response.json();
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

  async sendGoalCompletion(webhookUrl: string, memberName: string, goal: any, streakCount?: number) {
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

  async sendGoalBlocked(webhookUrl: string, memberName: string, goal: any, reason: string) {
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
          text: `⚠️ ATTENTION TEAM\n\n${memberName} is facing a challenge with "${goal.title}". Let's jump in and help solve this! 🤝`
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
            text: "Someone jump in and help resolve this! 🤝"
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

  async sendNewGoalNotification(webhookUrl: string, goal: any, memberNames: string[]) {
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

  async sendCheckInNotification(webhookUrl: string, memberName: string, goalTitle: string, note?: string) {
    const noteText = note ? `\n\nNote: ${note}` : "";
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🚀 ${memberName} is making moves!\n\nProgress updated for "${goalTitle}". Keep the momentum going! 🔥${noteText}`
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

    const blocks: any[] = [
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

  async sendWeeklySummary(webhookUrl: string, crushedCount: number, inProgressCount: number, blockedCount: number) {
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🚀 Team Crush Summary",
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Last week's performance overview:"
        }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `✅ Crushed: ${crushedCount}` },
          { type: "mrkdwn", text: `🏗️ Active: ${inProgressCount}` },
          { type: "mrkdwn", text: `🚨 Blocked: ${blockedCount}` }
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
  }
};
