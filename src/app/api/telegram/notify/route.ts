import { telegramService } from "@/lib/services/telegram";
import { NextResponse } from "next/server";
import { rateLimit, getIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = getIp(req);
  if (!rateLimit(ip, 30)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { chatId, type, data, method, args } = await req.json();

    if (!chatId) {
      return NextResponse.json({ error: "Missing chatId" }, { status: 400 });
    }

    // Handle generic sendNotification
    if (type && data) {
      await telegramService.sendNotification(chatId, type, data);
      return NextResponse.json({ success: true });
    }

    // Handle specific method calls (sendGoalCompletion, sendWelcome, etc.)
    if (method && Array.isArray(args)) {
      const service = telegramService as unknown as Record<string, (...args: any[]) => Promise<void>>;
      if (typeof service[method] === "function") {
        await service[method](chatId, ...args);
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: "Invalid notification request" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Telegram Notify Proxy Error";
    console.error("Telegram Notify Proxy Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
