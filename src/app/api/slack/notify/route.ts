import { slackService } from "@/lib/services/slack";
import { NextResponse } from "next/server";
import { rateLimit, getIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = getIp(req);
  if (!rateLimit(ip, 30)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { webhookUrl, method, args } = await req.json();

    if (!webhookUrl) {
      return NextResponse.json({ error: "Missing webhookUrl" }, { status: 400 });
    }

    if (!method || !Array.isArray(args)) {
      return NextResponse.json({ error: "Invalid notification request" }, { status: 400 });
    }

    const service = slackService as Record<string, (...a: unknown[]) => Promise<unknown>>;
    if (typeof service[method] !== "function") {
      return NextResponse.json({ error: `Unknown method: ${method}` }, { status: 400 });
    }

    await service[method](webhookUrl, ...args);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Slack Notify Proxy Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
