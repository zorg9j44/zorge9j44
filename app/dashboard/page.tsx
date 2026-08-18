import { createClient } from "@/lib/supabase/server";

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, companies(name, trial_ends_at, tariff_code)")
    .eq("id", user!.id)
    .single();

  const companyId = profile?.company_id;

  const [{ count: managerCount }, { count: dialogueCount }, { count: openHintCount }] =
    await Promise.all([
      supabase
        .from("managers")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId),
      supabase
        .from("dialogues")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId),
      supabase
        .from("hints")
        .select("id, dialogues!inner(company_id)", { count: "exact", head: true })
        .eq("status", "pending")
        .eq("dialogues.company_id", companyId),
    ]);

  const company = Array.isArray(profile?.companies) ? profile?.companies[0] : profile?.companies;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Обзор</h1>
      <p className="mt-1 text-sm text-muted">
        {company?.name} · триал до{" "}
        {company?.trial_ends_at
          ? new Date(company.trial_ends_at).toLocaleDateString("ru-RU")
          : "-"}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-muted">Менеджеров подключено</p>
          <p className="mt-2 text-3xl font-semibold">{managerCount ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-muted">Диалогов в работе</p>
          <p className="mt-2 text-3xl font-semibold">{dialogueCount ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-muted">Непрочитанных подсказок</p>
          <p className="mt-2 text-3xl font-semibold">{openHintCount ?? 0}</p>
        </div>
      </div>

      {managerCount === 0 && (
        <div className="card mt-8">
          <h2 className="text-lg font-semibold">Подключите первого менеджера</h2>
          <p className="mt-2 text-sm text-muted">
            Пока не подключён ни один Telegram-аккаунт менеджера - анализ переписок,
            подсказки и дожим лидов начнут работать сразу после подключения.
          </p>
        </div>
      )}
    </div>
  );
}
