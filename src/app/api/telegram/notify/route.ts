import { telegramService } from "@/lib/services/telegram";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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
      const service = telegramService as any;
      if (typeof service[method] === "function") {
        await service[method](chatId, ...args);
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: "Invalid notification request" }, { status: 400 });
  } catch (error: any) {
    console.error("Telegram Notify Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
