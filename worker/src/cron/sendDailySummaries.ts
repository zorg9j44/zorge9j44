import { supabase } from "../supabase.js";
import { sendBotMessage } from "../telegram/botClient.js";

export async function sendDailySummaries() {
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, telegram_bot_chat_id")
    .not("telegram_bot_chat_id", "is", null);

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  for (const company of companies ?? []) {
    const [{ count: newDialogues }, { count: closedWon }, { count: closedLost }, { count: pendingHints }] =
      await Promise.all([
        supabase
          .from("dialogues")
          .select("id", { count: "exact", head: true })
          .eq("company_id", company.id)
          .gte("created_at", since),
        supabase
          .from("dialogues")
          .select("id", { count: "exact", head: true })
          .eq("company_id", company.id)
          .eq("funnel_stage", "closed_won")
          .gte("last_message_at", since),
        supabase
          .from("dialogues")
          .select("id", { count: "exact", head: true })
          .eq("company_id", company.id)
          .eq("funnel_stage", "closed_lost")
          .gte("last_message_at", since),
        supabase
          .from("hints")
          .select("id, dialogues!inner(company_id)", { count: "exact", head: true })
          .eq("status", "pending")
          .eq("dialogues.company_id", company.id),
      ]);

    const text = [
      `📊 Сводка за сутки — ${company.name}`,
      `Новых диалогов: ${newDialogues ?? 0}`,
      `Закрыто успешно: ${closedWon ?? 0}`,
      `Слито: ${closedLost ?? 0}`,
      `Открытых подсказок менеджерам: ${pendingHints ?? 0}`,
    ].join("\n");

    await sendBotMessage(company.telegram_bot_chat_id, text);

    await supabase.from("daily_summaries").insert({
      company_id: company.id,
      summary_date: new Date().toISOString().slice(0, 10),
      payload: { newDialogues, closedWon, closedLost, pendingHints },
      sent_at: new Date().toISOString(),
    });
  }

  console.log(`[cron] ежедневная сводка отправлена ${companies?.length ?? 0} компаниям`);
}
