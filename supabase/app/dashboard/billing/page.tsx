import { createClient } from "@/lib/supabase/server";
import { TARIFFS } from "@/lib/tariffs";
import { CheckoutButton } from "./checkout-button";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("companies(tariff_code)")
    .eq("id", user!.id)
    .single();

  const company = Array.isArray(profile?.companies) ? profile?.companies[0] : profile?.companies;
  const currentTariff = company?.tariff_code ?? "start";

  return (
    <div>
      <h1 className="text-2xl font-semibold">Тариф и оплата</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {TARIFFS.map((tariff) => (
          <div key={tariff.code} className="card flex flex-col">
            <h3 className="text-lg font-semibold">{tariff.name}</h3>
            <p className="mt-4 text-3xl font-semibold">
              {tariff.priceRub.toLocaleString("ru-RU")}{" "}
              <span className="text-base font-normal text-muted">₽/мес</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-sm text-muted">
              {tariff.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            {currentTariff === tariff.code ? (
              <span className="btn-ghost mt-8 cursor-default">Текущий тариф</span>
            ) : (
              <CheckoutButton tariffCode={tariff.code} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
