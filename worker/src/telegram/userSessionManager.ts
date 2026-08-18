import { TelegramClient } from "teleproto";
import { StringSession } from "teleproto/sessions/index.js";
import { NewMessage, type NewMessageEvent } from "teleproto/events/index.js";
import { env } from "../env.js";
import { supabase } from "../supabase.js";
import { decryptSessionString } from "../crypto.js";
import { analysisQueue } from "../queue/queues.js";

const activeClients = new Map<string, TelegramClient>();

async function handleNewMessage(managerId: string, event: NewMessageEvent) {
  const message = event.message;
  const chatId = message.chatId?.valueOf();
  if (!chatId || !message.text) return;

  const { data: company } = await supabase
    .from("managers")
    .select("company_id")
    .eq("id", managerId)
    .single();
  if (!company) return;

  const { data: dialogue } = await supabase
    .from("dialogues")
    .upsert(
      {
        company_id: company.company_id,
        manager_id: managerId,
        telegram_chat_id: chatId,
        last_message_at: new Date().toISOString(),
      },
      { onConflict: "manager_id,telegram_chat_id" },
    )
    .select("id")
    .single();
  if (!dialogue) return;

  await supabase.from("messages").insert({
    dialogue_id: dialogue.id,
    sender_type: message.out ? "manager" : "client",
    text: message.text,
    telegram_message_id: message.id,
    sent_at: new Date((message.date ?? Date.now() / 1000) * 1000).toISOString(),
  });

  await analysisQueue.add("analyze", { dialogueId: dialogue.id });
}

export async function startManagerSession(managerId: string, encryptedSessionString: string) {
  const sessionString = decryptSessionString(encryptedSessionString);
  const client = new TelegramClient(
    new StringSession(sessionString),
    env.telegramApiId,
    env.telegramApiHash,
    { connectionRetries: 5 },
  );

  await client.connect();
  client.addEventHandler((event: NewMessageEvent) => handleNewMessage(managerId, event), new NewMessage({}));

  activeClients.set(managerId, client);
  console.log(`[telegram] сессия менеджера ${managerId} подключена`);
}

export async function startAllManagerSessions() {
  const { data: sessions } = await supabase
    .from("telegram_sessions")
    .select("manager_id, session_string_encrypted")
    .eq("status", "active");

  for (const session of sessions ?? []) {
    try {
      await startManagerSession(session.manager_id, session.session_string_encrypted);
    } catch (err) {
      console.error(`[telegram] не удалось подключить сессию менеджера ${session.manager_id}:`, err);
    }
  }
}

export function getManagerClient(managerId: string): TelegramClient | undefined {
  return activeClients.get(managerId);
}
