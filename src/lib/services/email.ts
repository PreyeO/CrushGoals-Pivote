import { getResendClient } from '../resend';

const FROM_EMAIL = process.env.EMAIL_FROM || 'team@hello.crushgoals.app';

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
          <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
            <h2>Hello!</h2>
            <p><strong>${hostName}</strong> has invited you to join their organization, <strong>${orgName}</strong>, on CrushGoals.</p>
            <p>CrushGoals helps teams stay aligned and smash their goals with radical simplicity.</p>
            <div style="margin: 32px 0;">
              <a href="${inviteLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Join Organization
              </a>
            </div>
            <p>If you have any questions, just reply to this email.</p>
            <p>Best,<br/>The CrushGoals Team</p>
          </div>
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
