import { Worker } from "bullmq";
import { redisConnection } from "../queue/connection.js";
import type { AnalyzeDialogueJob } from "../queue/queues.js";
import { supabase } from "../supabase.js";
import { analyzeDialogue } from "../claude/analyzeDialogue.js";
import { sendBotMessage } from "../telegram/botClient.js";

export const analysisWorker = new Worker<AnalyzeDialogueJob>(
  "analysis",
  async (job) => {
    const { dialogueId } = job.data;

    const { data: dialogue } = await supabase
      .from("dialogues")
      .select("id, manager_id, company_id, managers(telegram_bot_chat_id)")
      .eq("id", dialogueId)
      .single();
    if (!dialogue) return;

    const { data: messages } = await supabase
      .from("messages")
      .select("sender_type, text")
      .eq("dialogue_id", dialogueId)
      .order("sent_at", { ascending: true })
      .limit(50);
    if (!messages?.length) return;

    const analysis = await analyzeDialogue(
      messages.map((m) => ({ senderType: m.sender_type as "manager" | "client", text: m.text })),
    );

    await supabase.from("analysis").insert({
      dialogue_id: dialogueId,
      script_compliance: { followed: analysis.script_followed },
      errors: analysis.errors,
      close_probability: analysis.close_probability,
      summary: analysis.summary,
    });

    await supabase
      .from("dialogues")
      .update({ funnel_stage: analysis.funnel_stage })
      .eq("id", dialogueId);

    if (analysis.hint_for_manager) {
      const { data: hint } = await supabase
        .from("hints")
        .insert({
          dialogue_id: dialogueId,
          manager_id: dialogue.manager_id,
          text: analysis.hint_for_manager,
        })
        .select("id")
        .single();

      const manager = Array.isArray(dialogue.managers) ? dialogue.managers[0] : dialogue.managers;
      if (hint && manager?.telegram_bot_chat_id) {
        await sendBotMessage(manager.telegram_bot_chat_id, `💡 ${analysis.hint_for_manager}`);
        await supabase.from("hints").update({ status: "sent" }).eq("id", hint.id);
      }
    }
  },
  { connection: redisConnection },
);
