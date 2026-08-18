import { createClient } from "@/lib/supabase/server";

export default async function DialoguesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user!.id)
    .single();

  const { data: dialogues } = await supabase
    .from("dialogues")
    .select("id, client_display_name, funnel_stage, last_message_at")
    .eq("company_id", profile!.company_id)
    .order("last_message_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Диалоги</h1>

      {!dialogues?.length ? (
        <div className="card mt-8">
          <p className="text-sm text-muted">
            Диалоги появятся здесь после подключения менеджера и начала анализа переписок.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {dialogues.map((dialogue) => (
            <div key={dialogue.id} className="card flex items-center justify-between">
              <span>{dialogue.client_display_name ?? "Без имени"}</span>
              <span className="text-sm text-muted">{dialogue.funnel_stage}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
