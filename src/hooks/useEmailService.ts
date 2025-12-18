import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/logger';

interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export function useEmailService() {
  const sendEmail = async (params: SendEmailParams): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: params,
      });

      if (error) {
        logError('Email send error:', error);
        return false;
      }

      return data?.success ?? false;
    } catch (error) {
      logError('Email service error:', error);
      return false;
    }
  };

  const sendWelcomeEmail = async (email: string, name: string) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F172A; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.3); overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                      <span style="font-size: 40px;">🎯</span>
                    </div>
                    <h1 style="color: #FFFFFF; font-size: 28px; margin: 0 0 8px; font-weight: 700;">Welcome to CrushGoals! 🚀</h1>
                    <p style="color: #94A3B8; font-size: 16px; margin: 0;">Your journey to crushing every goal starts now</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <p style="color: #E2E8F0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Hey ${name}! 👋
                    </p>
                    <p style="color: #CBD5E1; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
                      You've just taken the first step towards transforming your life. CrushGoals isn't just another goal tracker – it's your personal accountability partner designed to help you actually achieve what you set out to do.
                    </p>
                    
                    <!-- Features -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td style="padding: 16px; background: rgba(139, 92, 246, 0.1); border-radius: 12px; margin-bottom: 12px;">
                          <table>
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <span style="font-size: 24px;">🎮</span>
                              </td>
                              <td>
                                <h3 style="color: #FFFFFF; font-size: 16px; margin: 0 0 4px; font-weight: 600;">Gamified Progress</h3>
                                <p style="color: #94A3B8; font-size: 14px; margin: 0;">Earn XP, unlock badges, and climb the leaderboard</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr><td style="height: 12px;"></td></tr>
                      <tr>
                        <td style="padding: 16px; background: rgba(16, 185, 129, 0.1); border-radius: 12px;">
                          <table>
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <span style="font-size: 24px;">🔥</span>
                              </td>
                              <td>
                                <h3 style="color: #FFFFFF; font-size: 16px; margin: 0 0 4px; font-weight: 600;">Streak Tracking</h3>
                                <p style="color: #94A3B8; font-size: 14px; margin: 0;">Build momentum with daily streaks and perfect days</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr><td style="height: 12px;"></td></tr>
                      <tr>
                        <td style="padding: 16px; background: rgba(245, 158, 11, 0.1); border-radius: 12px;">
                          <table>
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <span style="font-size: 24px;">📊</span>
                              </td>
                              <td>
                                <h3 style="color: #FFFFFF; font-size: 16px; margin: 0 0 4px; font-weight: 600;">Smart Analytics</h3>
                                <p style="color: #94A3B8; font-size: 14px; margin: 0;">Track your progress with beautiful charts and insights</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="https://crushgoals.app/dashboard" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); color: #FFFFFF; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);">
                            Start Crushing Goals →
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #CBD5E1; font-size: 15px; line-height: 1.6; margin: 20px 0 0;">
                      Your 7-day free trial has started. Make the most of it! 💪
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; border-top: 1px solid rgba(148, 163, 184, 0.2);">
                    <p style="color: #64748B; font-size: 13px; text-align: center; margin: 0;">
                      © 2024 CrushGoals. All rights reserved.<br>
                      <a href="https://crushgoals.app" style="color: #8B5CF6; text-decoration: none;">crushgoals.app</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return sendEmail({
      to: email,
      toName: name,
      subject: `Welcome to CrushGoals, ${name}! 🎯 Let's crush some goals!`,
      htmlContent,
    });
  };

  const sendSharedGoalInviteEmail = async (
    inviteeEmail: string,
    inviterName: string,
    goalName: string,
    goalEmoji: string,
    isExistingUser: boolean
  ) => {
    const ctaUrl = isExistingUser 
      ? 'https://crushgoals.app/dashboard'
      : 'https://crushgoals.app';
    
    const ctaText = isExistingUser
      ? 'View Invitation'
      : 'Join CrushGoals Free';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F172A; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.3); overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                      <span style="font-size: 40px;">👥</span>
                    </div>
                    <h1 style="color: #FFFFFF; font-size: 28px; margin: 0 0 8px; font-weight: 700;">You're Invited! 🎉</h1>
                    <p style="color: #94A3B8; font-size: 16px; margin: 0;">Join a shared goal and crush it together</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <p style="color: #E2E8F0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      <strong>${inviterName}</strong> wants you to join them on a goal journey!
                    </p>
                    
                    <!-- Goal Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; background: rgba(139, 92, 246, 0.15); border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.3);">
                      <tr>
                        <td style="padding: 24px; text-align: center;">
                          <span style="font-size: 48px; display: block; margin-bottom: 12px;">${goalEmoji || '🎯'}</span>
                          <h2 style="color: #FFFFFF; font-size: 20px; margin: 0; font-weight: 600;">${goalName}</h2>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #CBD5E1; font-size: 15px; line-height: 1.6; margin: 20px 0;">
                      ${isExistingUser 
                        ? 'Head to your dashboard to view and accept this invitation. You\'ll be able to track progress together and stay accountable!'
                        : 'Create your free CrushGoals account to join this shared goal. You\'ll get a 7-day free trial with all premium features!'}
                    </p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${ctaUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #FFFFFF; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);">
                            ${ctaText} →
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 20px 0 0; text-align: center;">
                      Goals are more fun together! 🤝
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; border-top: 1px solid rgba(148, 163, 184, 0.2);">
                    <p style="color: #64748B; font-size: 13px; text-align: center; margin: 0;">
                      © 2024 CrushGoals. All rights reserved.<br>
                      <a href="https://crushgoals.app" style="color: #8B5CF6; text-decoration: none;">crushgoals.app</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return sendEmail({
      to: inviteeEmail,
      subject: `${inviterName} invited you to crush a goal together! ${goalEmoji || '🎯'}`,
      htmlContent,
    });
  };

  const sendPasswordResetEmail = async (email: string, resetLink: string) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F172A; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.3); overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                      <span style="font-size: 40px;">🔐</span>
                    </div>
                    <h1 style="color: #FFFFFF; font-size: 28px; margin: 0 0 8px; font-weight: 700;">Reset Your Password</h1>
                    <p style="color: #94A3B8; font-size: 16px; margin: 0;">We received a request to reset your password</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <p style="color: #CBD5E1; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
                      Click the button below to create a new password. This link will expire in 1 hour for security reasons.
                    </p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${resetLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #FFFFFF; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);">
                            Reset Password →
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                      If you didn't request this password reset, you can safely ignore this email. Your password won't be changed.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; border-top: 1px solid rgba(148, 163, 184, 0.2);">
                    <p style="color: #64748B; font-size: 13px; text-align: center; margin: 0;">
                      © 2024 CrushGoals. All rights reserved.<br>
                      <a href="https://crushgoals.app" style="color: #8B5CF6; text-decoration: none;">crushgoals.app</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return sendEmail({
      to: email,
      subject: 'Reset your CrushGoals password 🔐',
      htmlContent,
    });
  };

  const sendStreakReminderEmail = async (email: string, name: string, currentStreak: number) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F172A; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border-radius: 16px; border: 1px solid rgba(239, 68, 68, 0.3); overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <span style="font-size: 64px; display: block; margin-bottom: 16px;">🔥</span>
                    <h1 style="color: #FFFFFF; font-size: 28px; margin: 0 0 8px; font-weight: 700;">Don't Lose Your Streak!</h1>
                    <p style="color: #94A3B8; font-size: 16px; margin: 0;">You're on a ${currentStreak}-day streak – keep it going!</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <p style="color: #E2E8F0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Hey ${name}! 👋
                    </p>
                    <p style="color: #CBD5E1; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
                      You still have tasks to complete today. Don't let all your hard work go to waste – your ${currentStreak}-day streak is on the line!
                    </p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="https://crushgoals.app/tasks" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: #FFFFFF; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);">
                            Complete Tasks Now →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; border-top: 1px solid rgba(148, 163, 184, 0.2);">
                    <p style="color: #64748B; font-size: 13px; text-align: center; margin: 0;">
                      © 2024 CrushGoals. All rights reserved.<br>
                      <a href="https://crushgoals.app" style="color: #8B5CF6; text-decoration: none;">crushgoals.app</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return sendEmail({
      to: email,
      toName: name,
      subject: `🔥 ${name}, your ${currentStreak}-day streak is at risk!`,
      htmlContent,
    });
  };

  const sendOtpEmail = async (email: string, name: string, otpCode: string) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F172A; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.3); overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                      <span style="font-size: 40px;">🔐</span>
                    </div>
                    <h1 style="color: #FFFFFF; font-size: 28px; margin: 0 0 8px; font-weight: 700;">Verify Your Email</h1>
                    <p style="color: #94A3B8; font-size: 16px; margin: 0;">Enter this code to complete your registration</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <p style="color: #E2E8F0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Hey ${name}! 👋
                    </p>
                    <p style="color: #CBD5E1; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
                      Thanks for signing up for CrushGoals! Use the verification code below to confirm your email address.
                    </p>
                    
                    <!-- OTP Code Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                      <tr>
                        <td align="center">
                          <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%); border: 2px solid rgba(139, 92, 246, 0.5); border-radius: 16px; padding: 24px 48px; display: inline-block;">
                            <p style="color: #94A3B8; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</p>
                            <p style="color: #FFFFFF; font-size: 40px; font-weight: 700; letter-spacing: 12px; margin: 0; font-family: 'Courier New', monospace;">${otpCode}</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 30px 0 0; text-align: center;">
                      ⏱️ This code expires in <strong style="color: #F59E0B;">10 minutes</strong>
                    </p>
                    
                    <p style="color: #64748B; font-size: 13px; line-height: 1.6; margin: 20px 0 0; text-align: center;">
                      If you didn't create an account with CrushGoals, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; border-top: 1px solid rgba(148, 163, 184, 0.2);">
                    <p style="color: #64748B; font-size: 13px; text-align: center; margin: 0;">
                      © 2024 CrushGoals. All rights reserved.<br>
                      <a href="https://crushgoals.app" style="color: #8B5CF6; text-decoration: none;">crushgoals.app</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return sendEmail({
      to: email,
      toName: name,
      subject: `${otpCode} is your CrushGoals verification code 🔐`,
      htmlContent,
    });
  };

  return {
    sendEmail,
    sendWelcomeEmail,
    sendSharedGoalInviteEmail,
    sendPasswordResetEmail,
    sendStreakReminderEmail,
    sendOtpEmail,
  };
}
