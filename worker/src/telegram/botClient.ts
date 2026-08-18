import { env } from "../env.js";

const BOT_API = `https://api.telegram.org/bot${env.telegramBotToken}`;

export async function sendBotMessage(chatId: number | string, text: string): Promise<void> {
  const response = await fetch(`${BOT_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });

  if (!response.ok) {
    throw new Error(`Telegram Bot API sendMessage failed: ${response.status} ${await response.text()}`);
  }
}
