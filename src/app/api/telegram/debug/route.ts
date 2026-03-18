import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!url || !serviceKey || !botToken) {
    return NextResponse.json({
      error: "Missing env vars",
      hasUrl: !!url,
      hasServiceKey: !!serviceKey,
      hasBotToken: !!botToken,
      serviceKeyPreview: serviceKey ? serviceKey.substring(0, 20) + "..." : "MISSING",
      botTokenPreview: botToken ? botToken.substring(0, 10) + "..." : "MISSING",
    });
  }

  const supabase = createClient(url, serviceKey);

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, connect_code");

  return NextResponse.json({
    envCheck: { 
      hasUrl: true, 
      hasServiceKey: true, 
      hasBotToken: true,
      serviceKeyPreview: serviceKey.substring(0, 20) + "...",
      botTokenPreview: botToken.substring(0, 10) + "..."
    },
    queryResult: { data, error },
  });
}
