import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createPayment } from "@/lib/yookassa";
import { TARIFFS, type TariffCode } from "@/lib/tariffs";

export async function POST(request: Request) {
  const { tariffCode } = (await request.json()) as { tariffCode: TariffCode };
  const tariff = TARIFFS.find((t) => t.code === tariffCode);

  if (!tariff) {
    return NextResponse.json({ error: "Неизвестный тариф" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "owner") {
    return NextResponse.json({ error: "Только владелец может оплачивать тариф" }, { status: 403 });
  }

  const payment = await createPayment({
    amountRub: tariff.priceRub,
    description: `Нейро-РОП, тариф "${tariff.name}"`,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    metadata: { companyId: profile.company_id, tariffCode: tariff.code },
    idempotenceKey: randomUUID(),
  });

  return NextResponse.json({ confirmationUrl: payment.confirmation.confirmation_url });
}
