import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const update = await request.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // Проверяем, пришла ли команда /start
    if (update.message?.text === "/start") {
      const chatId = update.message.chat.id;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "👋 Добро пожаловать! Нажмите кнопку меню внизу слева, чтобы открыть каталог.",
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: true });
  }
}