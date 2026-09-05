import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user, phone, address, items, totalAmount } = body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.ADMIN_CHAT_ID;

    if (!botToken) {
      return NextResponse.json(
        { error: "Bot token not configured" },
        { status: 500 }
      );
    }

    // Собираем текст заказа
    const itemsList = items
      .map(
        (i: any) =>
          `▫️ ${i.title} — ${i.count} шт. по ${i.price.toLocaleString()} UZS`
      )
      .join("\n");

    const messageText =
      `⚡ <b>Новый заказ!</b>\n\n` +
      `👤 <b>Покупатель:</b> ${user?.first_name || "Клиент"} (@${user?.username || "-"})\n` +
      `📞 <b>Телефон:</b> ${phone}\n` +
      `📍 <b>Адрес:</b> ${address}\n\n` +
      `📦 <b>Товары:</b>\n${itemsList}\n\n` +
      `💰 <b>Итого:</b> ${Number(totalAmount).toLocaleString()} UZS`;

    // 1. Отправляем чек покупателю (если есть user.id)
    if (user?.id) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: user.id,
          text: messageText,
          parse_mode: "HTML",
        }),
      });
    }

    // 2. Отправляем уведомление владельцу магазина
    if (adminChatId) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: adminChatId,
          text: `🔔 <b>ВНИМАНИЕ! ПОСТУПИЛ НОВЫЙ ЗАКАЗ:</b>\n\n` + messageText,
          parse_mode: "HTML",
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  }
}