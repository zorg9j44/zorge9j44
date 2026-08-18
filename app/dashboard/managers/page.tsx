import { createClient } from "@/lib/supabase/server";

export default async function ManagersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user!.id)
    .single();

  const { data: managers } = await supabase
    .from("managers")
    .select("id, display_name, telegram_user_id, auto_dozhim_enabled")
    .eq("company_id", profile!.company_id);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Менеджеры</h1>

      {!managers?.length ? (
        <div className="card mt-8">
          <p className="text-sm text-muted">
            Пока не подключено ни одного менеджера. Подключение Telegram-аккаунта менеджера
            появится после Этапа 2 (интеграция с Telegram User API).
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {managers.map((manager) => (
            <div key={manager.id} className="card flex items-center justify-between">
              <span>{manager.display_name}</span>
              <span className="text-sm text-muted">
                {manager.auto_dozhim_enabled ? "авто-дожим включён" : "авто-дожим выключен"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
