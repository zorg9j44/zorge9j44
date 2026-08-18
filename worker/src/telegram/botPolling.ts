// Простой long-polling для бота уведомлений. Обрабатывает только /start
// с deep-link параметром, который привязывает Telegram-чат менеджера или
// собственника к записи в БД (кнопка "Подключить Telegram-бота" в кабинете
// генерирует ссылку вида https://t.me/<bot>?start=manager_<managerId> или
// https://t.me/<bot>?start=owner_<companyId>).
import { env } from "../env.js";
import { supabase } from "../supabase.js";

const BOT_API = `https://api.telegram.org/bot${env.telegramBotToken}`;

interface TelegramUpdate {
  update_id: number;
  message?: {
    chat: { id: number };
    text?: string;
  };
}

async function handleStart(chatId: number, payload: string) {
  const [role, id] = payload.split("_");
  if (role === "manager" && id) {
    await supabase.from("managers").update({ telegram_bot_chat_id: chatId }).eq("id", id);
  } else if (role === "owner" && id) {
    await supabase.from("companies").update({ telegram_bot_chat_id: chatId }).eq("id", id);
  }
}

async function pollOnce(offset: number): Promise<number> {
  const response = await fetch(`${BOT_API}/getUpdates?offset=${offset}&timeout=30`);
  const data = (await response.json()) as { result: TelegramUpdate[] };

  for (const update of data.result) {
    const text = update.message?.text;
    const chatId = update.message?.chat.id;
    if (text?.startsWith("/start ") && chatId) {
      await handleStart(chatId, text.replace("/start ", "").trim());
    }
    offset = update.update_id + 1;
  }

  return offset;
}

export async function startBotPolling() {
  let offset = 0;
  console.log("[telegram] бот уведомлений запущен (long polling)");
  while (true) {
    try {
      offset = await pollOnce(offset);
    } catch (err) {
      console.error("[telegram] ошибка polling:", err);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
