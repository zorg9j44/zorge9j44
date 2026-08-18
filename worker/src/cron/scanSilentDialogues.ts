import { supabase } from "../supabase.js";
import { autoDozhimQueue } from "../queue/queues.js";

const SILENCE_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;

export async function scanSilentDialogues() {
  const cutoff = new Date(Date.now() - SILENCE_THRESHOLD_MS).toISOString();

  const { data: dialogues } = await supabase
    .from("dialogues")
    .select("id, manager_id, managers!inner(auto_dozhim_enabled)")
    .lt("last_message_at", cutoff)
    .not("funnel_stage", "in", "(closed_won,closed_lost)")
    .eq("managers.auto_dozhim_enabled", true);

  for (const dialogue of dialogues ?? []) {
    await autoDozhimQueue.add("auto-dozhim", { dialogueId: dialogue.id });
  }

  console.log(`[cron] авто-дожим: поставлено в очередь ${dialogues?.length ?? 0} диалогов`);
}
