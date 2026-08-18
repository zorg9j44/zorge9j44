import { Worker } from "bullmq";
import { redisConnection } from "../queue/connection.js";
import type { AutoDozhimJob } from "../queue/queues.js";
import { supabase } from "../supabase.js";
import { generateAutoDozhimMessage } from "../claude/generateAutoDozhim.js";
import { sendAsManager } from "../telegram/sendAsManager.js";
import { sendBotMessage } from "../telegram/botClient.js";

const SILENCE_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;

export const autoDozhimWorker = new Worker<AutoDozhimJob>(
  "auto-dozhim",
  async (job) => {
    const { dialogueId } = job.data;

    const { data: dialogue } = await supabase
      .from("dialogues")
      .select("id, telegram_chat_id, last_message_at, manager_id, managers(auto_dozhim_enabled, telegram_bot_chat_id)")
      .eq("id", dialogueId)
      .single();
    if (!dialogue) return;

    const manager = Array.isArray(dialogue.managers) ? dialogue.managers[0] : dialogue.managers;
    if (!manager?.auto_dozhim_enabled) return;

    // Защита от дублей: если менеджер уже ответил с момента постановки задачи
    // в очередь (сам вернулся в диалог), проверяем актуальность тишины ещё раз.
    const silentSince = dialogue.last_message_at ? Date.now() - new Date(dialogue.last_message_at).getTime() : 0;
    if (silentSince < SILENCE_THRESHOLD_MS) return;

    const { data: recentMessages } = await supabase
      .from("messages")
      .select("sender_type, text")
      .eq("dialogue_id", dialogueId)
      .order("sent_at", { ascending: true })
      .limit(50);
    if (!recentMessages?.length) return;

    const managerStyleSample = recentMessages
      .filter((m) => m.sender_type === "manager")
      .slice(-10)
      .map((m) => m.text)
      .join("\n");
    const transcript = recentMessages.map((m) => `${m.sender_type}: ${m.text}`).join("\n");

    const messageText = await generateAutoDozhimMessage({
      managerStyleSample: managerStyleSample || "(нет предыдущих сообщений менеджера для стиля)",
      dialogueTranscript: transcript,
    });

    const { data: logEntry } = await supabase
      .from("auto_dozhim_log")
      .insert({ dialogue_id: dialogueId, message_text: messageText, status: "draft" })
      .select("id")
      .single();

    await sendAsManager(dialogue.manager_id, dialogue.telegram_chat_id, messageText);

    await supabase
      .from("messages")
      .insert({ dialogue_id: dialogueId, sender_type: "ai", text: messageText, sent_at: new Date().toISOString() });

    if (logEntry) {
      await supabase
        .from("auto_dozhim_log")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", logEntry.id);
    }

    if (manager.telegram_bot_chat_id) {
      await sendBotMessage(
        manager.telegram_bot_chat_id,
        `🤖 AI отправил сообщение молчащему клиенту от вашего имени:\n"${messageText}"`,
      );
    }
  },
  { connection: redisConnection },
);
