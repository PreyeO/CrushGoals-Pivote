import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const brevoApiKey = Deno.env.get("BREVO_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!brevoApiKey) {
      console.error("BREVO_API_KEY not configured");
      throw new Error("Email service not configured");
    }

    const { to, toName, subject, htmlContent, textContent }: EmailRequest = await req.json();

    console.log(`Sending email to: ${to}, subject: ${subject}`);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "CrushGoals",
          email: "team@crushgoals.app",
        },
        to: [
          {
            email: to,
            name: toName || to,
          },
        ],
        subject: subject,
        htmlContent: htmlContent,
        textContent: textContent || htmlContent.replace(/<[^>]*>/g, ""),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Brevo API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, messageId: data.messageId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
