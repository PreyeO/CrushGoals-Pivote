import { getResendClient } from '../resend';

const FROM_EMAIL = process.env.EMAIL_FROM || 'hello@crushgoals.app';

export const emailService = {
  async sendInvitationEmail({
    to,
    orgName,
    inviteLink,
    hostName,
  }: {
    to: string;
    orgName: string;
    inviteLink: string;
    hostName: string;
  }) {
    const resend = getResendClient();
    if (!resend) {
      console.error('Email sending skipped: Resend client not initialized (likely on the client side)');
      return { success: false, error: 'Not initialized' };
    }

    try {
      console.log(`Attempting to send invitation email to ${to} from ${FROM_EMAIL}`);
      const { data, error } = await resend.emails.send({
        from: `CrushGoals <${FROM_EMAIL}>`,
        to: [to],
        subject: `You've been invited to join ${orgName} on CrushGoals`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <!-- Brand -->
        <tr><td align="center" style="padding-bottom:28px;">
          <span style="font-size:22px;font-weight:900;letter-spacing:-0.5px;color:#0a1a0f;">🎯 CrushGoals</span>
        </td></tr>

        <!-- Card -->
        <tr><td style="border:1px solid #e5e7eb;border-radius:16px;padding:40px 36px;">
          <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#0a1a0f;letter-spacing:-0.3px;">
            You're Invited!
          </h2>
          <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:#6b7280;">
            <strong style="color:#0a1a0f;">${hostName}</strong> has invited you to join
            <strong style="color:#0a1a0f;">${orgName}</strong> on CrushGoals.
          </p>
          <a href="${inviteLink}"
             style="display:inline-block;padding:13px 32px;background-color:#0a1a0f;color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;">
            Join Organization
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:24px;">
          <p style="margin:0;font-size:11px;color:#9ca3af;">
            This invite expires in 7 days · If you didn't expect this, ignore it.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
        `,
      });

      if (error) {
        console.error('Resend email API error:', JSON.stringify(error, null, 2));
        return { success: false, error: error.message || 'Unknown Resend error' };
      }

      console.log('Invitation email sent successfully:', data?.id);
      return { success: true, data };
    } catch (error: any) {
      console.error('Critical failure in email service:', error);
      return { success: false, error: error.message || 'Critical email service failure' };
    }
  },
};
