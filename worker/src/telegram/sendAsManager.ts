import { Api } from "teleproto";
import { getManagerClient } from "./userSessionManager.js";

function humanTypingDelayMs(text: string): number {
  const perCharMs = 60;
  const jitter = Math.random() * 2000;
  return Math.min(text.length * perCharMs + jitter, 15000);
}

export async function sendAsManager(managerId: string, telegramChatId: number, text: string) {
  const client = getManagerClient(managerId);
  if (!client) {
    throw new Error(`Нет активной Telegram-сессии для менеджера ${managerId}`);
  }

  await client.invoke(
    new Api.messages.SetTyping({
      peer: telegramChatId,
      action: new Api.SendMessageTypingAction(),
    }),
  );

  await new Promise((resolve) => setTimeout(resolve, humanTypingDelayMs(text)));

  await client.sendMessage(telegramChatId, { message: text });
}
