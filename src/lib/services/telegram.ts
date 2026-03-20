import { OrgGoal } from "@/types";

// Use standard server-side token for security


export const telegramService = {
  escapeMarkdown(text: string) {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
  },

  async sendMessage(chatId: string, text: string, replyMarkup?: any, options: { parseMode?: 'MarkdownV2' | 'HTML' | null } = { parseMode: 'MarkdownV2' }): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.error('No Telegram Bot Token found!');
        return;
    }
    try {
      const body: any = {
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

  async sendNotification(chatId: string, type: 'win' | 'sos' | 'boost' | 'summary', data: any) {
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

  async sendWelcome(chatId: string) {
    const text = `👋 *CrushGoals is connected\\!* \n\nYou'll now get notified when goals are *crushed* 🎯, *blocked* 🚨, or need a *momentum boost* ⚡\\.\n\nType /goals to see all active goals\\.`;
    return this.sendMessage(chatId, text);
  },

  async sendGoalCompletion(chatId: string, memberName: string, goal: any, streakCount?: number) {
    const streakText = streakCount && streakCount >= 3 
      ? `\n🔥 *${memberName} is on a ${streakCount}\\-goal streak\\!*` 
      : "";
    const text = `🎉 *YAAY\\! ${memberName}* just CRUSHED *'${goal.title}'*\\! 🎯${streakText}`;
    return this.sendMessage(chatId, text);
  },

  async sendGoalBlocked(chatId: string, memberName: string, goal: any, reason: string) {
    const text = `🚨 *GOAL BLOCKED* 🚨\n\n👤 *${memberName}* just flagged *'${goal.title}'* as blocked\\.\n\n> *Reason:* ${this.escapeMarkdown(reason)}\n\nSomeone jump in and help\\! 🤝`;
    return this.sendMessage(chatId, text);
  },

  async sendNewGoalNotification(chatId: string, goal: any, memberNames: string[]) {
    const names = memberNames.length > 0 ? memberNames.join(", ") : "Team";
    const text = `🆕 *NEW GOAL CREATED\\!* \n\n🎯 *${goal.title}* \n👤 Assigned to: *${names}*\n\nLet's get after it\\! 🚀`;
    return this.sendMessage(chatId, text);
  },

  async sendCheckInNotification(chatId: string, memberName: string, goalTitle: string, note?: string) {
    const noteText = note ? `\n\n> *Note:* ${this.escapeMarkdown(note)}` : "";
    const text = `⚡ *${memberName}* just checked in for: \n*'${goalTitle}'*${noteText} \n\nKeep it up\\! 🔥`;
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

  async sendWeeklySummary(chatId: string, crushedCount: number, inProgressCount: number, blockedCount: number) {
    const text = `🚀 *Weekly Summary*\n\n✅ *Crushed:* ${crushedCount}\n🏗️ *Active:* ${inProgressCount}\n🚨 *Blocked:* ${blockedCount}`;
    return this.sendMessage(chatId, text);
  }
};
