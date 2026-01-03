export const CRUSHGOALS_FROM = "CrushGoals <no-reply@hello.crushgoals.app>";

// Inline SVG to avoid image blocking / broken icons in clients
export const CRUSHGOALS_MARK_SVG = `
<svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CrushGoals">
  <defs>
    <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect x="1" y="1" width="42" height="42" rx="14" fill="url(#cg)"/>
  <path d="M27.8 16.3c-1.4-1.2-3.2-1.8-5.4-1.8-2.2 0-4 .6-5.4 1.9-1.4 1.3-2.1 3.1-2.1 5.5 0 2.4.7 4.2 2 5.5 1.4 1.3 3.3 1.9 5.6 1.9 2.1 0 3.8-.5 5.1-1.6l-1.4-2c-.9.7-2 .9-3.4.9-1.4 0-2.5-.4-3.3-1.1-.8-.7-1.2-1.9-1.2-3.6 0-1.7.4-2.9 1.2-3.6.8-.7 1.9-1.1 3.3-1.1 1.5 0 2.6.4 3.5 1.1l1.5-2.1z" fill="#fff"/>
</svg>
`;

export function renderBrandedEmail(params: {
  title: string;
  preheader?: string;
  bodyHtml: string;
}): string {
  const preheader = params.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${params.preheader}</div>`
    : "";

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${params.title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0a0a0b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#ffffff;">
    ${preheader}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0b;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:linear-gradient(135deg,#1a1a1f 0%,#0d0d10 100%);border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.10);">
            <tr>
              <td style="padding:28px 28px 10px;text-align:center;">
                <div style="display:inline-block;line-height:0;">${CRUSHGOALS_MARK_SVG}</div>
                <h1 style="margin:14px 0 0;font-size:22px;line-height:1.25;color:#ffffff;">${params.title}</h1>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 28px 28px;">
                ${params.bodyHtml}
              </td>
            </tr>

            <tr>
              <td style="padding:18px 28px 26px;text-align:center;border-top:1px solid rgba(255,255,255,0.10);">
                <p style="margin:0;color:#71717a;font-size:12px;line-height:1.6;">
                  © ${new Date().getFullYear()} CrushGoals • If you didn’t request this, you can ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
