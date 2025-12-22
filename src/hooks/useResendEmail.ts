import { supabase } from "@/integrations/supabase/client";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export function useResendEmail() {
  const sendEmail = async (params: SendEmailParams): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke("send-email-resend", {
        body: params,
      });

      if (error) {
        console.error("Error sending email:", error);
        return false;
      }

      console.log("Email sent successfully:", data);
      return true;
    } catch (error) {
      console.error("Error invoking email function:", error);
      return false;
    }
  };

  const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0b; color: #ffffff; margin: 0; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1f 0%, #0d0d10 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="font-size: 48px; margin-bottom: 16px;">🏆</div>
              <h1 style="margin: 0; font-size: 28px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Welcome to CrushGoals!</h1>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
              Hey ${name}! 👋
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
              You've just joined thousands of goal-crushers who are turning their dreams into reality, one task at a time.
            </p>
            
            <div style="background: rgba(99, 102, 241, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid rgba(99, 102, 241, 0.2);">
              <h3 style="margin: 0 0 12px 0; color: #6366f1;">Here's what you can do:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #a1a1aa;">
                <li style="margin-bottom: 8px;">🎯 Set meaningful goals with smart breakdowns</li>
                <li style="margin-bottom: 8px;">🔥 Build streaks to stay consistent</li>
                <li style="margin-bottom: 8px;">⚡ Earn XP and level up</li>
                <li style="margin-bottom: 8px;">🏅 Compete with friends on leaderboards</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${window.location.origin}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Start Crushing Goals →</a>
            </div>
            
            <p style="font-size: 14px; color: #71717a; text-align: center; margin: 0;">
              Let's make it happen! 💪<br>
              The CrushGoals Team
            </p>
          </div>
        </body>
      </html>
    `;

    return sendEmail({
      to: email,
      subject: "Welcome to CrushGoals! 🏆 Let's crush some goals",
      html,
    });
  };

  const sendFriendInviteEmail = async (
    inviteeEmail: string,
    inviterName: string,
    goalName?: string,
    goalEmoji?: string
  ): Promise<boolean> => {
    const hasGoal = goalName && goalEmoji;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0b; color: #ffffff; margin: 0; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1f 0%, #0d0d10 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="font-size: 48px; margin-bottom: 16px;">${hasGoal ? goalEmoji : '👋'}</div>
              <h1 style="margin: 0; font-size: 28px; color: #ffffff;">${hasGoal ? `${inviterName} challenged you!` : `${inviterName} wants to crush goals with you!`}</h1>
            </div>
            
            ${hasGoal ? `
            <div style="background: rgba(99, 102, 241, 0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(99, 102, 241, 0.2); text-align: center;">
              <div style="font-size: 32px; margin-bottom: 8px;">${goalEmoji}</div>
              <h2 style="margin: 0; color: #6366f1; font-size: 20px;">${goalName}</h2>
              <p style="margin: 8px 0 0 0; color: #a1a1aa; font-size: 14px;">Compete on the leaderboard!</p>
            </div>
            ` : ''}
            
            <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
              ${hasGoal 
                ? `${inviterName} wants you to join them in crushing this goal together on CrushGoals.`
                : `Your friend ${inviterName} has invited you to join them on CrushGoals — the app that makes achieving your goals fun and social.`
              }
            </p>
            
            <div style="background: rgba(34, 197, 94, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid rgba(34, 197, 94, 0.2);">
              <h3 style="margin: 0 0 12px 0; color: #22c55e;">Why join?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #a1a1aa;">
                <li style="margin-bottom: 8px;">🏆 Compete on the leaderboard together</li>
                <li style="margin-bottom: 8px;">🔥 Keep each other accountable</li>
                <li style="margin-bottom: 8px;">💪 Celebrate wins as a team</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${window.location.origin}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">${hasGoal ? 'Accept Challenge' : `Join ${inviterName} on CrushGoals`} →</a>
            </div>
            
            <p style="font-size: 14px; color: #71717a; text-align: center; margin: 0;">
              See you on the leaderboard! 🎯
            </p>
          </div>
        </body>
      </html>
    `;

    return sendEmail({
      to: inviteeEmail,
      subject: hasGoal 
        ? `${inviterName} challenged you to crush "${goalName}"! ${goalEmoji}`
        : `${inviterName} invited you to CrushGoals! 🎯`,
      html,
    });
  };

  const sendSharedGoalInviteEmail = async (
    inviteeEmail: string,
    inviterName: string,
    goalName: string,
    goalEmoji: string
  ): Promise<boolean> => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0b; color: #ffffff; margin: 0; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1f 0%, #0d0d10 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="font-size: 48px; margin-bottom: 16px;">${goalEmoji}</div>
              <h1 style="margin: 0; font-size: 24px; color: #ffffff;">You're invited to join a shared goal!</h1>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
              <strong style="color: #ffffff;">${inviterName}</strong> wants you to join them in crushing:
            </p>
            
            <div style="background: rgba(99, 102, 241, 0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(99, 102, 241, 0.2); text-align: center;">
              <div style="font-size: 32px; margin-bottom: 8px;">${goalEmoji}</div>
              <h2 style="margin: 0; color: #6366f1; font-size: 20px;">${goalName}</h2>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
              Work together, stay accountable, and celebrate wins as a team!
            </p>
            
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${window.location.origin}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Accept Invitation →</a>
            </div>
            
            <p style="font-size: 14px; color: #71717a; text-align: center; margin: 0;">
              Let's crush this goal together! 💪
            </p>
          </div>
        </body>
      </html>
    `;

    return sendEmail({
      to: inviteeEmail,
      subject: `${inviterName} invited you to join "${goalName}" ${goalEmoji}`,
      html,
    });
  };

  const sendStreakReminderEmail = async (
    email: string,
    name: string,
    currentStreak: number
  ): Promise<boolean> => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0b; color: #ffffff; margin: 0; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1f 0%, #0d0d10 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="font-size: 48px; margin-bottom: 16px;">🔥</div>
              <h1 style="margin: 0; font-size: 28px; color: #f97316;">Don't lose your streak!</h1>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
              Hey ${name}! Your <strong style="color: #f97316;">${currentStreak}-day streak</strong> is at risk!
            </p>
            
            <div style="background: rgba(249, 115, 22, 0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(249, 115, 22, 0.2); text-align: center;">
              <div style="font-size: 48px; font-weight: bold; color: #f97316; margin-bottom: 8px;">${currentStreak}</div>
              <div style="color: #a1a1aa;">days strong</div>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
              Complete at least one task today to keep your streak alive. You've worked too hard to lose it now!
            </p>
            
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${window.location.origin}/tasks" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Complete a Task Now →</a>
            </div>
            
            <p style="font-size: 14px; color: #71717a; text-align: center; margin: 0;">
              Keep the fire burning! 🔥
            </p>
          </div>
        </body>
      </html>
    `;

    return sendEmail({
      to: email,
      subject: `🔥 Your ${currentStreak}-day streak is at risk!`,
      html,
    });
  };

  return {
    sendEmail,
    sendWelcomeEmail,
    sendFriendInviteEmail,
    sendSharedGoalInviteEmail,
    sendStreakReminderEmail,
  };
}
