import { OrgGoal } from "@/types";
import { WeeklySummary } from "./reportService";

// Use standard server-side token for security


export const telegramService = {
  escapeMarkdown(text: string) {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
  },

  async sendMessage(chatId: string, text: string, replyMarkup?: Record<string, any>, options: { parseMode?: 'MarkdownV2' | 'HTML' | null } = { parseMode: 'MarkdownV2' }): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.error('No Telegram Bot Token found!');
        return;
    }
    try {
      const body: Record<string, any> = {
        chat_id: chatId,
        text: options.parseMode === 'MarkdownV2' ? this.escapeMarkdown(text) : text,
      };

      if (options.parseMode) body.parse_mode = options.parseMode;
      if (replyMarkup) body.reply_markup = replyMarkup;

      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Telegram API error:', JSON.stringify(errorData));
        // Fallback: try sending as plain text if Markdown fails
        if (options.parseMode === 'MarkdownV2') {
          return this.sendMessage(chatId, text, replyMarkup, { parseMode: null });
        }
      }
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
    }
  },

  async sendNotification(
    chatId: string, 
    type: 'win' | 'sos' | 'boost' | 'summary', 
    data: { 
      userName?: string; 
      goalTitle?: string; 
      reason?: string; 
      days?: number; 
      goalId?: string; 
      summary?: string; 
    }
  ) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!chatId || !token) return;

    switch (type) {
      case 'win':
        return this.sendMessage(chatId, `🎉 *GOAL CRUSHED\\!* \n\n*${data.userName}* just finished: \n_"${data.goalTitle}"_ \n\nKeep the momentum going\\! 🚀`, {
          inline_keyboard: [[{ text: "View Dashboard 🎯", url: "https://crushgoals.app" }]]
        });
      case 'sos':
        return this.sendMessage(chatId, `🚨 *BLOCKED ALERT\\!* \n\n*${data.userName}* is stuck on: \n_"${data.goalTitle}"_ \n\nReason: ${this.escapeMarkdown(data.reason || 'Not specified')}\n\nCan anyone jump in to help? 🤝`, {
          inline_keyboard: [[{ text: "Help Crush It 🤝", url: "https://crushgoals.app" }]]
        });
      case 'boost':
        const text = `⚡ *MOMENTUM BOOST* ⚡ \n\nGoal: *${data.goalTitle}* \nLast update: *${data.days} days ago* \n\nIs this still on track?`;
        return this.sendMessage(chatId, text, {
          inline_keyboard: [
            [
              { text: "🎯 Crushed It!", callback_data: `crush:${data.goalId}` },
              { text: "🚨 Stays Blocked", callback_data: `block:${data.goalId}` }
            ]
          ]
        });
      case 'summary':
        return this.sendMessage(chatId, `📊 *Weekly Victory Summary* \n\n${data.summary}\n\nCheck the full dashboard for details\\!`);
    }
  },

  async setWebhook(url: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      return await response.json();
    } catch (error) {
      console.error('Telegram setWebhook error:', error);
      throw error;
    }
  },

  async setCommands() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commands: [
            { command: 'goals', description: 'Show all team goals' },
            { command: 'leaderboard', description: 'Who\'s crushing it?' },
            { command: 'help', description: 'Show the command guide' }
          ]
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Telegram setMyCommands error:', error);
      throw error;
    }
  },

  async sendWelcome(chatId: string) {
    const text = `👋 *CrushGoals is connected\\!* \n\nYou'll now get notified when goals are *crushed* 🎯, *blocked* 🚨, or need a *momentum boost* ⚡\\.\n\nType /goals to see all active goals\\.`;
    return this.sendMessage(chatId, text);
  },

  async sendGoalCompletion(chatId: string, memberName: string, goal: OrgGoal, streakCount?: number) {
    const streakText = streakCount && streakCount >= 3 
      ? `\n\n🔥 ${memberName} is on a ${streakCount}-goal streak!` 
      : "";
    const text = `🏆 MISSION ACCOMPLISHED!\n\n${memberName} just crushed "${goal.title}". This is how we win!${streakText}`;
    return this.sendMessage(chatId, text);
  },

  async sendGoalBlocked(chatId: string, memberName: string, goal: OrgGoal, reason: string) {
    const text = `⚠️ ATTENTION TEAM\n\n${memberName} is facing a challenge with "${goal.title}". Let's jump in and help solve this! 🤝\n\nReason: ${this.escapeMarkdown(reason)}`;
    return this.sendMessage(chatId, text);
  },

  async sendNewGoalNotification(chatId: string, goal: OrgGoal, memberNames: string[]) {
    const names = memberNames.length > 0 ? memberNames.join(", ") : "Team";
    const text = `🎯 NEW OBJECTIVE\n\n"${goal.title}" has been set for ${names}. Let's get after it! 🚀`;
    return this.sendMessage(chatId, text);
  },

  async sendCheckInNotification(chatId: string, memberName: string, goalTitle: string, note?: string) {
    const noteText = note ? `\n\nNote: ${this.escapeMarkdown(note)}` : "";
    const text = `🚀 ${memberName} is making moves!\n\nProgress updated for "${goalTitle}". Keep the momentum going! 🔥${noteText}`;
    return this.sendMessage(chatId, text);
  },

  async sendStaleNudge(chatId: string, staleGoals: { title: string, memberName: string, days: number }[]) {
    if (staleGoals.length === 0) return;
    let text = `⏰ *Momentum Check* \n\nThe following goals haven't had an update in a while:\n\n`;
    staleGoals.forEach(g => {
      text += `🎯 *${g.title}*\nAssigned to *${g.memberName}* — ${g.days} days ago\n\n`;
    });
    return this.sendMessage(chatId, text);
  },

  async sendWeeklySummary(chatId: string, summary: WeeklySummary) {
    let text = `🚀 *Weekly Victory Summary*\n\n`;
    text += `Last week was massive\\! Performance overview:\n\n`;
    text += `✅ *Crushed:* ${summary.crushedCount}\n`;
    text += `🏗️ *Active:* ${summary.activeCount}\n`;
    text += `🚨 *Blocked:* ${summary.blockedCount}\n`;
    text += `📈 *Avg\\. Progress:* ${summary.avgProgress}%\n\n`;
    
    if (summary.topPerformers.length > 0) {
      text += `🔥 *Top Performers*\n`;
      summary.topPerformers.forEach(p => {
        text += `• *${this.escapeMarkdown(p.name)}* crushed ${p.completed} ${p.completed === 1 ? 'goal' : 'goals'}\\!\n`;
      });
      text += `\n`;
    }
    
    if (summary.blockedCount > 0) {
      text += `🚨 *Top Blockers*\n`;
      summary.blockedReasons.forEach(r => {
        text += `• ${this.escapeMarkdown(r)}\n`;
      });
      text += `_Someone jump in and help\\!_ 🤝\n`;
    }
    
    return this.sendMessage(chatId, text, {
      inline_keyboard: [[{ text: "View Dashboard 🎯", url: "https://crushgoals.app" }]]
    });
  },

  async sendDailyGingering(chatId: string) {
    const messages = [
      "Rise and shine\\! ☀️ Another day to crush your goals and move the needle\\. Let's get after it\\! 🚀",
      "Focus determines reality\\. 🎯 What's the one thing you're crushing today?",
      "Consistency is the secret sauce\\. 🔥 Keep that momentum high, team\\!",
      "New day, new opportunities to win\\. Let's make every move count\\! ⚡",
      "Small wins lead to massive victories\\. 🏆 Brick by brick, goal by goal\\."
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const text = `⚡ *DAILY GINGERING*\n\n${randomMessage}\n\nCheck your dashboard: https://crushgoals.app`;
    return this.sendMessage(chatId, text);
  }
};
