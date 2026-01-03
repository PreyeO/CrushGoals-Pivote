import { supabase } from "@/integrations/supabase/client";
import { logError, logDebug } from "@/lib/logger";

type EmailType = "welcome" | "otp" | "password_reset" | "friend_invite" | "shared_goal_invite" | "streak_reminder";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  email_type: EmailType;
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function useResendEmail() {
  const sendEmail = async (params: SendEmailParams): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke("send-email-resend", {
        body: params,
      });

      if (error) {
        logError("Error sending email", error);
        return false;
      }

      logDebug("Email sent successfully", data);
      return true;
    } catch (error) {
      logError("Error invoking email function", error);
      return false;
    }
  };

  const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
    const safeName = escapeHtml(name);
    const firstName = safeName.split(' ')[0] || safeName;
    const baseUrl = window.location.origin;

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
              <div style="font-size: 48px; margin-bottom: 16px;">🎯</div>
              <h1 style="margin: 0; font-size: 28px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Welcome to CrushGoals, ${firstName}!</h1>
            </div>
            
            <!-- Trial Badge -->
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <p style="margin: 0 0 8px; color: rgba(255,255,255,0.9); font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                🎁 YOUR FREE TRIAL
              </p>
              <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                7 DAYS
              </p>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                Unlimited access to all premium features
              </p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
              You've just unlocked <strong style="color: #ffffff;">7 days of unlimited access</strong> to everything CrushGoals has to offer. No credit card required - just pure goal-crushing power!
            </p>
            
            <div style="background: rgba(99, 102, 241, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid rgba(99, 102, 241, 0.2);">
              <h3 style="margin: 0 0 12px 0; color: #6366f1;">Here's what you can do:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #a1a1aa;">
                <li style="margin-bottom: 8px;">✅ Set unlimited goals across all categories</li>
                <li style="margin-bottom: 8px;">🔥 Build streaks and earn XP rewards</li>
                <li style="margin-bottom: 8px;">📊 Track your progress with detailed analytics</li>
                <li style="margin-bottom: 8px;">🏆 Unlock achievements and climb the leaderboard</li>
                <li style="margin-bottom: 8px;">👥 Share goals with friends for accountability</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${baseUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Start Crushing Goals →</a>
            </div>
            
            <!-- Urgency Note -->
            <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px;">
              <p style="margin: 0; color: #fbbf24; font-size: 14px;">
                ⏰ <strong>Pro tip:</strong> Users who set their first goal within 24 hours are 3x more likely to build lasting habits!
              </p>
            </div>
            
            <p style="font-size: 14px; color: #71717a; text-align: center; margin: 0;">
              Questions? Reply to this email - we're here to help!<br>
              The CrushGoals Team
            </p>
          </div>
        </body>
      </html>
    `;

    return sendEmail({
      to: email,
      subject: "🎯 Welcome to CrushGoals - Your 7-Day Free Trial Starts Now!",
      html,
      email_type: "welcome",
    });
  };

  const sendFriendInviteEmail = async (
    inviteeEmail: string,
    inviterName: string,
    goalName?: string,
    goalEmoji?: string
  ): Promise<boolean> => {
    const hasGoal = goalName && goalEmoji;
    const baseUrl = window.location.origin;

    const safeInviterName = escapeHtml(inviterName);
    const safeGoalName = goalName ? escapeHtml(goalName) : undefined;
    const safeGoalEmoji = goalEmoji ? escapeHtml(goalEmoji) : undefined;

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
              <div style="font-size: 48px; margin-bottom: 16px;">${hasGoal ? safeGoalEmoji : '🎯'}</div>
              <h1 style="margin: 0; font-size: 28px; color: #ffffff;">${safeInviterName} Wants to Grow with You!</h1>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px; text-align: center;">
              Hey there! ${safeInviterName} has invited you to join them on CrushGoals — the app that makes achieving your goals fun and social.
            </p>

            ${hasGoal ? `
            <div style="background: rgba(99, 102, 241, 0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(99, 102, 241, 0.2); text-align: center;">
              <p style="margin: 0 0 12px 0; color: #a1a1aa; font-size: 14px;">They want you to join them on this goal:</p>
              <div style="font-size: 32px; margin-bottom: 8px;">${safeGoalEmoji}</div>
              <h2 style="margin: 0; color: #6366f1; font-size: 20px;">${safeGoalName}</h2>
              <p style="margin: 12px 0 0 0; color: #a1a1aa; font-size: 14px;">Work together, stay accountable, and celebrate wins as a team!</p>
            </div>
            ` : ''}
            
            <div style="background: rgba(34, 197, 94, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid rgba(34, 197, 94, 0.2);">
              <h3 style="margin: 0 0 12px 0; color: #22c55e;">Why Join CrushGoals?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #a1a1aa; line-height: 1.8;">
                <li style="margin-bottom: 8px;">🎯 Set meaningful goals and track your progress</li>
                <li style="margin-bottom: 8px;">🔥 Build daily streaks to stay consistent</li>
                <li style="margin-bottom: 8px;">🏆 Compete with friends on the leaderboard</li>
                <li style="margin-bottom: 8px;">💪 Celebrate wins together as a team</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${baseUrl}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Join ${safeInviterName} on CrushGoals →</a>
            </div>
            
            <p style="font-size: 14px; color: #71717a; text-align: center; margin: 0;">
              Let's crush some goals together! 💪
            </p>
          </div>
        </body>
      </html>
    `;

    return sendEmail({
      to: inviteeEmail,
      subject: hasGoal 
        ? `${safeInviterName} invited you to crush "${safeGoalName}" together! ${safeGoalEmoji}`
        : `${safeInviterName} invited you to join CrushGoals! 🎯`,
      html,
      email_type: "friend_invite",
    });
  };

  const sendSharedGoalInviteEmail = async (
    inviteeEmail: string,
    inviterName: string,
    goalName: string,
    goalEmoji: string
  ): Promise<boolean> => {
    const baseUrl = window.location.origin;
    const safeInviterName = escapeHtml(inviterName);
    const safeGoalName = escapeHtml(goalName);
    const safeGoalEmoji = escapeHtml(goalEmoji);

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
              <div style="font-size: 48px; margin-bottom: 16px;">${safeGoalEmoji}</div>
              <h1 style="margin: 0; font-size: 24px; color: #ffffff;">You're invited to join a shared goal!</h1>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
              <strong style="color: #ffffff;">${safeInviterName}</strong> wants you to join them in crushing:
            </p>
            
            <div style="background: rgba(99, 102, 241, 0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(99, 102, 241, 0.2); text-align: center;">
              <div style="font-size: 32px; margin-bottom: 8px;">${safeGoalEmoji}</div>
              <h2 style="margin: 0; color: #6366f1; font-size: 20px;">${safeGoalName}</h2>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
              Work together, stay accountable, and celebrate wins as a team!
            </p>
            
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${baseUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Accept Invitation →</a>
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
      subject: `${safeInviterName} invited you to join "${safeGoalName}" ${safeGoalEmoji}`,
      html,
      email_type: "shared_goal_invite",
    });
  };

  const sendStreakReminderEmail = async (
    email: string,
    name: string,
    currentStreak: number
  ): Promise<boolean> => {
    const safeName = escapeHtml(name);
    const baseUrl = window.location.origin;

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
              Hey ${safeName}! Your <strong style="color: #f97316;">${currentStreak}-day streak</strong> is at risk!
            </p>
            
            <div style="background: rgba(249, 115, 22, 0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(249, 115, 22, 0.2); text-align: center;">
              <div style="font-size: 48px; font-weight: bold; color: #f97316; margin-bottom: 8px;">${currentStreak}</div>
              <div style="color: #a1a1aa;">days strong</div>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
              Complete at least one task today to keep your streak alive. You've worked too hard to lose it now!
            </p>
            
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${baseUrl}/tasks" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Complete a Task Now →</a>
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
      email_type: "streak_reminder",
    });
  };

  const sendOtpEmail = async (
    email: string,
    name: string,
    otpCode: string
  ): Promise<boolean> => {
    const safeName = escapeHtml(name);
    const safeOtpCode = escapeHtml(otpCode);
    const baseUrl = window.location.origin;

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
              <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
              <h1 style="margin: 0; font-size: 28px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Verify Your Email</h1>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
              Hey ${safeName}! 👋
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
              Use the verification code below to confirm your email address:
            </p>
            
            <div style="background: rgba(99, 102, 241, 0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(99, 102, 241, 0.2); text-align: center;">
              <p style="margin: 0 0 8px 0; color: #a1a1aa; font-size: 14px;">Your Verification Code</p>
              <div style="font-size: 36px; font-weight: bold; color: #ffffff; letter-spacing: 8px; font-family: monospace;">${safeOtpCode}</div>
            </div>
            
            <p style="font-size: 14px; line-height: 1.6; color: #71717a; margin-bottom: 24px; text-align: center;">
              ⏱️ This code expires in <strong style="color: #f97316;">10 minutes</strong>
            </p>
            
            <p style="font-size: 14px; color: #71717a; text-align: center; margin: 0;">
              If you didn't create an account with CrushGoals, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;

    return sendEmail({
      to: email,
      subject: `${safeOtpCode} is your CrushGoals verification code 🔐`,
      html,
      email_type: "otp",
    });
  };

  const sendPasswordResetEmail = async (
    email: string,
    resetLink: string
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
              <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
              <h1 style="margin: 0; font-size: 28px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Reset Your Password</h1>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password →</a>
            </div>
            
            <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px;">
              <p style="margin: 0; color: #fbbf24; font-size: 14px;">
                ⏱️ This link expires in <strong>1 hour</strong>
              </p>
            </div>
            
            <p style="font-size: 14px; color: #71717a; text-align: center; margin: 0;">
              If you didn't request a password reset, you can safely ignore this email.<br>
              Your password will remain unchanged.
            </p>
          </div>
        </body>
      </html>
    `;

    return sendEmail({
      to: email,
      subject: "🔐 Reset your CrushGoals password",
      html,
      email_type: "password_reset",
    });
  };

  return {
    sendEmail,
    sendWelcomeEmail,
    sendFriendInviteEmail,
    sendSharedGoalInviteEmail,
    sendStreakReminderEmail,
    sendOtpEmail,
    sendPasswordResetEmail,
  };
}
