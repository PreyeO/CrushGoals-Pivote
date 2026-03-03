"use server";

import { emailService } from "@/lib/services/email";

export async function sendInvitationEmailAction(params: {
    to: string;
    orgName: string;
    inviteLink: string;
    hostName: string;
}) {
    return await emailService.sendInvitationEmail(params);
}
